const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// models/EnrolleeApplicant.js
const enrolleeApplicantSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  middleName: { type: String, trim: true },
  lastName: { type: String, required: true, trim: true },
  dob: { type: Date, required: true },
  email: { type: String, required: true, trim: true },
  mobile: { type: String, required: true },
  nationality: { type: String, required: true },
  academicYear: { type: String, required: true },
  academicTerm: { type: String, fotografiarequired: true },
  academicStrand: { type: String, required: true },
  academicLevel: { type: String, required: true },
  studentID: { type: String, required: true, unique: true },
  applicantID: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  temporaryPassword: { type: String, select: false },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending Verification'],
    default: 'Pending Verification',
  },
  createdAt: { type: Date, default: Date.now },
  // OTP for registration
  otp: { type: String },
  otpExpires: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  otpAttemptLockout: { type: Date },
  lastOtpAttempt: { type: Date },
  // OTP for password reset
  passwordResetOtp: { type: String },
  passwordResetOtpExpires: { type: Date },
  lastPasswordReset: { type: Date },
  // New OTP for login
  loginOtp: { type: String },
  loginOtpExpires: { type: Date },
  loginOtpAttempts: { type: Number, default: 0 },
  loginOtpAttemptLockout: { type: Date },
  lastLoginOtpAttempt: { type: Date },
  verificationExpires: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
  },
  loginAttempts: { type: Number, default: 0 },
  activityStatus: {
    type: String,
    enum: ['Online', 'Offline'],
    default: 'Offline'
  },
  lastLogin: { type: Date },
  lastLogout: { type: Date },
  // New fields for additional personal information
  prefix: { type: String, trim: true, default: '' },
  suffix: { type: String, trim: true, default: '' },
  religion: { type: String, trim: true, required: true },
  gender: { type: String, trim: true, required: true },
  lrnNo: { type: String, trim: true, required: true },
  countryOfBirth: { type: String, trim: true, required: true },
  civilStatus: { type: String, trim: true, required: true },
  birthPlaceCity: { type: String, trim: true, required: true },
  birthPlaceProvince: { type: String, trim: true, required: true }
});

// Password hashing pre-save hook
enrolleeApplicantSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return next();
  }

  try {
    const cleanPassword = this.password.trim();
    console.log('Original password before hash:', cleanPassword);
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(cleanPassword, salt);
    console.log('Hashed password:', this.password);
    next();
  } catch (err) {
    console.error('Error hashing password:', err);
    next(err);
  }
});

// Method to check if OTP is valid
enrolleeApplicantSchema.methods.isOtpValid = function() {
  return this.otp && this.otpExpires && this.otpExpires > Date.now();
};

// Method to get temporary password
enrolleeApplicantSchema.methods.getPlainPassword = async function() {
  const user = await this.model('EnrolleeApplicant')
    .findById(this._id)
    .select('+temporaryPassword')
    .exec();
  return user.temporaryPassword;
};

module.exports = mongoose.model('EnrolleeApplicant', enrolleeApplicantSchema);