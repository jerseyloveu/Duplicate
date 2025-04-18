const mongoose = require('mongoose');

const academicTermSchema = new mongoose.Schema({
  term: String,
  status: String
}, { collection: 'AcademicTerm' });  // Explicitly set collection name

const AcademicTerm = mongoose.models.AcademicTerm || 
  mongoose.model("AcademicTerm", academicTermSchema);

module.exports = AcademicTerm;