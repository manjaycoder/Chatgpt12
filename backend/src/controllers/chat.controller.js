const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model');
const MessageModel = require('../models/message.model');    


async function chatController(req, res) {
    try {
        const { tittle } = req.body;
        const user = req.user;

        const chat = await chatModel.create({
            user: user._id,
            tittle
        });

        res.status(200).json({
            message: "Chat created successfully",
            chat: {
                _id: chat._id,
                tittle: chat.tittle,
                lastActivity: chat.lastActivity
            }
        });
    } catch (error) {
        console.error("Chat Create Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


async function ChatsController(req, res) {
    try {
        const user = req.user;

        const chats = await chatModel
            .find({ user: user._id })
            .sort({ lastActivity: -1 });

        res.status(200).json({
            message: "Chats retrieved successfully",
            chats
        });
    } catch (error) {
        console.error("Chats Fetch Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getChatById(req, res) {
    try {
        const chatId = req.params.chatId;
        
        if (!chatId) {
            return res.status(400).json({
                message: "Chat ID is required"
            });
        }
        
        const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: -1 });
        
        res.status(200).json({
            message: "Messages retrieved successfully",
            messages
        });
    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    chatController,
    ChatsController,
    getChatById
};
