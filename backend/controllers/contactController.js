const Contact = require('../models/Contact');

// @desc    Submit a contact/support form message
// @route   POST /api/contact
// @access  Public
const createContactInquiry = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Please provide all required fields (name, email, message).' });
        }

        const contact = await Contact.create({
            name,
            email,
            message
        });

        res.status(201).json({
            success: true,
            message: 'Your inquiry has been successfully submitted.',
            data: contact
        });
    } catch (error) {
        console.error('Error in createContactInquiry:', error);
        res.status(500).json({ message: 'Server error. Failed to submit message.' });
    }
};

module.exports = {
    createContactInquiry
};
