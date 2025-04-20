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

// Create new applicant with OTP
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

    // Generate new student ID, password and OTP
    const studentID = generateStudentID();
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
      password: plainPassword,
      temporaryPassword: plainPassword, // Store plain text temporarily
      status: 'Pending Verification',
      otp,
      otpExpires,
      verificationExpires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
    });

    await newApplicant.save();

    // Send OTP email - using sendOTP function
    try {
      await sendOTP(email, firstName, otp);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue even if email fails - we'll still create the account
    }

    res.status(201).json({
      message: 'Registration successful. Please check your email for verification code.',
      data: {
        studentID,
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

    return res.status(200).json({ message: 'Email is available' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const applicant = await EnrolleeApplicant.findOne({ email }).select('+temporaryPassword');

    if (!applicant) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Check if account is already verified
    if (applicant.status === 'Active') {
      return res.status(400).json({ message: 'Account is already verified' });
    }

    // Check if account is expired
    if (applicant.verificationExpires < new Date()) {
      applicant.status = 'Inactive';
      await applicant.save();
      return res.status(400).json({ message: 'Verification period has expired. Please register again.' });
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

    // Store the temporary password before saving
    const temporaryPassword = applicant.temporaryPassword;

    // Send credentials email first before removing the temporary password
    if (temporaryPassword) {
      try {
        await emailService.sendPasswordEmail(
          applicant.email,
          applicant.firstName,
          temporaryPassword,
          applicant.studentID
        );

        // Only clear after successful email send
        applicant.temporaryPassword = undefined;
      } catch (emailError) {
        console.error('Failed to send password email:', emailError);
        // Don't clear the temporary password if email fails,
        // this gives us a chance to retry later
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

// Add this new route before module.exports
router.get('/verification-status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const applicant = await EnrolleeApplicant.findOne({ email });

    if (!applicant) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const response = {
      status: applicant.status,
      firstName: applicant.firstName, // Add this line
      isLockedOut: applicant.otpAttemptLockout && applicant.otpAttemptLockout > new Date(),
      lockoutTimeLeft: applicant.otpAttemptLockout ? Math.ceil((applicant.otpAttemptLockout - new Date()) / 1000) : 0,
      otpTimeLeft: applicant.otpExpires ? Math.ceil((applicant.otpExpires - new Date()) / 1000) : 0,
      attemptsLeft: 3 - applicant.otpAttempts
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
        applicant.studentID
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

    const applicant = await EnrolleeApplicant.findOne({
      email,
      status: 'Pending Verification'
    });

    if (!applicant) {
      return res.status(404).json({ message: 'Account not found or already verified' });
    }

    // Generate new OTP using otpGenerator
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });

    // Update OTP and expiry
    applicant.otp = otp;
    applicant.otpExpires = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes
    applicant.otpAttempts = 0; // Reset attempts
    await applicant.save();

    // Send OTP email using sendOTP function
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

    // Find user with password selected
    const applicant = await EnrolleeApplicant.findOne({ email })
      .select('+password');

    if (!applicant) {
      return res.status(404).json({
        message: 'Account not found',
        errorType: 'account_not_found'
      });
    }

    // Check account status
    if (applicant.status === 'Pending Verification') {
      if (applicant.verificationExpires < new Date()) {
        applicant.status = 'Inactive';
        await applicant.save();
        return res.status(403).json({
          message: 'Verification period has expired. Please register again.',
          errorType: 'verification_expired'
        });
      }
      return res.status(403).json({
        message: 'Account requires email verification',
        errorType: 'pending_verification'
      });
    }

    // Debug: Log the input password and stored hash
    console.log('Input password:', password);
    console.log('Stored hash:', applicant.password);

    // Verify password
    const isMatch = await bcrypt.compare(password, applicant.password);
    console.log('Password match:', isMatch); // Debug log

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials',
        errorType: 'authentication'
      });
    }

    // Successful login
    res.json({
      message: 'Login successful',
      status: applicant.status,
      email: applicant.email,
      firstName: applicant.firstName,
      studentID: applicant.studentID
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login',
      errorType: 'server_error'
    });
  }
});

module.exports = router;