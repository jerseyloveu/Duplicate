const express = require('express');
const router = express.Router();
const Accounts = require('../models/Accounts');

// CREATE user account
// POST /api/admin/create-account
router.post('/create-account', async (req, res) => {
    try {
      const {
        userID,
        firstName,
        middleName,
        lastName,
        email,
        mobile,
        role,
        password,
        status
      } = req.body;
  
      const existingUserID = await Accounts.findOne({ userID });
      if (existingUserID) {
        return res.status(409).json({ message: 'User ID already exists.' });
      }
  
      const existingEmail = await Accounts.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({ message: 'Email already exists.' });
      }
  
      const existingMobile = await Accounts.findOne({ mobile });
      if (existingMobile) {
        return res.status(409).json({ message: 'Mobile number already exists.' });
      }
  
      const newAccount = new Accounts({
        userID,
        firstName,
        middleName,
        lastName,
        email,
        mobile,
        role,
        password,
        status: status || 'Pending Verification'
      });
  
      await newAccount.save();
  
      res.status(201).json({
        message: 'Account created successfully.',
        data: {
          userID: newAccount.userID,
          email: newAccount.email
        }
      });
    } catch (error) {
      console.error('Admin Create account error:', error);
      res.status(500).json({ message: 'Server error creating account.' });
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
