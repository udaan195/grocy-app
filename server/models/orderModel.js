const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        name: String,
        quantity: Number,
        price: Number,
        image: String,
        quantityValue: Number,
        quantityUnit: String
    }],
    shippingAddress: {
        type: Object,
        required: true
    },

    // --- Payment Summary ---
    itemsTotal: {
        type: Number,
        required: true
    },
    deliveryCharge: {
        type: Number,
        required: true,
        default: 0
        
    },
    discountAmount: { type: Number, default: 0 },
appliedCoupon: { type: String },


    totalAmount: {
        type: Number,
        required: true
    },
    appliedCoupon: {
        type: String
    },
    // ------------------------

    paymentMethod: {
        type: String,
        required: true,
        enum: ['COD', 'Online']
    },
    paymentStatus: {
        type: String,
        default: 'Pending'
    },
    orderStatus: {
        type: String,
        default: 'Processing',
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled']
    },

    estimatedDeliveryTime: {
        type: String,
        default: ''
    }

}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;