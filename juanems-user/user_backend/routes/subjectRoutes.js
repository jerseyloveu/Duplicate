const express = require('express');
const router = express.Router();
const Subjects = require('../models/Subjects');

// CREATE subject
// POST /api/admin/subjects/create-subject
router.post('/create-subject', async (req, res) => {
    try {
        const {
            subjectID,
            subjectCode,
            subjectName,
            writtenWork,
            performanceTask,
            quarterlyAssessment,
            classification,
            strand,
            term,
            gradeLevel,
            status,
            subjectOrder
        } = req.body;

        // Check for existing subjectID, subjectCode, or subjectName
        const existingSubject = await Subjects.findOne({
            $or: [
                { subjectID },
                { subjectCode },
                { subjectName }
            ],
            _id: { $ne: req.params.id } // Exclude current subject
        });

        if (existingSubject) {
            return res.status(409).json({ message: 'Subject with the same ID, code, or name already exists.' });
        }

        const newSubject = new Subjects({
            subjectID,
            subjectCode,
            subjectName,
            writtenWork,
            performanceTask,
            quarterlyAssessment,
            classification,
            strand,
            term,
            gradeLevel,
            status,
            subjectOrder
        });

        await newSubject.save();
        res.status(201).json({ message: 'Subject created successfully.', data: newSubject });
    } catch (error) {
        console.error('Create subject error:', error);
        res.status(500).json({ message: 'Server error creating subject.' });
    }
});

// GET all subjects
// GET /api/admin/subjects
router.get('/', async (req, res) => {
    try {
        const subjects = await Subjects.find().sort({ createdAt: -1 });
        res.status(200).json({ data: subjects });
    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({ message: 'Server error fetching subjects.' });
    }
});

// GET single subject by ID
// GET /api/admin/subjects/:id
router.get('/:id', async (req, res) => {
    try {
        const subject = await Subjects.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }
        res.status(200).json({ data: subject });
    } catch (error) {
        console.error('Get subject error:', error);
        res.status(500).json({ message: 'Server error retrieving subject.' });
    }
});

// UPDATE subject
// PUT /api/admin/subjects/:id
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const { subjectID, subjectCode, subjectName } = updates;

        // Check for duplicate subjectID, subjectCode, or subjectName in other documents
        const existing = await Subjects.findOne({
            $or: [
                { subjectID },
                { subjectCode },
                { subjectName }
            ]
        });

        if (existing && existing._id.toString() !== req.params.id) {
            return res.status(409).json({ message: 'Another subject with the same ID, code, or name already exists.' });
        }

        const subject = await Subjects.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }

        res.status(200).json({ message: 'Subject updated successfully.', data: subject });
    } catch (error) {
        console.error('Update subject error:', error);
        res.status(500).json({ message: 'Server error updating subject.' });
    }
});

// DELETE subject
// DELETE /api/admin/subjects/:id
router.delete('/:id', async (req, res) => {
    try {
        const subject = await Subjects.findByIdAndDelete(req.params.id);

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }

        res.status(200).json({ message: 'Subject deleted successfully.' });
    } catch (error) {
        console.error('Delete subject error:', error);
        res.status(500).json({ message: 'Server error deleting subject.' });
    }
});

module.exports = router;
