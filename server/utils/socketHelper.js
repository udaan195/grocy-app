const { Server } = require('socket.io');
const Message = require('../models/messageModel.js');
const Notification = require('../models/notificationModel.js');

let io;
const onlineUsers = new Map();

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173", // Change this to your frontend domain in production
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('✅ User connected:', socket.id);

        // User online tracking
        socket.on('addUser', (userId) => {
            onlineUsers.set(userId, socket.id);
            console.log('🟢 Active Users Map:', onlineUsers);
        });

        // Order-based chat joining
        socket.on('joinOrderRoom', (orderId) => {
            socket.join(orderId);
        });

        // Chat message handling
        socket.on('sendMessage', async (data) => {
            try {
                const { orderId, sender, message, isLocationRequest } = data;
                if (!orderId || !sender || !sender.id || !message) return;

                const newMessage = new Message({
                    order: orderId,
                    sender: sender.id,
                    message: message,
                    isLocationRequest: isLocationRequest || false
                });

                const savedMessage = await newMessage.save();
                const populatedMessage = await savedMessage.populate('sender', 'name role');

                io.to(orderId).emit('receiveMessage', populatedMessage);
            } catch (error) {
                console.error('❌ sendMessage error:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('❌ User disconnected:', socket.id);
            for (let [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
        });
    });
};

// ✅ Main function: Send + Save Notification
const createAndSendNotification = async (userId, data) => {
    if (!userId || !data) return;

    // 1. Save notification in DB
    const savedNotification = await Notification.create({
        user: userId,
        message: data.message,
        type: data.type,
        link: data.link || null,
        orderId: data.orderId || null
    });

    // 2. Send via socket if user online
    const userSocketId = onlineUsers.get(userId.toString());
    if (userSocketId) {
        io.to(userSocketId).emit('receiveNotification', savedNotification);
        console.log(`📢 Notification sent to user ${userId}`);
    } else {
        console.log(`📥 Notification saved for offline user ${userId}`);
    }
};

module.exports = {
    initSocket,
    createAndSendNotification
};