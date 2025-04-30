const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const mongoose = require('mongoose');

// Get all active announcements with pagination and fuzzy search
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 5, 
      search = '', 
      sortBy = 'startDate', 
      sortOrder = 'desc',
      audience = 'Applicants' // Default to Applicants only
    } = req.query;
    
    // Base query for active announcements for the specified audience
    const query = {
      status: 'Active',
      audience: audience,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    };

    // Add fuzzy search if search term exists
    if (search) {
      query.$or = [
        { subject: { $regex: escapeRegex(search), $options: 'i' } },
        { content: { $regex: escapeRegex(search), $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const announcements = await Announcement.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Announcement.countDocuments(query);

    res.json({
      success: true,
      announcements,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching announcements'
    });
  }
});

// Helper function for fuzzy search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }

// Get announcement by ID
router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ 
        success: false,
        message: 'Announcement not found'
      });
    }
    res.json({ 
      success: true,
      announcement 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching announcement'
    });
  }
});

// Basic validation middleware
const validateAnnouncement = (req, res, next) => {
  const { subject, content, startDate, endDate, audience } = req.body;
  const errors = [];

  if (!subject) errors.push('Subject is required');
  if (!content) errors.push('Content is required');
  if (!startDate || isNaN(new Date(startDate))) errors.push('Valid start date is required');
  if (!endDate || isNaN(new Date(endDate))) errors.push('Valid end date is required');
  if (!['All Users', 'Students', 'Faculty', 'Applicants', 'Admin'].includes(audience)) {
    errors.push('Invalid audience type');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      success: false,
      errors 
    });
  }

  next();
};

// Create new announcement (Admin only)
router.post('/', validateAnnouncement, async (req, res) => {
  try {
    const newAnnouncement = new Announcement({
      ...req.body,
      announcer: req.user?.id || 'System' // Fallback to 'System' if no user
    });

    await newAnnouncement.save();
    res.status(201).json({ 
      success: true,
      announcement: newAnnouncement 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating announcement'
    });
  }
});

// Update announcement (Admin only)
router.put('/:id', validateAnnouncement, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({ 
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({ 
      success: true,
      announcement 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating announcement'
    });
  }
});

// Delete announcement (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ 
        success: false,
        message: 'Announcement not found'
      });
    }
    res.json({ 
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting announcement'
    });
  }
});

module.exports = router;