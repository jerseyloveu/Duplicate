const EnrolleeApplicant = require('../models/EnrolleeApplicant');
const mongoose = require('mongoose');

async function cleanExpiredAccounts() {
  try {
    const result = await EnrolleeApplicant.updateMany(
      {
        status: 'Pending Verification',
        verificationExpires: { $lt: new Date() }
      },
      {
        $set: { status: 'Inactive' }
      }
    );
    
    console.log(`Cleaned ${result.nModified} expired accounts`);
  } catch (error) {
    console.error('Error cleaning expired accounts:', error);
  }
}

// Run every 6 hours
function startAccountCleaner() {
  cleanExpiredAccounts();
  setInterval(cleanExpiredAccounts, 6 * 60 * 60 * 1000);
}

module.exports = startAccountCleaner;