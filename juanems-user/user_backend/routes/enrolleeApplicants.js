const express = require('express');
const router = express.Router();
const EnrolleeApplicant = require('../models/EnrolleeApplicant');
const emailService = require('../utils/emailService');
const { generateOTP, sendOTP } = require('../utils/emailService');
const otpGenerator = require('otp-generator');

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

module.exports = router;