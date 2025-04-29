const express = require('express');
const router = express.Router();
const Strands = require('../models/Strands');

// CREATE strand
// POST /api/admin/strands/create-strand
router.post('/create-strand', async (req, res) => {
    try {
        const { strandCode, strandName, status } = req.body;

        // Check if strandCode or strandName already exists
        const existing = await Strands.findOne({
            $or: [{ strandCode }, { strandName }]
        });

        if (existing) {
            return res.status(409).json({ message: 'Strand code or name already exists.' });
        }

        const newStrand = new Strands({ strandCode, strandName, status });
        await newStrand.save();

        res.status(201).json({ message: 'Strand created successfully.', data: newStrand });
    } catch (error) {
        console.error('Create strand error:', error);
        res.status(500).json({ message: 'Server error creating strand.' });
    }
});

// GET all strands
// GET /api/admin/strands
router.get('/', async (req, res) => {
    try {
        const strands = await Strands.find().sort({ createdAt: -1 });
        res.status(200).json({ data: strands });
    } catch (error) {
        console.error('Get strands error:', error);
        res.status(500).json({ message: 'Server error fetching strands.' });
    }
});

// GET single strand by ID
// GET /api/admin/strands/:id
router.get('/:id', async (req, res) => {
    try {
        const strand = await Strands.findById(req.params.id);

        if (!strand) {
            return res.status(404).json({ message: 'Strand not found.' });
        }

        res.status(200).json({ data: strand });
    } catch (error) {
        console.error('Get strand error:', error);
        res.status(500).json({ message: 'Server error retrieving strand.' });
    }
});

// UPDATE strand
// PUT /api/admin/strands/:id
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const { strandCode, strandName } = updates;

        // Check for duplicate strandCode or strandName (excluding current)
        const existing = await Strands.findOne({
            $or: [{ strandCode }, { strandName }],
            _id: { $ne: req.params.id }
        });

        if (existing) {
            return res.status(409).json({ message: 'Another strand with the same code or name already exists.' });
        }

        const strand = await Strands.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!strand) {
            return res.status(404).json({ message: 'Strand not found.' });
        }

        res.status(200).json({ message: 'Strand updated successfully.', data: strand });
    } catch (error) {
        console.error('Update strand error:', error);
        res.status(500).json({ message: 'Server error updating strand.' });
    }
});

// DELETE strand
// DELETE /api/admin/strands/:id
router.delete('/:id', async (req, res) => {
    try {
        const strand = await Strands.findByIdAndDelete(req.params.id);

        if (!strand) {
            return res.status(404).json({ message: 'Strand not found.' });
        }

        res.status(200).json({ message: 'Strand deleted successfully.' });
    } catch (error) {
        console.error('Delete strand error:', error);
        res.status(500).json({ message: 'Server error deleting strand.' });
    }
});

module.exports = router;
