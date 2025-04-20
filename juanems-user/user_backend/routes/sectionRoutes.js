const express = require('express');
const router = express.Router();
const Sections = require('../models/Sections');

// CREATE section
// POST /api/admin/sections/create-section
router.post('/create-section', async (req, res) => {
    try {
        const { sectionName, gradeLevel, strand, capacity, status } = req.body;

        // Check if section name already exists
        const existingSection = await Sections.findOne({ sectionName });

        if (existingSection) {
            return res.status(409).json({ message: 'Section with the same name already exists.' });
        }

        const newSection = new Sections({
            sectionName,
            gradeLevel,
            strand,
            capacity,
            status
        });

        await newSection.save();
        res.status(201).json({ message: 'Section created successfully.', data: newSection });
    } catch (error) {
        console.error('Create section error:', error);
        res.status(500).json({ message: 'Server error creating section.' });
    }
});

// GET all sections
// GET /api/admin/sections
router.get('/', async (req, res) => {
    try {
        const sections = await Sections.find().sort({ createdAt: -1 });
        res.status(200).json({ data: sections });
    } catch (error) {
        console.error('Get sections error:', error);
        res.status(500).json({ message: 'Server error fetching sections.' });
    }
});

// GET single section by ID
// GET /api/admin/sections/:id
router.get('/:id', async (req, res) => {
    try {
        const section = await Sections.findById(req.params.id);
        if (!section) {
            return res.status(404).json({ message: 'Section not found.' });
        }
        res.status(200).json({ data: section });
    } catch (error) {
        console.error('Get section error:', error);
        res.status(500).json({ message: 'Server error retrieving section.' });
    }
});

// UPDATE section
// PUT /api/admin/sections/:id
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const { sectionName } = updates;

        // Check if another section has the same name
        const existing = await Sections.findOne({ sectionName });

        if (existing && existing._id.toString() !== req.params.id) {
            return res.status(409).json({ message: 'Another section with the same name already exists.' });
        }

        const section = await Sections.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!section) {
            return res.status(404).json({ message: 'Section not found.' });
        }

        res.status(200).json({ message: 'Section updated successfully.', data: section });
    } catch (error) {
        console.error('Update section error:', error);
        res.status(500).json({ message: 'Server error updating section.' });
    }
});

// DELETE section
// DELETE /api/admin/sections/:id
router.delete('/:id', async (req, res) => {
    try {
        const section = await Sections.findByIdAndDelete(req.params.id);

        if (!section) {
            return res.status(404).json({ message: 'Section not found.' });
        }

        res.status(200).json({ message: 'Section deleted successfully.' });
    } catch (error) {
        console.error('Delete section error:', error);
        res.status(500).json({ message: 'Server error deleting section.' });
    }
});

module.exports = router;
