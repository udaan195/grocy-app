const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // --- कनेक्शन के लिए नए ऑप्शंस जोड़ें ---
    const options = {
        // 30 सेकंड तक सर्वर से कनेक्ट होने की कोशिश करें
        serverSelectionTimeoutMS: 30000, 
        // 45 सेकंड तक किसी ऑपरेशन के जवाब का इंतज़ार करें
        socketTimeoutMS: 45000, 
    };
    // ------------------------------------

    await mongoose.connect(process.env.MONGO_URI, options); // <-- ऑप्शंस यहाँ पास करें
    console.log('MongoDB Atlas Connected...');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message); // बेहतर एरर लॉगिंग
    process.exit(1);
  }
};

module.exports = connectDB;
