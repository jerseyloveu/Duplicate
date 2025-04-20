const express = require('express');
const router = express.Router();
const pdfService = require('../services/pdf-service');
const Account = require('../models/Accounts');

router.get('/accounts', async (req, res) => {
  try {
    const accounts = await Account.find().lean();
    
    // Get current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];
    const fileName = `accounts-report-${currentDate}.pdf`;
    
    // Log the file name to confirm the correct format
    console.log('Generated file name:', fileName);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Log the headers to confirm
    console.log('Response Headers:', res.getHeaders());

    // Create and send the PDF file
    pdfService.buildPDF(accounts, (chunk) => res.write(chunk), () => res.end());
  } catch (error) {
    console.error('Export failed:', error);
    res.status(500).json({ error: 'Failed to export accounts' });
  }
});

module.exports = router;
