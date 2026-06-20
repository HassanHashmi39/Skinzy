const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const MedicalHistory = require('../models/MedicalHistory');
const Appointment = require('../models/Appointment');

// @desc    Save medical history
// @route   POST /api/medical-history
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const medicalHistory = await MedicalHistory.findOneAndUpdate(
            { user: req.user.id },
            { ...req.body, user: req.user.id },
            { new: true, upsert: true, runValidators: true }
        );
        res.status(201).json({ success: true, data: medicalHistory });
    } catch (error) {
        console.error('Error saving medical history:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get medical history
// @route   GET /api/medical-history/:userId
// @access  Private
router.get('/:userId', protect, async (req, res) => {
    try {
        const targetUserId = req.params.userId || req.user.id;

        // Security check: Patients can only retrieve their own history
        const requesterRole = req.user.role || req.user.userType;
        if (requesterRole === 'patient' && targetUserId !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Access denied: You can only view your own medical history' });
        }

        // Security check: Doctors must have an appointment with this patient
        if (requesterRole === 'doctor') {
            const hasAppointment = await Appointment.findOne({
                doctor: req.user.id,
                patient: targetUserId,
                status: { $in: ['pending', 'confirmed', 'completed'] }
            });
            if (!hasAppointment) {
                return res.status(403).json({ message: 'Access denied: You must have an active/completed appointment relationship with this patient' });
            }
        }

        const medicalHistory = await MedicalHistory.findOne({ user: targetUserId });
        if (!medicalHistory) return res.status(404).json({ message: 'Medical history not found' });
        res.json({ success: true, data: medicalHistory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
