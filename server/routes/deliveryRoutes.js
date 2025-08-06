const express = require('express');
const router = express.Router();
const { calculateDeliveryCharge } = require('../controllers/deliveryController.js');
const { protect } = require('../middlewares/authMiddleware.js'); // if user must be logged in

// ✅ Public API to calculate delivery charges dynamically
router.post('/calculate', protect, calculateDeliveryCharge);

module.exports = router;