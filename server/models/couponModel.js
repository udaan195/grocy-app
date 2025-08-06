const mongoose = require('mongoose');

const welcomeOfferSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['FreeDelivery', 'FlatOff'],
  },
  flatOffValue: Number,
}, { _id: false });

const comboOfferSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['FreeProduct', 'FreeDelivery', 'FlatOff'],
  },
  flatOffValue: Number,
  freeProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
}, { _id: false });

const couponSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: String,

  offerType: {
    type: String,
    enum: ['Welcome', 'Combo', 'BuyXGetY'],
    required: true,
  },

  couponCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },

  // Welcome Offer
  minPurchaseWelcome: Number,
  welcomeOfferDetail: welcomeOfferSchema,

  // Combo Offer
  comboProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  comboOfferDetail: comboOfferSchema,

  // Buy X Get Y Offer
  buyProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  buyQuantity: Number,
  getQuantityFree: Number,

  // General conditions
  isActive: {
    type: Boolean,
    default: true,
  },
  expiryDate: Date,
  forFirstTimeUser: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;