const express = require('express');
const router = express.Router();
const Accounts = require('../models/Accounts');

// CREATE user account
// POST /api/admin/create-account
router.post('/create-account', async (req, res) => {
    try {
      const {
        firstName,
        middleName,
        lastName,
        email,
        mobile,
        role,
        status,
        password,
        hasCustomAccess,
        customModules
      } = req.body;
  
      // Validate required fields
      if (!firstName || !lastName || !email || !mobile || !role || !status) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      // Check if email or mobile already exists
      const existingUser = await Accounts.findOne({
        $or: [{ email }, { mobile }]
      });
  
      if (existingUser) {
        return res.status(409).json({
          message: 'A user with this email or mobile number already exists'
        });
      }
  
      // Generate or use provided userID
      const userID = req.body.userID || generateUserID(role);
  
      // Create the new user
      const newUser = new Accounts({
        userID,
        firstName,
        middleName,
        lastName,
        email,
        mobile,
        role,
        status,
        password,
        hasCustomAccess, // Add this field
        customModules   // Add this field
      });
  
      await newUser.save();
  
      // Return success without the password
      const userResponse = newUser.toObject();
      delete userResponse.password;
  
      return res.status(201).json({
        message: 'Account created successfully',
        data: userResponse
      });
    } catch (error) {
      console.error('Error creating account:', error);
      return res.status(500).json({
        message: 'An error occurred while creating the account',
        error: error.message
      });
    }
  });
  
// GET all accounts
// GET /api/admin/accounts
router.get('/accounts', async (req, res) => {
    try {
        const accounts = await Accounts.find().sort({ createdAt: -1 });
        res.status(200).json({ data: accounts });
    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({ message: 'Server error fetching accounts.' });
    }
});

// GET single account by ID
// GET /api/admin/accounts/:id
router.get('/accounts/:id', async (req, res) => {
    try {
        const account = await Accounts.findById(req.params.id);
        if (!account) {
            return res.status(404).json({ message: 'Account not found.' });
        }
        res.status(200).json({ data: account });
    } catch (error) {
        console.error('Get account error:', error);
        res.status(500).json({ message: 'Server error retrieving account.' });
    }
});

// UPDATE account details
// PUT /api/admin/accounts/:id
router.put('/accounts/:id', async (req, res) => {
    try {
        const updates = req.body;
        const { userID, email, mobile } = updates;

        // Check if the userID, email, or mobile already exists in another account
        if (userID) {
            const userIDExists = await Accounts.findOne({ userID });
            if (userIDExists && userIDExists._id.toString() !== req.params.id) {
                return res.status(409).json({ message: 'User ID already exists.' });
            }
        }

        if (email) {
            const emailExists = await Accounts.findOne({ email });
            if (emailExists && emailExists._id.toString() !== req.params.id) {
                return res.status(409).json({ message: 'Email already exists.' });
            }
        }

        if (mobile) {
            const mobileExists = await Accounts.findOne({ mobile });
            if (mobileExists && mobileExists._id.toString() !== req.params.id) {
                return res.status(409).json({ message: 'Mobile number already exists.' });
            }
        }

        // If password is being updated, fetch-save to trigger pre-save hook
        if (updates.password) {
            const account = await Accounts.findById(req.params.id);
            if (!account) {
                return res.status(404).json({ message: 'Account not found.' });
            }
            Object.assign(account, updates);
            await account.save();
            return res.status(200).json({ message: 'Account updated successfully.', data: account });
        }

        // For other fields
        const account = await Accounts.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!account) {
            return res.status(404).json({ message: 'Account not found.' });
        }

        res.status(200).json({
            message: 'Account updated successfully.',
            data: account
        });
    } catch (error) {
        console.error('Update account error:', error);
        res.status(500).json({ message: 'Server error updating account.' });
    }
});

module.exports = router;
