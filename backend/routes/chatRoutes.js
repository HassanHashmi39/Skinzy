const express = require('express');
const router = express.Router();
const { 
    sendMessage, 
    getConversation, 
    getRecentChats, 
    markMessagesAsRead,
    markAllMessageNotificationsAsRead
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// All chat routes require authentication
router.use(protect);

router.post('/send', sendMessage);
router.get('/conversation/:userId', getConversation);
router.get('/recent', getRecentChats);
router.put('/read/:userId', markMessagesAsRead);
router.put('/read-all-messages', markAllMessageNotificationsAsRead);

module.exports = router;
