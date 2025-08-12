const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    image: { // Cloudinary URL
        type: String,
        required: true,
    },
    vendor: { // यह बैनर किस वेंडर का है
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true
});

const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;
