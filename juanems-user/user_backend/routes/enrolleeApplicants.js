const express = require('express');
const router = express.Router();
const EnrolleeApplicant = require('../models/EnrolleeApplicant');
const AdditionalApplicantDetails = require('../models/AdditionalApplicantDetails');
const emailService = require('../utils/emailService');
const { generateOTP, sendOTP } = require('../utils/emailService');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');

async function getNextStudentIDSequence(academicYear) {
  const yearShort = academicYear.split('-')[0].slice(-2);
  const lastApplicant = await EnrolleeApplicant.findOne({
    studentID: new RegExp(`^${yearShort}-\\d{5}$`)
  }).sort({ studentID: -1 });

  if (!lastApplicant) {
    return `${yearShort}-00001`;
  }

  const lastNumber = parseInt(lastApplicant.studentID.split('-')[1], 10);
  const nextNumber = lastNumber + 1;
  return `${yearShort}-${nextNumber.toString().padStart(5, '0')}`;
}

async function getNextApplicantIDSequence(academicYear) {
  const yearFull = academicYear.split('-')[0];
  const lastApplicant = await EnrolleeApplicant.findOne({
    applicantID: new RegExp(`^${yearFull}-\\d{6}$`)
  }).sort({ applicantID: -1 });

  if (!lastApplicant) {
    return `${yearFull}-000001`;
  }

  const lastNumber = parseInt(lastApplicant.applicantID.split('-')[1], 10);
  const nextNumber = lastNumber + 1;
  return `${yearFull}-${nextNumber.toString().padStart(6, '0')}`;
}

function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      dob,
      email,
      mobile,
      nationality,
      academicYear,
      academicTerm,
      academicStrand,
      academicLevel,
    } = req.body;

    const existingActive = await EnrolleeApplicant.findOne({
      email,
      status: { $in: ['Pending Verification', 'Active'] }
    });

    if (existingActive) {
      return res.status(400).json({ error: 'Email is already registered with an active or pending application' });
    }

    const studentID = await getNextStudentIDSequence(academicYear);
    const applicantID = await getNextApplicantIDSequence(academicYear);
    const plainPassword = generateRandomPassword();
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 3 * 60 * 1000);

    const newApplicant = new EnrolleeApplicant({
      firstName,
      middleName,
      lastName,
      dob,
      email,
      mobile,
      nationality,
      academicYear,
      academicTerm,
      academicStrand,
      academicLevel,
      studentID,
      applicantID,
      password: plainPassword,
      temporaryPassword: plainPassword,
      status: 'Pending Verification',
      otp,
      otpExpires,
      verificationExpires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    });

    await newApplicant.save();

    // Initialize additional details
    const additionalDetails = new AdditionalApplicantDetails({
      email,
    });
    await additionalDetails.save();

    try {
      await sendOTP(email, firstName, otp);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.status(201).json({
      message: 'Registration successful. Please check your email for verification code.',
      data: {
        studentID,
        applicantID,
        email,
        password: plainPassword,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

router.get('/check-email/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const existing = await EnrolleeApplicant.findOne({
      email,
      status: { $in: ['Pending Verification', 'Active'] }
    });

    if (existing) {
      return res.status(409).json({ message: 'Email is already registered with an active or pending application' });
    }

    const existingInactive = await EnrolleeApplicant.findOne({
      email,
      status: 'Inactive'
    });

    if (existingInactive) {
      return res.status(200).json({
        message: 'Email is available (previous inactive account exists)',
        status: 'Inactive'
      });
    }

    return res.status(200).json({
      message: 'Email is available',
      status: 'Available'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// New route to fetch personal details
router.get('/personal-details/:email', async (req, res) => {
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

    const additionalDetails = await AdditionalApplicantDetails.findOne({
      email: cleanEmail,
    });

    res.json({
      firstName: applicant.firstName,
      middleName: applicant.middleName || '',
      lastName: applicant.lastName,
      dob: applicant.dob,
      nationality: applicant.nationality,
      studentID: applicant.studentID,
      applicantID: applicant.applicantID,
      prefix: additionalDetails?.prefix || '',
      suffix: additionalDetails?.suffix || '',
      gender: additionalDetails?.gender || '',
      lrnNo: additionalDetails?.lrnNo || '',
      civilStatus: additionalDetails?.civilStatus || '',
      religion: additionalDetails?.religion || '',
      countryOfBirth: additionalDetails?.countryOfBirth || '',
      birthPlaceCity: additionalDetails?.birthPlaceCity || '',
      birthPlaceProvince: additionalDetails?.birthPlaceProvince || '',
    });
  } catch (error) {
    console.error('Error fetching personal details:', error);
    res.status(500).json({
      message: 'Server error while fetching personal details',
      errorType: 'server_error',
    });
  }
});

// New route to update personal details
router.put('/personal-details/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const cleanEmail = email.trim().toLowerCase();
    const {
      prefix,
      suffix,
      gender,
      lrnNo,
      civilStatus,
      religion,
      countryOfBirth,
      birthPlaceCity,
      birthPlaceProvince,
    } = req.body;

    const applicant = await EnrolleeApplicant.findOne({
      email: cleanEmail,
      status: 'Active',
    });

    if (!applicant) {
      return res.status(404).json({
        message: 'Active account not found',
        errorType: 'account_not_found',
      });
    }

    const updateData = {
      prefix: prefix || '',
      suffix: suffix || '',
      gender,
      lrnNo,
      civilStatus,
      religion,
      countryOfBirth,
      birthPlaceCity,
      birthPlaceProvince,
    };

    const updatedDetails = await AdditionalApplicantDetails.findOneAndUpdate(
      { email: cleanEmail },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Personal details updated successfully',
      data: updatedDetails,
    });
  } catch (error) {
    console.error('Error updating personal details:', error);
    res.status(500).json({
      message: 'Server error while updating personal details',
      errorType: 'server_error',
    });
  }
});

// New route to fetch entry level
router.get('/entry-level/:email', async (req, res) => {
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

    const additionalDetails = await AdditionalApplicantDetails.findOne({
      email: cleanEmail,
    });

    res.json({
      entryLevel: additionalDetails?.entryLevel || '',
    });
  } catch (error) {
    console.error('Error fetching entry level:', error);
    res.status(500).json({
      message: 'Server error while fetching entry level',
      errorType: 'server_error',
    });
  }
});

// New route to update entry level
router.put('/entry-level/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const cleanEmail = email.trim().toLowerCase();
    const { entryLevel } = req.body;

    const applicant = await EnrolleeApplicant.findOne({
      email: cleanEmail,
      status: 'Active',
    });

    if (!applicant) {
      return res.status(404).json({
        message: 'Active account not found',
        errorType: 'account_not_found',
      });
    }

    const updatedDetails = await AdditionalApplicantDetails.findOneAndUpdate(
      { email: cleanEmail },
      { $set: { entryLevel } },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Entry level updated successfully',
      data: updatedDetails,
    });
  } catch (error) {
    console.error('Error updating entry level:', error);
    res.status(500).json({
      message: 'Server error while updating entry level',
      errorType: 'server_error',
    });
  }
});

// Existing routes (unchanged)
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const applicant = await EnrolleeApplicant.findOne({
      email,
      status: 'Pending Verification'
    }).sort({ createdAt: -1 }).select('+temporaryPassword');

    if (!applicant) {
      return res.status(404).json({ message: 'Account not found or already verified' });
    }

    if (applicant.verificationExpires < new Date()) {
      applicant.status = 'Inactive';
      await applicant.save();
      return res.status(400).json({
        message: 'Verification period has expired. Please register again.'
      });
    }

    if (applicant.otpAttemptLockout && applicant.otpAttemptLockout > new Date()) {
      const minutesLeft = Math.ceil((applicant.otpAttemptLockout - new Date()) / (1000 * 60));
      return res.status(429).json({
        message: `Too many attempts. Please try again in ${minutesLeft} minute(s).`,
        lockout: true
      });
    }

    if (!applicant.isOtpValid()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (applicant.otp !== otp) {
      applicant.otpAttempts += 1;
      applicant.lastOtpAttempt = new Date();

      if (applicant.otpAttempts >= 3) {
        applicant.otpAttemptLockout = new Date(Date.now() + 5 * 60 * 1000);
        await applicant.save();
        return res.status(429).json({
          message: 'Too many incorrect attempts. Please try again in 5 minutes.',
          lockout: true
        });
      }

      await applicant.save();
      const attemptsLeft = 3 - applicant.otpAttempts;
      return res.status(400).json({
        message: `Invalid OTP. ${attemptsLeft} attempt(s) left.`,
        attemptsLeft
      });
    }

    applicant.status = 'Active';
    applicant.otp = undefined;
    applicant.otpExpires = undefined;
    applicant.otpAttempts = 0;
    applicant.otpAttemptLockout = undefined;
    applicant.lastOtpAttempt = undefined;
    await applicant.save();

    await EnrolleeApplicant.updateMany(
      {
        email,
        status: 'Pending Verification',
        _id: { $ne: applicant._id }
      },
      {
        status: 'Inactive',
        inactiveReason: 'New registration completed'
      }
    );

    const temporaryPassword = applicant.temporaryPassword;

    if (temporaryPassword) {
      try {
        await emailService.sendPasswordEmail(
          applicant.email,
          applicant.firstName,
          temporaryPassword,
          applicant.studentID,
          applicant.applicantID
        );
        applicant.temporaryPassword = undefined;
      } catch (emailError) {
        console.error('Failed to send password email:', emailError);
      }
    }

    await applicant.save();

    return res.status(200).json({
      message: 'Email verification successful. Your login credentials have been sent to your email.',
      data: {
        studentID: applicant.studentID,
        passwordSent: !!temporaryPassword
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ message: 'Server error during verification' });
  }
});

router.post('/verify-login-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const applicant = await EnrolleeApplicant.findOne({
      email,
      status: 'Active'
    }).sort({ createdAt: -1 }).select('+loginOtp +loginOtpExpires');

    if (!applicant) {
      return res.status(404).json({ message: 'Account not found or not active' });
    }

    if (applicant.loginOtpAttemptLockout && applicant.loginOtpAttemptLockout > new Date()) {
      const minutesLeft = Math.ceil((applicant.loginOtpAttemptLockout - new Date()) / (1000 * 60));
      return res.status(429).json({
        message: `Too many attempts. Please try again in ${minutesLeft} minute(s).`,
        lockout: true
      });
    }

    if (!applicant.loginOtp || !applicant.loginOtpExpires || applicant.loginOtpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (applicant.loginOtp !== otp) {
      applicant.loginOtpAttempts += 1;
      applicant.lastLoginOtpAttempt = new Date();

      if (applicant.loginOtpAttempts >= 3) {
        applicant.loginOtpAttemptLockout = new Date(Date.now() + 5 * 60 * 1000);
        await applicant.save();
        return res.status(429).json({
          message: 'Too many incorrect attempts. Please try again in 5 minutes.',
          lockout: true
        });
      }

      await applicant.save();
      const attemptsLeft = 3 - applicant.loginOtpAttempts;
      return res.status(400).json({
        message: `Invalid OTP. ${attemptsLeft} attempt(s) left.`,
        attemptsLeft
      });
    }

    applicant.activityStatus = 'Online';
    applicant.lastLogin = new Date();
    applicant.loginOtp = undefined;
    applicant.loginOtpExpires = undefined;
    applicant.loginOtpAttempts = 0;
    applicant.loginOtpAttemptLockout = undefined;
    applicant.lastLoginOtpAttempt = undefined;
    await applicant.save();

    res.json({
      message: 'Login successful',
      email: applicant.email,
      firstName: applicant.firstName,
      studentID: applicant.studentID,
      applicantID: applicant.applicantID,
      activityStatus: applicant.activityStatus,
      loginAttempts: applicant.loginAttempts,
      lastLogin: applicant.lastLogin,
      lastLogout: applicant.lastLogout,
      createdAt: applicant.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Login OTP verification error:', error);
    return res.status(500).json({ message: 'Server error during login OTP verification' });
  }
});

router.get('/verification-status/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const applicant = await EnrolleeApplicant.findOne({
      email
    }).sort({ createdAt: -1 });

    if (!applicant) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const response = {
      status: applicant.status,
      firstName: applicant.firstName,
      createdAt: applicant.createdAt.toISOString(),
      isLockedOut: applicant.otpAttemptLockout && applicant.otpAttemptLockout > new Date(),
      lockoutTimeLeft: applicant.otpAttemptLockout ?
        Math.ceil((applicant.otpAttemptLockout - new Date()) / 1000) : 0,
      otpTimeLeft: applicant.otpExpires ?
        Math.ceil((applicant.otpExpires - new Date()) / 1000) : 0,
      attemptsLeft: 3 - (applicant.otpAttempts || 0)
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting verification status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/login-otp-status/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const applicant = await EnrolleeApplicant.findOne({
      email,
      status: 'Active'
    }).sort({ createdAt: -1 });

    if (!applicant) {
      return res.status(404).json({ message: 'Account not found or not active' });
    }

    const response = {
      status: applicant.status,
      firstName: applicant.firstName,
      createdAt: applicant.createdAt.toISOString(),
      isLockedOut: applicant.loginOtpAttemptLockout && applicant.loginOtpAttemptLockout > new Date(),
      lockoutTimeLeft: applicant.loginOtpAttemptLockout ?
        Math.ceil((applicant.loginOtpAttemptLockout - new Date()) / 1000) : 0,
      otpTimeLeft: applicant.loginOtpExpires ?
        Math.ceil((applicant.loginOtpExpires - new Date()) / 1000) : 0,
      attemptsLeft: 3 - (applicant.loginOtpAttempts || 0)
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting login OTP status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/resend-login-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const applicant = await EnrolleeApplicant.findOne({
      email,
      status: 'Active'
    }).sort({ createdAt: -1 });

    if (!applicant) {
      return res.status(404).json({ message: 'Account not found or not active' });
    }

    if (applicant.loginOtpAttemptLockout && applicant.loginOtpAttemptLockout > new Date()) {
      const minutesLeft = Math.ceil((applicant.loginOtpAttemptLockout - new Date()) / (1000 * 60));
      return res.status(429).json({
        message: `Please wait ${minutesLeft} minute(s) before requesting a new OTP.`,
        lockout: true
      });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });

    applicant.loginOtp = otp;
    applicant.loginOtpExpires = new Date(Date.now() + 3 * 60 * 1000);
    applicant.loginOtpAttempts = 0;
    applicant.loginOtpAttemptLockout = undefined;
    applicant.lastLoginOtpAttempt = undefined;
    await applicant.save();

    await sendOTP(email, applicant.firstName, otp, 'login');

    return res.status(200).json({
      message: 'New verification code sent to your email',
      expiresIn: 180
    });
  } catch (error) {
    console.error('Resend login OTP error:', error);
    return res.status(500).json({ message: 'Server error while resending OTP' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
        errorType: 'validation'
      });
    }

    const applicant = await EnrolleeApplicant.findOne({ email });

    if (!applicant) {
      return res.status(404).json({
        message: 'Account not found',
        errorType: 'account_not_found'
      });
    }

    const newPassword = generateRandomPassword();
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    applicant.password = hashedPassword;
    await applicant.save();

    try {
      await emailService.sendPasswordEmail(
        applicant.email,
        applicant.firstName,
        newPassword,
        applicant.studentID,
        applicant.applicantID
      );

      return res.json({
        message: 'Password reset successful. New password has been sent to your email.',
      });
    } catch (emailError) {
      console.error('Failed to send password email:', emailError);
      return res.status(500).json({
        message: 'Password was reset but failed to send email. Please contact support.',
        errorType: 'email_failed'
      });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      message: 'Server error during password reset',
      errorType: 'server_error'
    });
  }
});

router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await EnrolleeApplicant.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });

    user.passwordResetOtp = otp;
    user.passwordResetOtpExpires = new Date(Date.now() + 3 * 60 * 1000);
    await user.save();

    await emailService.sendOTP(email, user.firstName, otp);

    res.json({
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Failed to process password reset request'
    });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await EnrolleeApplicant.findOne({ email })
      .select('+passwordResetOtp +passwordResetOtpExpires +password');

    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    if (!user.passwordResetOtp || user.passwordResetOtp !== otp) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (user.passwordResetOtpExpires < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    const newPassword = generateRandomPassword();
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpires = undefined;
    user.lastPasswordReset = new Date();

    await user.save();

    await emailService.sendPasswordResetEmail(
      email,
      user.firstName,
      newPassword,
      user.studentID
    );

    res.json({
      success: true,
      message: 'Password reset successful. Your new password has been sent to your email.'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      message: error.message || 'Failed to reset password'
    });
  }
});

router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const applicant = await EnrolleeApplicant.findOne({
      email,
      status: 'Pending Verification'
    }).sort({ createdAt: -1 });

    if (!applicant) {
      return res.status(404).json({ message: 'Account not found or already verified' });
    }

    if (applicant.otpAttemptLockout && applicant.otpAttemptLockout > new Date()) {
      const minutesLeft = Math.ceil((applicant.otpAttemptLockout - new Date()) / (1000 * 60));
      return res.status(429).json({
        message: `Please wait ${minutesLeft} minute(s) before requesting a new OTP.`,
        lockout: true
      });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });

    applicant.otp = otp;
    applicant.otpExpires = new Date(Date.now() + 3 * 60 * 1000);
    applicant.otpAttempts = 0;
    applicant.otpAttemptLockout = undefined;
    applicant.lastOtpAttempt = undefined;
    await applicant.save();

    await sendOTP(email, applicant.firstName, otp);

    return res.status(200).json({
      message: 'New verification code sent to your email',
      expiresIn: 180
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ message: 'Server error while resending OTP' });
  }
});

router.get('/password-reset-status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const applicant = await EnrolleeApplicant.findOne({ email });

    if (!applicant) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const response = {
      status: applicant.status,
      firstName: applicant.firstName,
      isLockedOut: false,
      lockoutTimeLeft: 0,
      otpTimeLeft: applicant.passwordResetOtpExpires
        ? Math.ceil((applicant.passwordResetOtpExpires - new Date()) / 1000)
        : 0,
      attemptsLeft: 3
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting password reset status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
        errorType: 'validation'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const applicant = await EnrolleeApplicant.findOne({
      email: cleanEmail,
      status: 'Active'
    }).sort({ createdAt: -1 }).select('+password');

    if (!applicant) {
      const pendingAccount = await EnrolleeApplicant.findOne({
        email: cleanEmail,
        status: 'Pending Verification'
      }).sort({ createdAt: -1 });

      if (pendingAccount) {
        if (pendingAccount.verificationExpires < new Date()) {
          pendingAccount.status = 'Inactive';
          pendingAccount.inactiveReason = 'Auto-cleaned expired verification';
          await pendingAccount.save();
          return res.status(403).json({
            message: 'Verification period expired. Please register again.',
            errorType: 'verification_expired'
          });
        }
        return res.status(403).json({
          message: 'Account requires email verification',
          errorType: 'pending_verification',
          email: pendingAccount.email,
          firstName: pendingAccount.firstName
        });
      }

      const inactiveAccount = await EnrolleeApplicant.findOne({
        email: cleanEmail,
        status: 'Inactive'
      });

      if (inactiveAccount) {
        return res.status(403).json({
          message: 'Account is inactive. Reason: ' +
            (inactiveAccount.inactiveReason || 'Unknown reason'),
          errorType: 'account_inactive'
        });
      }

      return res.status(404).json({
        message: 'Account not found',
        errorType: 'account_not_found'
      });
    }

    applicant.loginAttempts += 1;
    await applicant.save();

    const isMatch = await bcrypt.compare(cleanPassword, applicant.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials',
        errorType: 'authentication'
      });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });

    applicant.loginOtp = otp;
    applicant.loginOtpExpires = new Date(Date.now() + 3 * 60 * 1000);
    applicant.loginOtpAttempts = 0;
    applicant.loginOtpAttemptLockout = undefined;
    applicant.lastLoginOtpAttempt = undefined;
    await applicant.save();

    await sendOTP(applicant.email, applicant.firstName, otp, 'login');

    res.json({
      message: 'OTP sent for login verification',
      email: applicant.email,
      firstName: applicant.firstName
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login',
      errorType: 'server_error'
    });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { email, createdAt } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
        errorType: 'validation'
      });
    }

    let query = {
      email,
      status: 'Active'
    };

    if (createdAt) {
      const date = new Date(createdAt);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          message: 'Invalid createdAt timestamp',
          errorType: 'validation'
        });
      }
      query.createdAt = date;
    }

    const applicant = await EnrolleeApplicant.findOne(query)
      .sort({ createdAt: -1 });

    if (!applicant) {
      return res.status(404).json({
        message: 'Account not found',
        errorType: 'account_not_found'
      });
    }

    applicant.activityStatus = 'Offline';
    applicant.lastLogout = new Date();
    await applicant.save();

    res.json({
      message: 'Logout successful',
      activityStatus: applicant.activityStatus
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Server error during logout',
      errorType: 'server_error'
    });
  }
});

router.get('/activity/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { createdAt } = req.query;
    const cleanEmail = email.trim().toLowerCase();

    let query = {
      email: cleanEmail,
      status: 'Active'
    };

    if (createdAt) {
      const date = new Date(createdAt);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          message: 'Invalid createdAt timestamp',
          errorType: 'validation'
        });
      }
      query.createdAt = date;
    }

    const applicant = await EnrolleeApplicant.findOne(query)
      .sort({ createdAt: -1 });

    if (!applicant) {
      return res.status(404).json({
        message: 'Active account not found',
        errorType: 'account_not_found'
      });
    }

    res.json({
      activityStatus: applicant.activityStatus,
      loginAttempts: applicant.loginAttempts,
      lastLogin: applicant.lastLogin,
      lastLogout: applicant.lastLogout,
      accountCreatedAt: applicant.createdAt
    });
  } catch (error) {
    console.error('Activity fetch error:', error);
    res.status(500).json({
      message: 'Server error while fetching activity data',
      errorType: 'server_error'
    });
  }
});

module.exports = router;