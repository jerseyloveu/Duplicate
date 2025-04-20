const PDFDocument = require('pdfkit');

function buildPDF(dataArray, dataCallback, endCallback) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  doc.on('data', dataCallback);
  doc.on('end', endCallback);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const tableTop = 100;
  const maxY = doc.page.height - 50;

  // Add row number column at start
  const columns = [
    { label: '#', property: '__rowNumber', width: 25 },
    { label: 'User ID', property: 'userID', width: 90 },
    { label: 'First Name', property: 'firstName', width: 70 },
    { label: 'Last Name', property: 'lastName', width: 70 },
    { label: 'Email', property: 'email', width: 140 },
    { label: 'Mobile', property: 'mobile', width: 80 },
    { label: 'Dept.', property: 'department', width: 80 },
    { label: 'Status', property: 'status', width: 60 },
  ];

  // Adjust column widths if needed
  let totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
  if (totalWidth > pageWidth) {
    const scale = pageWidth / totalWidth;
    columns.forEach(col => col.width = col.width * scale);
  }

  // Compute x positions
  const colX = [];
  columns.reduce((x, col, index) => {
    colX[index] = x;
    return x + col.width;
  }, doc.page.margins.left);

  // Draw table headers with grid
  const drawHeaders = (y) => {
    doc.font('Helvetica-Bold').fontSize(9);
    columns.forEach((col, i) => {
      doc.rect(colX[i], y, col.width, 20).strokeColor('#ccc').stroke(); // subtle border
      doc.text(col.label, colX[i] + 2, y + 6, {
        width: col.width - 4,
        align: 'left',
      });
    });
  };

  const currentDateTime = new Date().toLocaleString(); 

  doc.fontSize(16).text('Accounts Report', { align: 'center' });
  doc.fontSize(12).text('San Juan De Dios Education Foundation, Inc. ', { align: 'center' });
  doc.fontSize(10).text(`Generated on: ${currentDateTime}`, { align: 'center' }); // Add the generated date and time
  doc.moveDown();

  let y = tableTop;
  drawHeaders(y);
  y += 20;

  // Draw rows
  for (let i = 0; i < dataArray.length; i++) {
    const row = {
      ...dataArray[i],
      __rowNumber: (i + 1).toString(),
    };

    const rowHeights = columns.map(col => {
      const text = row[col.property] || '-';
      return doc.heightOfString(text, {
        width: col.width - 4,
        align: 'left',
      });
    });
    const rowHeight = Math.max(...rowHeights) + 6;

    if (y + rowHeight > maxY) {
      doc.addPage();
      y = 50;
      drawHeaders(y);
      y += 20;
    }

    columns.forEach((col, j) => {
      const text = row[col.property] || '-';

      // Draw border
      doc.rect(colX[j], y, col.width, rowHeight).strokeColor('#eee').stroke();

      // Draw text
      doc
        .font('Helvetica')
        .fontSize(8)
        .text(text, colX[j] + 2, y + 3, {
          width: col.width - 4,
          align: 'left',
        });
    });

    y += rowHeight;
  }

  doc.end();
}

module.exports = { buildPDF };
