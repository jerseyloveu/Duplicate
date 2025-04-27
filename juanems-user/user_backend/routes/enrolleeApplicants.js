const express = require('express');
const router = express.Router();
const EnrolleeApplicant = require('../models/EnrolleeApplicant');
const emailService = require('../utils/emailService');
const { generateOTP, sendOTP } = require('../utils/emailService');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');

function generateStudentID() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${year}-${randomNum}`;
}

function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Add these new functions at the top of your routes file
async function getNextStudentIDSequence(academicYear) {
  // Extract last two digits of the starting year (e.g., "2025" -> "25")
  const yearShort = academicYear.split('-')[0].slice(-2);
  
  // Find the highest existing studentID with this year prefix
  const lastApplicant = await EnrolleeApplicant.findOne({
    studentID: new RegExp(`^${yearShort}-\\d{5}$`)
  }).sort({ studentID: -1 });

  if (!lastApplicant) {
    return `${yearShort}-00001`; // First student of the year
  }

  // Extract the numeric part and increment
  const lastNumber = parseInt(lastApplicant.studentID.split('-')[1], 10);
  const nextNumber = lastNumber + 1;
  
  // Pad with leading zeros to make 5 digits
  return `${yearShort}-${nextNumber.toString().padStart(5, '0')}`;
}

async function getNextApplicantIDSequence(academicYear) {
  // Extract full starting year (e.g., "2025-2026" -> "2025")
  const yearFull = academicYear.split('-')[0];
  
  // Find the highest existing applicantID with this year prefix
  const lastApplicant = await EnrolleeApplicant.findOne({
    applicantID: new RegExp(`^${yearFull}-\\d{6}$`)
  }).sort({ applicantID: -1 });

  if (!lastApplicant) {
    return `${yearFull}-000001`; // First applicant of the year
  }

  // Extract the numeric part and increment
  const lastNumber = parseInt(lastApplicant.applicantID.split('-')[1], 10);
  const nextNumber = lastNumber + 1;
  
  // Pad with leading zeros to make 6 digits
  return `${yearFull}-${nextNumber.toString().padStart(6, '0')}`;
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

    // Check for existing active or pending records with this email
    const existingActive = await EnrolleeApplicant.findOne({
      email,
      status: { $in: ['Pending Verification', 'Active'] }
    });

    if (existingActive) {
      return res.status(400).json({ error: 'Email is already registered with an active or pending application' });
    }

    // Generate IDs
    const studentID = await getNextStudentIDSequence(academicYear);
    const applicantID = await getNextApplicantIDSequence(academicYear);
    const plainPassword = generateRandomPassword();
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    // Create new record
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
      applicantID, // Include the new applicantID
      password: plainPassword,
      temporaryPassword: plainPassword,
      status: 'Pending Verification',
      otp,
      otpExpires,
      verificationExpires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
    });

    await newApplicant.save();

    // Send OTP email
    try {
      await sendOTP(email, firstName, otp);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.status(201).json({
      message: 'Registration successful. Please check your email for verification code.',
      data: {
        studentID,
        applicantID, // Include in response
        email,
        password: plainPassword,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Check email availability
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

    // Check for inactive account
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

    // No account exists
    return res.status(200).json({
      message: 'Email is available',
      status: 'Available'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP
// Update the verify-otp endpoint
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find the most recent Pending Verification account for this email
    const applicant = await EnrolleeApplicant.findOne({
      email,
      status: 'Pending Verification'
    }).sort({ createdAt: -1 }).select('+temporaryPassword');

    if (!applicant) {
      return res.status(404).json({ message: 'Account not found or already verified' });
    }

    // Check if account verification period has expired
    if (applicant.verificationExpires < new Date()) {
      applicant.status = 'Inactive';
      await applicant.save();
      return res.status(400).json({
        message: 'Verification period has expired. Please register again.'
      });
    }

    // Check if user is in lockout period
    if (applicant.otpAttemptLockout && applicant.otpAttemptLockout > new Date()) {
      const minutesLeft = Math.ceil((applicant.otpAttemptLockout - new Date()) / (1000 * 60));
      return res.status(429).json({
        message: `Too many attempts. Please try again in ${minutesLeft} minute(s).`,
        lockout: true
      });
    }

    // Check if OTP is expired
    if (!applicant.isOtpValid()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Check if OTP matches
    if (applicant.otp !== otp) {
      // Increment failed attempts
      applicant.otpAttempts += 1;
      applicant.lastOtpAttempt = new Date();

      // Check if we need to lock the account
      if (applicant.otpAttempts >= 3) {
        applicant.otpAttemptLockout = new Date(Date.now() + 5 * 60 * 1000); // 5 minute lockout
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

    // OTP is valid, update account status
    applicant.status = 'Active';
    applicant.otp = undefined;
    applicant.otpExpires = undefined;
    applicant.otpAttempts = 0;
    applicant.otpAttemptLockout = undefined;
    applicant.lastOtpAttempt = undefined;
    await applicant.save();

    // Mark any other pending accounts with this email as inactive
    await EnrolleeApplicant.updateMany(
      {
        email,
        status: 'Pending Verification',
        _id: { $ne: applicant._id } // Exclude the current applicant
      },
      {
        status: 'Inactive',
        inactiveReason: 'New registration completed'
      }
    );

    // Store the temporary password before saving
    const temporaryPassword = applicant.temporaryPassword;

    // Send credentials email first before removing the temporary password
    if (temporaryPassword) {
      try {
        await emailService.sendPasswordEmail(
          applicant.email,
          applicant.firstName,
          temporaryPassword,
          applicant.studentID,
          applicant.applicantID // Add this parameter
        );

        // Only clear after successful email send
        applicant.temporaryPassword = undefined;
      } catch (emailError) {
        console.error('Failed to send password email:', emailError);
        // Don't clear the temporary password if email fails
      }
    }

    // Save the applicant after email handling
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
      createdAt: applicant.createdAt.toISOString(), // Return as ISO string
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

// Add this route to enrolleeApplicants.js
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
        errorType: 'validation'
      });
    }

    // Find the applicant
    const applicant = await EnrolleeApplicant.findOne({ email });

    if (!applicant) {
      return res.status(404).json({
        message: 'Account not found',
        errorType: 'account_not_found'
      });
    }

    // Generate a secure random password
    const newPassword = generateRandomPassword();
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    applicant.password = hashedPassword;
    await applicant.save();

    // Send email with new password
    try {
      await emailService.sendPasswordEmail(
        applicant.email,
        applicant.firstName,
        newPassword,
        applicant.studentID,
        applicant.applicantID // Add this
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

// Add these new routes
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email exists
    const user = await EnrolleeApplicant.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });

    // In the /request-password-reset route
    user.passwordResetOtp = otp;
    user.passwordResetOtpExpires = new Date(Date.now() + 3 * 60 * 1000); // Changed from 10 to 3 minutes
    await user.save();

    // Send OTP email
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

    // Find user with passwordResetOtp selected
    const user = await EnrolleeApplicant.findOne({ email })
      .select('+passwordResetOtp +passwordResetOtpExpires +password');

    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Check OTP
    if (!user.passwordResetOtp || user.passwordResetOtp !== otp) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Check if OTP expired
    if (user.passwordResetOtpExpires < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    // Generate new password
    const newPassword = generateRandomPassword();
    console.log('Generated new password:', newPassword); // Debug log

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log('Hashed password:', hashedPassword); // Debug log

    // Update password and clear OTP
    user.password = hashedPassword;
    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpires = undefined;
    user.lastPasswordReset = new Date();

    // Save the user
    await user.save();
    console.log('Password updated in database'); // Debug log

    // Send email with the new password
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

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find the most recent Pending Verification account
    const applicant = await EnrolleeApplicant.findOne({
      email,
      status: 'Pending Verification'
    }).sort({ createdAt: -1 });

    if (!applicant) {
      return res.status(404).json({ message: 'Account not found or already verified' });
    }

    // Check if user is in lockout period
    if (applicant.otpAttemptLockout && applicant.otpAttemptLockout > new Date()) {
      const minutesLeft = Math.ceil((applicant.otpAttemptLockout - new Date()) / (1000 * 60));
      return res.status(429).json({
        message: `Please wait ${minutesLeft} minute(s) before requesting a new OTP.`,
        lockout: true
      });
    }

    // Generate new OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });

    // Update OTP and reset attempt counters
    applicant.otp = otp;
    applicant.otpExpires = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes
    applicant.otpAttempts = 0;
    applicant.otpAttemptLockout = undefined;
    applicant.lastOtpAttempt = undefined;
    await applicant.save();

    // Send OTP email
    await sendOTP(email, applicant.firstName, otp);

    return res.status(200).json({
      message: 'New verification code sent to your email',
      expiresIn: 180 // 3 minutes in seconds
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ message: 'Server error while resending OTP' });
  }
});

// Add this new route to get password reset status
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
      isLockedOut: false, // No lockout for password reset (or implement if needed)
      lockoutTimeLeft: 0,
      otpTimeLeft: applicant.passwordResetOtpExpires
        ? Math.ceil((applicant.passwordResetOtpExpires - new Date()) / 1000)
        : 0,
      attemptsLeft: 3 // Reset attempts for password reset
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

    // Find the most recent ACTIVE account for this email
    const applicant = await EnrolleeApplicant.findOne({
      email: cleanEmail,
      status: 'Active'
    }).sort({ createdAt: -1 }).select('+password');

    if (!applicant) {
      // Check for pending verification
      const pendingAccount = await EnrolleeApplicant.findOne({
        email: cleanEmail,
        status: 'Pending Verification'
      }).sort({ createdAt: -1 });

      if (pendingAccount) {
        if (pendingAccount.verificationExpires < new Date()) {
          // Auto-clean expired verification
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

      // Check for inactive accounts
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

    // Track login attempt
    applicant.loginAttempts += 1;
    await applicant.save();

    // Verify password
    const isMatch = await bcrypt.compare(cleanPassword, applicant.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials',
        errorType: 'authentication'
      });
    }

    // Successful login - update activity
    applicant.activityStatus = 'Online';
    applicant.lastLogin = new Date();
    await applicant.save();

    // In your login route handler (enrolleeApplicants.js)
    res.json({
      message: 'Login successful',
      email: applicant.email,
      firstName: applicant.firstName,
      studentID: applicant.studentID,
      activityStatus: applicant.activityStatus,
      loginAttempts: applicant.loginAttempts,
      lastLogin: applicant.lastLogin,
      lastLogout: applicant.lastLogout,
      createdAt: applicant.createdAt.toISOString() // Make sure to convert to ISO string
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

    // If createdAt is provided, parse it properly
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

    // Update activity status
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

    // If createdAt is provided, parse it properly
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