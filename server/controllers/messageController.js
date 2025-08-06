const Message = require('../models/messageModel.js');
const Notification = require('../models/notificationModel.js');
const Order = require('../models/orderModel.js');

const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ order: req.params.orderId })
            .populate('sender', 'name')
            .sort({ createdAt: 'asc' });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;

        const newMessage = new Message({
            order: req.params.orderId,
            sender: req.user._id,
            message: message,
        });

        await newMessage.save();

        // ✅ Get Order Info to know who to notify
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const senderId = req.user._id.toString();
        const customerId = order.customer.toString();
        const vendorId = order.vendor.toString();

        const recipientId = senderId === customerId ? vendorId : customerId;

        // ✅ Save Notification
        await Notification.create({
            user: recipientId,
            message: `New message on order #${order._id.toString().slice(-6)}`,
            type: 'chat',
            orderId: order._id,
            link: `/chat/${order._id}`
        });

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('❌ sendMessage error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getMessages, sendMessage };