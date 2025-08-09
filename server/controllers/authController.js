const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// --- टोकन बनाने के लिए एक हेल्पर फंक्शन ---
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1d', // एक्सेस टोकन 1 दिन के लिए मान्य है
    });
};

// @desc    Register a new user with password
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, phoneNumber, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all required fields' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const user = await User.create({
            name,
            email,
            phoneNumber,
            password,
        });

        if (user) {
            res.status(201).json({
                message: 'Registration successful!',
                token: generateToken(user._id, user.role),
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Register User Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Auth user & get token (Login with password)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && user.password && (await user.matchPassword(password))) {
            res.json({
                message: 'Login successful!',
                token: generateToken(user._id, user.role),
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error("Login User Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Send OTP for passwordless login
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Please provide an email' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'No account found with this email. Please register first.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save({ validateBeforeSave: false }); // name की अनिवार्यता को बायपास करने के लिए

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        await transporter.sendMail({
            from: `"Grocy App" <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: 'Your OTP for Grocy App Login',
            text: `Your One-Time Password (OTP) is: ${otp}. It is valid for 10 minutes.`,
        });
        
        res.status(200).json({ message: 'OTP sent successfully to your email' });

    } catch (error) {
        console.error("Error in sendOtp:", error);
        res.status(500).json({ message: 'Server error, please try again later' });
    }
};

// @desc    Verify OTP for passwordless login
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (user && user.otp === otp && user.otpExpires > Date.now()) {
            
            // पहले चेक करें कि प्रोफाइल पूरा है या नहीं
            if (!user.name) {
                // अगर नाम नहीं है, तो प्रोफाइल पूरा करने के लिए अस्थायी टोकन भेजें
                const tempToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
                return res.status(200).json({
                    message: 'OTP verified, but profile is incomplete.',
                    profileComplete: false,
                    tempToken: tempToken
                });
            }

            // अगर प्रोफाइल पूरा है, तो OTP हटाएं और सेव करें
            user.otp = null;
            user.otpExpires = null;
            await user.save(); 

            // और नॉर्मल लॉगिन करें
            res.status(200).json({
                profileComplete: true,
                message: 'Login successful',
                token: generateToken(user._id, user.role),
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
            });
        } else {
            res.status(400).json({ message: 'Invalid or expired OTP' });
        }
    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
// @desc    Forgot password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 मिनट की वैधता
        await user.save({ validateBeforeSave: false });

        // यहाँ ईमेल भेजने का लॉजिक आएगा
        
        res.json({ message: `Password reset OTP sent to ${email}` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        user.password = password; // pre-save हुक अपने आप इसे हैश कर देगा
        user.otp = null;
        user.otpExpires = null;
        await user.save();
        
        res.json({ message: 'Password reset successful!' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    sendOtp,
    verifyOtp, forgotPassword, resetPassword
};
