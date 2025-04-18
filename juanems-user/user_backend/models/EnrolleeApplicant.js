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
  academicTerm: { type: String, required: true },
  academicStrand: { type: String, required: true },
  academicLevel: { type: String, required: true },
  studentID: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  temporaryPassword: { type: String, select: false },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending Verification'],
    default: 'Pending Verification',
  },
  createdAt: { type: Date, default: Date.now },
  // New OTP related fields
  otp: { type: String },
  otpExpires: { type: Date },
  otpAttempts: { 
    type: Number, 
    default: 0 
  },
  otpAttemptLockout: { 
    type: Date 
  },
  lastOtpAttempt: { 
    type: Date 
  },
  verificationExpires: { 
    type: Date, 
    default: () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
  }
});

// Hash password before save
enrolleeApplicantSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check if OTP is valid
enrolleeApplicantSchema.methods.isOtpValid = function() {
  return this.otp && this.otpExpires && this.otpExpires > Date.now();
};

// Add this to your EnrolleeApplicant model file, before the module.exports
enrolleeApplicantSchema.methods.getPlainPassword = async function() {
  // We need to fetch the document again with the temporaryPassword selected
  const user = await this.model('EnrolleeApplicant')
    .findById(this._id)
    .select('+temporaryPassword')
    .exec();
  return user.temporaryPassword;
};

module.exports = mongoose.model('EnrolleeApplicant', enrolleeApplicantSchema);