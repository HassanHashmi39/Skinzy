const express = require('express');
const router = express.Router();
const { createContactInquiry } = require('../controllers/contactController');

// @route   POST /api/contact
// @desc    Create a contact inquiry
// @access  Public
router.post('/', createContactInquiry);

module.exports = router;
