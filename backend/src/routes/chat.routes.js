const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const {
    chatController,
    ChatsController,
    getChatById
} = require('../controllers/chat.controller');

const router = express.Router();

// Create chat
router.post('/', authMiddleware, chatController);

// Get all chats
router.get('/', authMiddleware, ChatsController);

// Get messages for a chat (specific route first)
router.get('/messages/:chatId', authMiddleware, getChatById);

// Get chat by ID
router.get('/:chatId', authMiddleware, getChatById);

module.exports = router;
