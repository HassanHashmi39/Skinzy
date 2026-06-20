const express = require('express');
const router = express.Router();
const multer = require('multer');
const { signup, login, getMe, forgotPassword, resetPassword, validateDocument } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/validate-document', upload.single('file'), validateDocument);

// Protected route
router.get('/me', protect, getMe);

module.exports = router;
