const Message = require('../models/Message');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

// @desc    Send a new message
// @route   POST /api/chat/send
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { receiverId, content, attachment } = req.body;
        const senderId = req.user._id;

        if (!receiverId || (!content && !attachment)) {
            return res.status(400).json({ message: 'Receiver ID and content or attachment are required' });
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        const messageData = {
            sender: senderId,
            receiver: receiverId,
            content: content || '',
        };

        if (attachment) {
            messageData.attachment = attachment;
        }

        const message = new Message(messageData);
        await message.save();

        // Create notification for receiver
        await Notification.create({
            user: receiverId,
            type: 'message',
            title: `New message from ${req.user.name}`,
            message: content ? (content.substring(0, 50) + (content.length > 50 ? '...' : '')) : 'Sent an attachment',
            relatedId: message._id,
            senderUserId: senderId
        });

        // Emit socket events in real-time
        if (req.io) {
            req.io.to(receiverId.toString()).emit('newMessage', message);
            req.io.to(senderId.toString()).emit('newMessage', message);
        }

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error while sending message' });
    }
};

// @desc    Get conversation between logged in user and another user
// @route   GET /api/chat/conversation/:userId
// @access  Private
const getConversation = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const otherUserId = req.params.userId;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        }).sort({ createdAt: 1 }); // Oldest to newest for chat UI

        res.json(messages);
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ message: 'Server error while fetching conversation' });
    }
};

// @desc    Get user's recent chat list (unique users they've chatted with)
// @route   GET /api/chat/recent
// @access  Private
const getRecentChats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all messages where user is either sender or receiver
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ createdAt: -1 });

        // Also find all confirmed/completed appointments
        const appointments = await Appointment.find({
            $or: [{ patient: userId }, { doctor: userId }],
            status: { $in: ['confirmed', 'completed'] }
        });

        // Gather unique user IDs to load in a single query (resolves N+1 database requests)
        const uniqueOtherUserIds = [];
        const seenUsers = new Set();

        for (const msg of messages) {
            const otherId = msg.sender.toString() === userId.toString() ? msg.receiver.toString() : msg.sender.toString();
            if (!seenUsers.has(otherId)) {
                seenUsers.add(otherId);
                uniqueOtherUserIds.push(otherId);
            }
        }

        for (const appt of appointments) {
            const otherId = appt.patient.toString() === userId.toString() ? appt.doctor.toString() : appt.patient.toString();
            if (!seenUsers.has(otherId)) {
                seenUsers.add(otherId);
                uniqueOtherUserIds.push(otherId);
            }
        }

        // Single query for all related users
        const users = await User.find({ _id: { $in: uniqueOtherUserIds } })
            .select('name email profileImage userType specialization');

        const userMap = {};
        users.forEach(u => {
            userMap[u._id.toString()] = u;
        });

        // Reconstruct chatList dynamically using the mapping
        const chatList = [];
        const addedUsers = new Set();

        for (const msg of messages) {
            const otherId = msg.sender.toString() === userId.toString() ? msg.receiver.toString() : msg.sender.toString();
            const otherUser = userMap[otherId];
            if (!otherUser) continue;

            if (!addedUsers.has(otherId)) {
                addedUsers.add(otherId);
                chatList.push({
                    user: otherUser,
                    lastMessage: msg,
                    unreadCount: msg.sender.toString() === otherId && !msg.isRead ? 1 : 0
                });
            } else {
                if (msg.sender.toString() !== userId.toString() && !msg.isRead) {
                    const existingChat = chatList.find(c => c.user._id.toString() === otherId);
                    if (existingChat) {
                        existingChat.unreadCount += 1;
                    }
                }
            }
        }

        // Append users from active appointments who haven't sent any messages yet
        for (const appt of appointments) {
            const otherId = appt.patient.toString() === userId.toString() ? appt.doctor.toString() : appt.patient.toString();
            const otherUser = userMap[otherId];
            if (!otherUser) continue;

            if (!addedUsers.has(otherId)) {
                addedUsers.add(otherId);
                chatList.push({
                    user: otherUser,
                    lastMessage: null,
                    unreadCount: 0
                });
            }
        }

        res.json(chatList);
    } catch (error) {
        console.error('Error fetching recent chats:', error);
        res.status(500).json({ message: 'Server error while fetching recent chats' });
    }
};

// @desc    Mark messages from a specific user as read
// @route   PUT /api/chat/read/:userId
// @access  Private
const markMessagesAsRead = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const otherUserId = req.params.userId;
        console.log(`[Chat] markMessagesAsRead called: currentUser=${currentUserId}, otherUser=${otherUserId}`);

        // Mark all messages from this sender as read
        const result = await Message.updateMany(
            { sender: otherUserId, receiver: currentUserId, isRead: false },
            { $set: { isRead: true } }
        );

        // Clear all unread message-type notifications from this specific sender
        // Primary: use senderUserId field (for new notifications)
        const cleared = await Notification.updateMany(
            { user: currentUserId, type: 'message', senderUserId: otherUserId, isRead: false },
            { $set: { isRead: true } }
        );

        // Fallback: also clear old notifications linked by message relatedId (for legacy data without senderUserId)
        const allMessages = await Message.find({ sender: otherUserId, receiver: currentUserId }).select('_id');
        const messageIds = allMessages.map(m => m._id);
        if (messageIds.length > 0) {
            await Notification.updateMany(
                { user: currentUserId, type: 'message', relatedId: { $in: messageIds }, isRead: false },
                { $set: { isRead: true } }
            );
        }

        console.log(`[Chat] Marked ${result.modifiedCount} messages and ${cleared.modifiedCount} notifications as read`);

        res.json({ message: 'Messages marked as read', modifiedCount: result.modifiedCount });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Server error while updating messages' });
    }
};

// @desc    Mark ALL message notifications as read (called when doctor opens chat screen)
// @route   PUT /api/chat/read-all-messages
// @access  Private
const markAllMessageNotificationsAsRead = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        console.log(`[Chat] markAllMessageNotificationsAsRead called for user: ${currentUserId}`);

        // Mark all unread message-type notifications for this user as read
        const cleared = await Notification.updateMany(
            { user: currentUserId, type: 'message', isRead: false },
            { $set: { isRead: true } }
        );

        // Also mark all incoming messages as read
        await Message.updateMany(
            { receiver: currentUserId, isRead: false },
            { $set: { isRead: true } }
        );

        console.log(`[Chat] Cleared ${cleared.modifiedCount} unread message notifications for user ${currentUserId}`);
        res.json({ message: 'All message notifications marked as read', modifiedCount: cleared.modifiedCount });
    } catch (error) {
        console.error('Error marking all message notifications as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    sendMessage,
    getConversation,
    getRecentChats,
    markMessagesAsRead,
    markAllMessageNotificationsAsRead
};


