const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getMyCoupons,
  deleteCoupon,
  validateCoupon,
} = require('../controllers/couponController');

const { protect, isVendor } = require('../middlewares/authMiddleware');

// 🟢 ADD THESE ROUTES 👇
router.post('/welcome', protect, isVendor, createCoupon);
router.post('/combo', protect, isVendor, createCoupon);
router.post('/buyxgety', protect, isVendor, createCoupon);

// 🟢 Existing routes
router.get('/mycoupons', protect, isVendor, getMyCoupons);
router.delete('/:id', protect, isVendor, deleteCoupon);
router.post('/validate', protect, validateCoupon);

module.exports = router;