const express = require('express');
const router = express.Router();
const AIAnalysis = require('../models/AIAnalysis');
const Notification = require('../models/Notification');
const { protect, patientOnly } = require('../middleware/authMiddleware');

// @desc    Save new AI analysis result
// @route   POST /api/analyses
// @access  Private (Patient only)
router.post('/', protect, patientOnly, async (req, res) => {
    try {
        const { results, imageUrl } = req.body;

        const analysis = await AIAnalysis.create({
            patient: req.user.id,
            results,
            imageUrl
        });

        // Create notification
        await Notification.create({
            user: req.user.id,
            type: 'product',
            title: 'Analysis Complete',
            message: `Your skin analysis is ready! You have ${results.skinType} skin with ${results.topConcern}.`,
            relatedId: analysis._id
        });

        res.status(201).json({ analysis });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all AI analyses for a patient
// @route   GET /api/analyses
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let analyses;
        if (req.user.userType === 'doctor') {
            // Need patientId from query
            const { patientId } = req.query;
            if (!patientId) {
                return res.status(400).json({ message: 'patientId is required' });
            }
            analyses = await AIAnalysis.find({ patient: patientId }).sort({ createdAt: -1 });
        } else {
            analyses = await AIAnalysis.find({ patient: req.user.id }).sort({ createdAt: -1 });
        }
        res.json({ analyses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get single AI analysis details by ID
// @route   GET /api/analyses/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const analysis = await AIAnalysis.findById(req.params.id);
        if (!analysis) {
            return res.status(404).json({ message: 'Analysis not found' });
        }
        
        // Ensure patient is the owner, or user is a doctor
        if (req.user.userType === 'patient' && analysis.patient.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied: you do not own this analysis' });
        }
        
        res.json({ analysis });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
