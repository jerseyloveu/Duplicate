const express = require('express');
const PDFDocument = require('pdfkit');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const SchoolLogoPath = path.join(__dirname, '../assets/SJDEFILogo.png');

router.post('/generate-waiver-pdf', (req, res) => {
  const { userData, waivedRequirements, academicYear, dateIssued, dateSigned } = req.body;

  if (!userData || !waivedRequirements || waivedRequirements.length === 0) {
    return res.status(400).json({ error: 'Missing required data' });
  }

  const doc = new PDFDocument({
    margin: 30,
    size: 'A4',
    info: {
      Title: 'Admission Waiver Form',
      Author: 'San Juan De Dios Educational Foundation, Inc.',
      Creator: 'JuanEMS System',
    },
  });

  const buffers = [];
  doc.on('data', (data) => buffers.push(data));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=waiver.pdf',
      'Content-Length': pdfData.length,
    });
    res.send(pdfData);
  });

  const marginLeft = doc.page.margins.left;
  const marginRight = doc.page.margins.right;
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const contentWidth = pageWidth - marginLeft - marginRight;

  // Header
  const headerHeight = 50;
  doc.rect(0, 0, pageWidth, headerHeight).fill('#00245A');
  doc.rect(0, headerHeight, pageWidth, 3).fill('#C68A00');
  const logoSize = 32;
  const logoY = (headerHeight - logoSize) / 2;
  if (fs.existsSync(SchoolLogoPath)) {
    doc.image(SchoolLogoPath, marginLeft, logoY, { width: logoSize, height: logoSize });
  }
  const textX = marginLeft + logoSize + 6;
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('#ffffff')
    .text('SAN JUAN DE DIOS EDUCATIONAL FOUNDATION, INC.', textX, logoY + 3, {
      width: contentWidth - textX + marginLeft,
    });
  doc
    .font('Helvetica-Oblique')
    .fontSize(8)
    .fillColor('#dddddd')
    .text('Where faith and reason are expressed in Charity.', textX, logoY + 18, {
      width: contentWidth - textX + marginLeft,
    });

  // Title (Centered, Distinct)
  let y = headerHeight + 20;
  doc
    .font('Helvetica-Bold')
    .fontSize(18)
    .fillColor('#000000')
    .text('Admission Waiver Form', marginLeft, y, { align: 'center', width: contentWidth });
  y += 30;

  // Academic Year and Date Issued
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#444444')
    .text(`Academic Year: ${academicYear}`, marginLeft, y, { width: contentWidth });
  y += 12;
  doc
    .font('Helvetica')
    .fontSize(10)
    .text(
      `Date Issued: ${new Date(dateIssued).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`,
      marginLeft,
      y,
      { width: contentWidth }
    );
  y += 20; // Increased gap before "To Whom It May Concern"

  // Letter Content
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('To Whom It May Concern,', marginLeft, y, { width: contentWidth });
  y += 15;
  const requestText =
    'May I request from your office to allow me to continue my admission process even I lack the following credentials listed below due to reason that:';
  doc
    .font('Helvetica')
    .fontSize(10)
    .text(requestText, marginLeft, y, { width: contentWidth });
  y += doc.heightOfString(requestText, { width: contentWidth }) + 8;

  // Reason
  const reason = waivedRequirements[0].waiverDetails.reason;
  doc
    .font('Helvetica')
    .fontSize(10)
    .text(reason, marginLeft + 12, y, { width: contentWidth - 12 });
  y += doc.heightOfString(reason, { width: contentWidth - 12 }) + 8;

  // Requirements List
  waivedRequirements.forEach((req, index) => {
    const reqText = `${index + 1}. ${req.name}`;
    doc
      .font('Helvetica')
      .fontSize(10)
      .text(reqText, marginLeft + 12, y, { width: contentWidth - 12 });
    y += doc.heightOfString(reqText, { width: contentWidth - 12 }) + 4;
  });

  // Promise Statement
  y += 8;
  const promiseDate = new Date(waivedRequirements[0].waiverDetails.promiseDate).toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );
  const promiseText = `I promise to submit my credentials on or before ${promiseDate}.`;
  doc
    .font('Helvetica')
    .fontSize(10)
    .text(promiseText, marginLeft, y, { width: contentWidth });
  y += doc.heightOfString(promiseText, { width: contentWidth }) + 8;

  const consequenceText =
    'I understand that failure to submit my credentials on the said date will automatically forfeit my admission in San Juan De Dios Educational Foundation, Inc. without any refund.';
  doc
    .font('Helvetica')
    .fontSize(10)
    .text(consequenceText, marginLeft, y, { width: contentWidth });
  y += doc.heightOfString(consequenceText, { width: contentWidth }) + 15;

  // Signature Section
  const maxContentY = pageHeight - marginLeft - 80; // Reserve more space for footer and signature
  if (y + 80 > maxContentY) {
    doc.addPage();
    y = marginLeft;
  }
  const userName = `${userData.firstName} ${userData.lastName}`;
  const dateTimeSigned = new Date(dateSigned).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Name and Date/Time Above Their Respective Lines
  doc
    .font('Helvetica')
    .fontSize(10)
    .text(userName, marginLeft, y, { width: contentWidth / 2, align: 'left' });
  doc
    .font('Helvetica')
    .fontSize(10)
    .text(dateTimeSigned, marginLeft + contentWidth / 2, y, {
      width: contentWidth / 2,
      align: 'right',
    });
  y += 18;

  // Two Signature Lines
  doc
    .moveTo(marginLeft, y)
    .lineTo(marginLeft + 180, y)
    .lineWidth(0.5)
    .strokeColor('#444444')
    .stroke();
  doc
    .moveTo(marginLeft + contentWidth / 1.5, y)
    .lineTo(marginLeft + contentWidth / 1.5 + 180, y)
    .lineWidth(0.5)
    .strokeColor('#444444')
    .stroke();
  y += 8;

  // Labels Below the Lines
  doc
    .font('Helvetica')
    .fontSize(8)
    .text('Signature over Printed Name', marginLeft, y, { width: contentWidth / 2, align: 'left' });
  doc
    .font('Helvetica')
    .fontSize(8)
    .text('Date and Time Signed', marginLeft + contentWidth / 2, y, {
      width: contentWidth / 2,
      align: 'right',
    });
  y += 12;

  // Footer
  if (y > maxContentY) {
    doc.addPage();
    y = marginLeft;
  } else {
    y = maxContentY;
  }
  doc
    .moveTo(marginLeft, y - 8)
    .lineTo(pageWidth - marginRight, y - 8)
    .lineWidth(0.5)
    .strokeColor('#C68A00')
    .stroke();
  doc
    .font('Helvetica')
    .fontSize(7)
    .fillColor('#444444')
    .text('Page 1 of 1', marginLeft, y, {
      width: pageWidth - marginLeft - marginRight,
      align: 'center',
    });
  doc
    .font('Helvetica')
    .fontSize(6)
    .fillColor('#990000')
    .text('San Juan De Dios Educational Foundation, Inc. © 2025', marginLeft, y + 10, {
      width: pageWidth - marginLeft - marginRight,
      align: 'center',
    });

  doc.end();
});

module.exports = router;