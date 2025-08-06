const Coupon = require('../models/couponModel');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// @desc Create Coupon
const createCoupon = async (req, res) => {
  try {
    const {
      offerType,
      title,
      couponCode,
      minPurchaseWelcome,
      welcomeOfferDetail,
      comboProducts,
      comboOfferDetail,
      buyProduct,
      buyQuantity,
      getQuantityFree,
      expiryDate,
      forFirstTimeUser,
    } = req.body;

    const newCoupon = new Coupon({
      vendor: req.user.vendorInfo,
      offerType,
      title,
      couponCode: couponCode?.toUpperCase(),
      expiryDate,
      forFirstTimeUser,
      minPurchaseWelcome,
      welcomeOfferDetail,
      comboProducts,
      comboOfferDetail,
      buyProduct,
      buyQuantity,
      getQuantityFree,
    });

    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: `Coupon '${req.body.couponCode}' already exists.` });
    }
    res.status(400).json({ message: `Coupon creation failed: ${error.message}` });
  }
};

// @desc Get vendor coupons
const getMyCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ vendor: req.user.vendorInfo }).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc Delete coupon
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ _id: req.params.id, vendor: req.user.vendorInfo });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found or unauthorized' });
    }

    await coupon.deleteOne();
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc Validate Coupon
const validateCoupon = async (req, res) => {
  try {
    const { couponCode, cartItems } = req.body;
    const userId = req.user._id;

    const coupon = await Coupon.findOne({ couponCode: couponCode.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ message: "Invalid coupon code." });

    // Check expiry
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: "This coupon has expired." });
    }

    // First-time user check
    if (coupon.forFirstTimeUser) {
      const pastOrders = await Order.countDocuments({ customer: userId });
      if (pastOrders > 0) {
        return res.status(400).json({ message: "This coupon is for first-time users only." });
      }
    }

    // Vendor-specific check
    const invalidVendorItem = cartItems.find(item => item.vendor !== coupon.vendor.toString());
    if (invalidVendorItem) {
      return res.status(400).json({ message: 'This coupon only applies to products from the issuing vendor.' });
    }

    const itemsTotal = cartItems.reduce((sum, item) => sum + item.quantity * item.discountedPrice, 0);
    let discountType = null;
    let discountValue = 0;
    let freeProduct = null;

    if (coupon.offerType === 'Welcome') {
      if (itemsTotal < coupon.minPurchaseWelcome) {
        return res.status(400).json({ message: `Minimum purchase ₹${coupon.minPurchaseWelcome} required.` });
      }

      discountType = coupon.welcomeOfferDetail?.type;
      if (discountType === 'FlatOff') {
        discountValue = coupon.welcomeOfferDetail?.flatOffValue || 0;
      } else if (discountType === 'FreeDelivery') {
        discountValue = 0;
      }

    } else if (coupon.offerType === 'Combo') {
      // Combo condition: all required products must be in cart
      const requiredProductIds = coupon.comboProducts.map(p => p.toString());
      const cartProductIds = cartItems.map(p => p._id.toString());

      const allPresent = requiredProductIds.every(id => cartProductIds.includes(id));
      if (!allPresent) {
        return res.status(400).json({ message: 'This coupon requires specific combo products in cart.' });
      }

      discountType = coupon.comboOfferDetail?.type;

      if (discountType === 'FlatOff') {
        discountValue = coupon.comboOfferDetail?.flatOffValue || 0;
      } else if (discountType === 'FreeDelivery') {
        discountValue = 0;
      } else if (discountType === 'FreeProduct') {
        if (coupon.comboOfferDetail?.freeProductId) {
          discountType = 'FreeProduct';
          freeProduct = await Product.findById(coupon.comboOfferDetail.freeProductId).lean();
        }
      }

    } else if (coupon.offerType === 'BuyXGetY') {
      const matchingItem = cartItems.find(item => item._id === coupon.buyProduct?.toString());
      if (!matchingItem || matchingItem.quantity < coupon.buyQuantity) {
        return res.status(400).json({ message: `You must buy at least ${coupon.buyQuantity} of the product to get the offer.` });
      }

      discountType = 'BuyXGetY';
    }

    res.json({
      message: "Coupon applied successfully!",
      discountType,
      discountValue,
      coupon,
      freeProduct,
    });

  } catch (error) {
    console.error("Validate Coupon Error:", error);
    res.status(500).json({ message: 'Server error while validating coupon' });
  }
};

module.exports = {
  createCoupon,
  getMyCoupons,
  deleteCoupon,
  validateCoupon,
};