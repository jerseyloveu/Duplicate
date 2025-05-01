const mongoose = require('mongoose');

const additionalApplicantDetailsSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true },
  prefix: { type: String, trim: true, default: '' },
  suffix: { type: String, trim: true, default: '' },
  gender: { type: String, enum: ['Male', 'Female', ''], default: '' },
  lrnNo: { type: String, trim: true, match: [/^\d{12}$/, 'LRN must be exactly 12 digits'], default: '' },
  civilStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed', ''], default: '' },
  religion: { type: String, trim: true, default: '' },
  countryOfBirth: { type: String, trim: true, default: '' },
  birthPlaceCity: { type: String, trim: true, maxLength: 50, default: '' },
  birthPlaceProvince: { type: String, trim: true, maxLength: 50, default: '' },
  entryLevel: { type: String, enum: ['Senior High School', 'Senior High School - Transferee', ''], default: '' },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure updatedAt is refreshed on update
additionalApplicantDetailsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

additionalApplicantDetailsSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('AdditionalApplicantDetails', additionalApplicantDetailsSchema);