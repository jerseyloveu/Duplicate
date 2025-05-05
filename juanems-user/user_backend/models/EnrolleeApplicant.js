const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  applicantID: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  temporaryPassword: { type: String, select: false },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending Verification'],
    default: 'Pending Verification',
  },
  createdAt: { type: Date, default: Date.now },
  otp: { type: String },
  otpExpires: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  otpAttemptLockout: { type: Date },
  lastOtpAttempt: { type: Date },
  passwordResetOtp: { type: String },
  passwordResetOtpExpires: { type: Date },
  lastPasswordReset: { type: Date },
  loginOtp: { type: String },
  loginOtpExpires: { type: Date },
  loginOtpAttempts: { type: Number, default: 0 },
  loginOtpAttemptLockout: { type: Date },
  lastLoginOtpAttempt: { type: Date },
  verificationExpires: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
  loginAttempts: { type: Number, default: 0 },
  activityStatus: {
    type: String,
    enum: ['Online', 'Offline'],
    default: 'Offline',
  },
  lastLogin: { type: Date },
  lastLogout: { type: Date },
  prefix: { type: String, trim: true },
  suffix: { type: String, trim: true },
  gender: { type: String, trim: true },
  lrnNo: { type: String, trim: true },
  civilStatus: { type: String, trim: true },
  religion: { type: String, trim: true },
  birthDate: { type: String, trim: true },
  countryOfBirth: { type: String, trim: true },
  birthPlaceCity: { type: String, trim: true },
  birthPlaceProvince: { type: String, trim: true },
  entryLevel: { type: String, trim: true },
  presentHouseNo: { type: String, trim: true },
  presentBarangay: { type: String, trim: true },
  presentCity: { type: String, trim: true },
  presentProvince: { type: String, trim: true },
  presentPostalCode: { type: String, trim: true },
  permanentHouseNo: { type: String, trim: true },
  permanentBarangay: { type: String, trim: true },
  permanentCity: { type: String, trim: true },
  permanentProvince: { type: String, trim: true },
  permanentPostalCode: { type: String, trim: true },
  telephoneNo: { type: String, trim: true },
  emailAddress: { type: String, trim: true },
  elementarySchoolName: { type: String, trim: true },
  elementaryLastYearAttended: { type: String, trim: true },
  elementaryGeneralAverage: { type: String, trim: true },
  elementaryRemarks: { type: String, trim: true },
  juniorHighSchoolName: { type: String, trim: true },
  juniorHighLastYearAttended: { type: String, trim: true },
  juniorHighGeneralAverage: { type: String, trim: true },
  juniorHighRemarks: { type: String, trim: true },
  familyContacts: [{
    relationship: { type: String, trim: true },
    firstName: { type: String, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    occupation: { type: String, trim: true },
    houseNo: { type: String, trim: true },
    city: { type: String, trim: true },
    province: { type: String, trim: true },
    country: { type: String, trim: true },
    mobileNo: { type: String, trim: true },
    telephoneNo: { type: String, trim: true },
    emailAddress: { type: String, trim: true },
    isEmergencyContact: { type: Boolean, default: false }
  }],
  registrationStatus: {
    type: String,
    enum: ['Incomplete', 'Complete'],
    default: 'Incomplete'
  },
  preferredExamAndInterviewDate: { type: Date },
  preferredExamAndInterviewApplicationStatus: {
    type: String,
    enum: ['Incomplete', 'Complete'],
    default: 'Incomplete'
  },
  admissionRequirements: [{
    requirementId: { type: Number, required: true },
    name: { type: String, required: true },
    fileContent: { type: Buffer }, // Store file as binary data
    fileType: { type: String }, // Store MIME type (e.g., image/png, application/pdf)
    fileName: { type: String }, // Store original file name
    status: {
      type: String,
      enum: ['Not Submitted', 'Submitted', 'Verified', 'Waived'],
      default: 'Not Submitted'
    },
    waiverDetails: {
      reason: { type: String },
      promiseDate: { type: Date }
    }
  }],
  admissionRequirementsStatus: {
    type: String,
    enum: ['Incomplete', 'Complete'],
    default: 'Incomplete'
  },
});

// Password hashing pre-save hook
enrolleeApplicantSchema.pre('save', async function (next) {
  if (
    !this.isModified('password') ||
    this.password.startsWith('$2a$') ||
    this.password.startsWith('$2b$')
  ) {
    return next();
  }
  try {
    const cleanPassword = this.password.trim();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(cleanPassword, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Update the pre-save hook
enrolleeApplicantSchema.pre('save', function (next) {
  if (this.admissionRequirements && this.admissionRequirements.length > 0) {
    // Check if all requirements are either Verified or Waived
    const allComplete = this.admissionRequirements.every(req => 
      req.status === 'Verified' || req.status === 'Waived'
    );
    
    // Also check that all requirements have been addressed (none are 'Not Submitted')
    const allAddressed = this.admissionRequirements.every(req =>
      req.status !== 'Not Submitted'
    );
    
    this.admissionRequirementsStatus = (allComplete && allAddressed) ? 'Complete' : 'Incomplete';
  } else {
    this.admissionRequirementsStatus = 'Incomplete';
  }
  next();
});

// Method to check if OTP is valid
enrolleeApplicantSchema.methods.isOtpValid = function () {
  return this.otp && this.otpExpires && this.otpExpires > Date.now();
};

// Method to get temporary password
enrolleeApplicantSchema.methods.getPlainPassword = async function () {
  const user = await this.model('EnrolleeApplicant')
    .findById(this._id)
    .select('+temporaryPassword')
    .exec();
  return user.temporaryPassword;
};

module.exports = mongoose.model('EnrolleeApplicant', enrolleeApplicantSchema);