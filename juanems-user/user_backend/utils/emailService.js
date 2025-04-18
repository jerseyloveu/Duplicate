const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const config = require('../config/emailConfig');
const User = require('../models/EnrolleeApplicant'); // Your user model


// Create transporter
const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
        user: config.auth.user,
        pass: config.auth.pass
    }
});

const generateOTP = () => {
  return otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false
  });
};

// Generate and send OTP
const sendOTP = async (email, name, otp) => {
  try {
    const mailOptions = {
      from: config.sender,
      to: email,
      subject: 'Your Account Verification OTP',
      text: `Hello ${name},\n\nYour OTP for account verification is: ${otp}\nThis OTP will expire in 3 minutes.`,
      html: `<p>Hello ${name},</p>
             <p>Your OTP for account verification is: <strong>${otp}</strong></p>
             <p>This OTP will expire in 3 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

// Verify OTP
const verifyOTP = async (email, otp) => {
  try {
      const user = await EnrolleeApplicant.findOne({ email });
      
      if (!user) {
          throw new Error('User not found');
      }

      // Check if user is in lockout period
      if (user.otpAttemptLockout && user.otpAttemptLockout > new Date()) {
          const minutesLeft = Math.ceil((user.otpAttemptLockout - new Date()) / (1000 * 60));
          throw new Error(`Too many attempts. Please try again in ${minutesLeft} minute(s).`);
      }

      // Check if OTP is expired
      if (user.otpExpires < new Date()) {
          throw new Error('OTP has expired');
      }

      // Verify OTP
      if (user.otp !== otp) {
          // Increment attempt counter
          user.otpAttempts += 1;
          user.lastOtpAttempt = new Date();
          
          // Check if we need to lock the account
          if (user.otpAttempts >= 3) {
              user.otpAttemptLockout = new Date(Date.now() + 5 * 60 * 1000); // 5 minute lockout
              await user.save();
              throw new Error('Too many incorrect attempts. Please try again in 5 minutes.');
          }
          
          await user.save();
          const attemptsLeft = 3 - user.otpAttempts;
          throw new Error(`Invalid OTP. ${attemptsLeft} attempt(s) left.`);
      }

      // Successful verification - reset attempt counters
      user.otp = undefined;
      user.otpExpires = undefined;
      user.otpAttempts = 0;
      user.otpAttemptLockout = undefined;
      user.lastOtpAttempt = undefined;
      user.status = 'Active';
      await user.save();

      return { success: true, message: 'Account verified successfully' };
  } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
  }
};

// Resend OTP
const resendOTP = async (email) => {
  try {
      const user = await EnrolleeApplicant.findOne({ 
          email,
          status: 'Pending Verification'
      });
      
      if (!user) {
          throw new Error('User not found or already verified');
      }

      // Check if user is in lockout period
      if (user.otpAttemptLockout && user.otpAttemptLockout > new Date()) {
          const minutesLeft = Math.ceil((user.otpAttemptLockout - new Date()) / (1000 * 60));
          throw new Error(`Please wait ${minutesLeft} minute(s) before requesting a new OTP.`);
      }

      // Generate new OTP
      const otp = otpGenerator.generate(6, {
          digits: true,
          lowerCaseAlphabets: false,
          upperCaseAlphabets: false,
          specialChars: false
      });

      // Reset attempt counters when resending
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + config.otpExpiry);
      user.otpAttempts = 0;
      user.otpAttemptLockout = undefined;
      user.lastOtpAttempt = undefined;
      await user.save();

      // Send email
      const mailOptions = {
          from: config.sender,
          to: email,
          subject: 'Your New Verification OTP',
          text: `Your new OTP is: ${otp}\nThis OTP will expire in 3 minutes.`,
          html: `<p>Your new OTP is: <strong>${otp}</strong></p><p>This OTP will expire in 3 minutes.</p>`
      };

      await transporter.sendMail(mailOptions);
      return { success: true, message: 'New OTP sent successfully' };
  } catch (error) {
      console.error('Error resending OTP:', error);
      throw error;
  }
};

// Check and expire unverified accounts (run this periodically, e.g., daily)
const expireUnverifiedAccounts = async () => {
    try {
        const expiryDate = new Date(Date.now() - config.accountVerificationExpiry);
        
        const result = await User.updateMany(
            { 
                status: 'Pending Verification',
                verificationSentAt: { $lt: expiryDate }
            },
            { 
                status: 'Inactive',
                inactiveReason: 'Verification period expired'
            }
        );

        return { success: true, expiredCount: result.nModified };
    } catch (error) {
        console.error('Error expiring unverified accounts:', error);
        throw error;
    }
};

module.exports = {
  generateOTP,
  sendOTP,
  verifyOTP,
  resendOTP,
  expireUnverifiedAccounts
};