const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // <-- bcryptjs को इम्पोर्ट करें

const userSchema = new mongoose.Schema({
    // --- नए फील्ड्स ---
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phoneNumber: {
        type: String,
    },
    password: {
        type: String,
        // पासवर्ड हर यूजर के लिए जरूरी नहीं है, क्योंकि हम OTP लॉगिन भी सपोर्ट करते हैं
    },
    // ------------------
    role: {
        type: String,
        enum: ['customer', 'vendor', 'superadmin'],
        default: 'customer'
    },
    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active'
    },
    addresses: [{
        fullName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        pincode: { type: String, required: true },
        state: { type: String, required: true },
        city: { type: String, required: true },
        houseNo: { type: String, required: true },
        area: { type: String, required: true },
        landmark: { type: String },
        latitude: { type: String },
    longitude: { type: String },
        // ⬆️ यहाँ पहले कॉमा मिस था
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number] } // [Longitude, Latitude]
        }
    }],
    
    vendorInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        default: null
    },
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// --- पासवर्ड को एन्क्रिप्ट करने का लॉजिक ---
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// --- लॉगिन के समय पासवर्ड मैच करने का फंक्शन ---
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

    
    // --- यह नया और बेहतर तरीका है ---
    
    // -----------------------------
    
    