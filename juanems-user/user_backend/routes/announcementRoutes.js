const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const mongoose = require('mongoose');

// Get all active announcements with pagination and fuzzy search
router.get('/', async (req, res) => {
  try {
    // Parse query parameters with explicit type conversion
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'startDate';
    const sortOrder = req.query.sortOrder || 'desc';
    
    // Force these specific values regardless of what's in req.query
    // This is the strict enforcement to resolve the issue
    const status = 'Active';  // Force 'Active' status
    const audience = 'Applicants'; // Force 'Applicants' audience
    
    console.log('Filtering for status:', status);
    console.log('Filtering for audience:', audience);
    
    // Build query with explicit equality checks
    const query = {
      status: { $eq: status },
      audience: { $eq: audience },
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    };

    // Log the query to verify it's correct
    console.log('MongoDB query:', JSON.stringify(query));

    // Add fuzzy search if search term exists
    if (search && search.trim() !== '') {
      query.$or = [
        { subject: { $regex: escapeRegex(search), $options: 'i' } },
        { content: { $regex: escapeRegex(search), $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // First, let's check what announcements exist in the database
    const allAnnouncements = await Announcement.find({}).lean();
    console.log('All audiences in database:', allAnnouncements.map(a => a.audience));

    // Execute the filtered query
    const announcements = await Announcement.find(query)
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean() // For better performance
      .exec();
    
    // Log what's being returned
    console.log('Filtered announcements:', announcements.map(a => ({
      id: a._id,
      subject: a.subject,
      audience: a.audience,
      status: a.status
    })));

    const count = await Announcement.countDocuments(query);

    res.json({
      success: true,
      announcements,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count,
      filterApplied: {
        status: status,
        audience: audience
      }
    });
  } catch (err) {
    console.error('Error in announcements route:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching announcements',
      error: err.message
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
  if (!['All Users', 'Students', 'Faculty', 'Applicants', 'Staff'].includes(audience)) {
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