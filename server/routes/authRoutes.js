const express = require('express');
const router = express.Router();

// authController से सभी जरूरी फंक्शन्स को इम्पोर्ट करें
const {
    registerUser,
    loginUser,
    sendOtp,
    verifyOtp
} = require('../controllers/authController');


// --- नए राउट्स ---

// POST /api/auth/register
// नया यूजर बनाने (रजिस्टर करने) के लिए
router.post('/register', registerUser);

// POST /api/auth/login
// पासवर्ड से लॉग इन करने के लिए
router.post('/login', loginUser);


// --- पुराने OTP वाले राउट्स (पासवर्ड-लेस लॉगिन के लिए) ---

// POST /api/auth/send-otp
router.post('/send-otp', sendOtp);

// POST /api/auth/verify-otp
router.post('/verify-otp', verifyOtp);


module.exports = router;
