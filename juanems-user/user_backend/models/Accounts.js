const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AccountsSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true},
    mobile: { type: String, required: true, unique: true},
    role: { type: String, required: true }, 
    hasCustomAccess: {
      type: Boolean,
      default: false
    },
    customModules: {
      type: [String],
      default: []
    },
    status: {type: String, required: true},
  }, { timestamps: true });
// TODO: Extend schema for OTP 

// Hash password before save
AccountsSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('Accounts', AccountsSchema);
