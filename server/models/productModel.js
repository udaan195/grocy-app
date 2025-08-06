const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Vendor'
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    quantityValue: {
        type: Number,
        required: true,
    },
    quantityUnit: {
        type: String,
        required: true,
        enum: ['kg', 'gm', 'Ltr', 'ml', 'Pcs']
    },
    originalPrice: {
        type: Number,
        required: true
    },
    discountedPrice: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            name: String,
            rating: Number,
            comment: String,
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    isHyperlocal: {
        type: Boolean,
        default: false
    },
    deliveryCharge: {
        type: Number,
        default: 0
    },
    minOrderQuantity: {
        type: Number,
        default: 1
    },
    image: {
        type: String,
        required: true
    },
    // Add this inside your product schema
totalSold: {
    type: Number,
    default: 0
}
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;