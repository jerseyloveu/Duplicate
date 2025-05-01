const express = require('express');
const router = express.Router();
const EnrolleeApplicant = require('../models/EnrolleeApplicant');

// Fetch applicant personal details
router.get('/details/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const cleanEmail = email.trim().toLowerCase();

    const applicant = await EnrolleeApplicant.findOne({
      email: cleanEmail,
      status: 'Active',
    }).sort({ createdAt: -1 });

    if (!applicant) {
      return res.status(404).json({
        message: 'Active account not found',
        errorType: 'account_not_found',
      });
    }

    res.json({
      firstName: applicant.firstName,
      middleName: applicant.middleName || '',
      lastName: applicant.lastName,
      dob: applicant.dob,
      nationality: applicant.nationality,
      studentID: applicant.studentID,
      applicantID: applicant.applicantID,
      prefix: applicant.prefix || '',
      suffix: applicant.suffix || '',
      religion: applicant.religion || '',
      gender: applicant.gender || '',
      lrnNo: applicant.lrnNo || '',
      countryOfBirth: applicant.countryOfBirth || '',
      civilStatus: applicant.civilStatus || '',
      birthPlaceCity: applicant.birthPlaceCity || '',
      birthPlaceProvince: applicant.birthPlaceProvince || '',
    });
  } catch (error) {
    console.error('Error fetching applicant details:', error);
    res.status(500).json({
      message: 'Server error while fetching applicant details',
      errorType: 'server_error',
    });
  }
});

// Update applicant personal details
router.put('/details/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const cleanEmail = email.trim().toLowerCase();
    const {
      prefix,
      suffix,
      religion,
      gender,
      lrnNo,
      countryOfBirth,
      civilStatus,
      birthPlaceCity,
      birthPlaceProvince,
    } = req.body;

    const applicant = await EnrolleeApplicant.findOne({
      email: cleanEmail,
      status: 'Active',
    }).sort({ createdAt: -1 });

    if (!applicant) {
      return res.status(404).json({
        message: 'Active account not found',
        errorType: 'account_not_found',
      });
    }

    // Update fields
    applicant.prefix = prefix || '';
    applicant.suffix = suffix || '';
    applicant.religion = religion;
    applicant.gender = gender;
    applicant.lrnNo = lrnNo;
    applicant.countryOfBirth = countryOfBirth;
    applicant.civilStatus = civilStatus;
    applicant.birthPlaceCity = birthPlaceCity;
    applicant.birthPlaceProvince = birthPlaceProvince;

    await applicant.save();

    res.json({
      message: 'Personal information updated successfully',
    });
  } catch (error) {
    console.error('Error updating applicant details:', error);
    res.status(500).json({
      message: 'Server error while updating applicant details',
      errorType: 'server_error',
    });
  }
});

module.exports = router;