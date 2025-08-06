const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    // फील्ड का नाम 'order' है
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    isLocationRequest: {
        type: Boolean,
        default: false
    }
}, { timestamps: true
    
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
