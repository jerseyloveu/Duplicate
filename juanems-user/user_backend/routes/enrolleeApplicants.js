const express = require('express');
const router = express.Router();
const EnrolleeApplicant = require('../models/EnrolleeApplicant');

function generateStudentID() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${year}-${randomNum}`;
}

function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// routes/enrolleeApplicants.js
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
  
      // Generate new student ID and password
      const studentID = generateStudentID();
      const plainPassword = generateRandomPassword();
  
      // Create new record (will allow duplicate emails for inactive status)
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
        status: 'Pending Verification'
      });
      
      await newApplicant.save();
  
      res.status(201).json({
        message: 'Registration successful',
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

// routes/enrolleeApplicants.js
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
  
module.exports = router;
