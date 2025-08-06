const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    shopName: {
        type: String,
        required: true,
        trim: true
    },
    shopAddress: {
        type: String,
        required: true
    },
    telegramId: {
        type: String
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'suspended', 'blocked'],
        default: 'pending'
    }, // <-- यह कॉमा लगाना ज़रूरी है

    serviceRadius: { 
        type: Number, 
        default: 5000
    },
    hyperlocalRadius: {
        type: Number,
        default: 600
    },
    minCartValueHyperlocal: {
        type: Number,
        default: 0
    },
    minCartValueRegular: {
        type: Number,
        default: 0
    },

    // --- यह नए डिलीवरी चार्ज के नियम हैं ---
    // (सभी दूरियाँ मीटर में होंगी)
    freeDeliveryRadius: { // फ्री डिलीवरी की सीमा
        type: Number,
        default: 500 // डिफ़ॉल्ट 500 मीटर
    },
    baseDeliveryCharge: { // पहले स्लैब का चार्ज
        type: Number,
        default: 5 // डिफ़ॉल्ट ₹5
    },
    baseDeliveryRadius: { // पहले स्लैब की दूरी
        type: Number,
        default: 1000 // डिफ़ॉल्ट 1000 मीटर (1km)
    },
    extraChargePerUnit: { // अतिरिक्त दूरी पर चार्ज
        type: Number,
        default: 3 // डिफ़ॉल्ट ₹3
    },
    extraChargeUnitDistance: { // अतिरिक्त दूरी की यूनिट
        type: Number,
        default: 500 // डिफ़ॉल्ट हर 500 मीटर पर
    }
    // ------------------------------------

}, { timestamps: true });

const Vendor = mongoose.model('Vendor', vendorSchema);
module.exports = Vendor;




