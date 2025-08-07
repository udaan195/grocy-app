const mongoose = require('mongoose');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const Message = require('./models/messageModel');
const Order = require('./models/orderModel');
const Notification = require('./models/notificationModel');
const reviewRoutes = require('./routes/reviewRoutes');

dotenv.config();
connectDB();

const allowedOrigins = [
  'http://localhost:5173',
  'https://grocy-app-swart.vercel.app' // ✅ Allow your deployed React frontend
];

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('📡 New socket connected:', socket.id);

  socket.on('joinUser', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`👤 User ${userId} joined personal notification room.`);
    }
  });

  socket.on('joinOrderRoom', (orderId) => {
    socket.join(orderId);
    console.log(`✅ Socket ${socket.id} joined room: ${orderId}`);
  });

  socket.on('sendMessage', async ({ orderId, sender, messageText }) => {
    try {
      const messageForBroadcast = {
        _id: new mongoose.Types.ObjectId(),
        order: orderId,
        message: messageText,
        isLocation: false,
        sender: { _id: sender.id, name: sender.name, role: sender.role },
        createdAt: new Date().toISOString(),
      };

      io.to(orderId).emit('receiveMessage', messageForBroadcast);
      console.log('📤 Emitting message to room:', orderId);

      const messageToSave = new Message({
        _id: messageForBroadcast._id,
        order: orderId,
        sender: sender.id,
        message: messageText
      });
      await messageToSave.save();

      const receiverId = await getOtherUserId(orderId, sender.id);
      if (receiverId) {
        const notification = await Notification.create({
          user: receiverId,
          message: `${sender.name} sent a message in Order #${orderId.slice(-6)}`,
          type: 'chat',
          orderId,
          link: `/orders/${orderId}`
        });
        console.log('🔔 Notification created for user:', receiverId);

        io.to(receiverId).emit('newNotification', notification);
      }
    } catch (error) {
      console.error('❌ Error in sendMessage:', error);
    }
  });

  socket.on('sendLocation', async ({ orderId, sender, coords }) => {
    try {
      const locationUrl = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;

      const messageForBroadcast = {
        _id: new mongoose.Types.ObjectId(),
        order: orderId,
        message: locationUrl,
        isLocation: true,
        sender: { _id: sender.id, name: sender.name, role: sender.role },
        createdAt: new Date().toISOString(),
      };

      io.to(orderId).emit('receiveMessage', messageForBroadcast);
      console.log('📍 Emitting location to room:', orderId);

      const messageToSave = new Message({
        _id: messageForBroadcast._id,
        order: orderId,
        sender: sender.id,
        message: locationUrl,
        isLocation: true
      });
      await messageToSave.save();

      const receiverId = await getOtherUserId(orderId, sender.id);
      if (receiverId) {
        const notification = await Notification.create({
          user: receiverId,
          message: `${sender.name} shared location in Order #${orderId.slice(-6)}`,
          type: 'chat',
          orderId,
          link: `/orders/${orderId}`
        });
        console.log('📍 Location notification created for:', receiverId);

        io.to(receiverId).emit('newNotification', notification);
      }
    } catch (error) {
      console.error('❌ Error in sendLocation:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('🚫 User disconnected:', socket.id);
  });
});

// Routes
app.get('/', (req, res) => res.send('API is running...'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/delivery', require('./routes/deliveryRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/reviews', reviewRoutes);

const getOtherUserId = async (orderId, senderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) return null;
    const customerId = order.customer?.toString();
    const vendorId = order.vendor?.toString();
    if (senderId === customerId) return vendorId;
    if (senderId === vendorId) return customerId;
    return null;
  } catch (err) {
    console.error("Error finding other user for notification:", err);
    return null;
  }
};

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`✅ Server with Socket.IO running on port ${PORT}`)
);