const express = require('express');
const router = express.Router();
const { 
    placeOrder, 
    getMyOrders, 
    getVendorOrders, 
    updateOrderStatusByVendor,
    getOrderById, markOrderAsPaid
} = require('../controllers/orderController.js');
const { protect, isVendor, isAdmin } = require('../middlewares/authMiddleware.js');

// POST /api/orders - नया ऑर्डर बनाने का राउट
router.route('/').post(protect, placeOrder);

// GET /api/orders/myorders - ग्राहक के खुद के ऑर्डर्स
router.route('/myorders').get(protect, getMyOrders);

// GET /api/orders/vendor - वेंडर के खुद के ऑर्डर्स
router.route('/vendor').get(protect, isVendor, getVendorOrders);

// GET /api/orders/:id - एक ऑर्डर की डिटेल्स
router.route('/:id').get(protect, getOrderById);

// PUT /api/orders/:id/status - वेंडर द्वारा स्टेटस अपडेट
router.route('/:id/status').put(protect, isVendor, updateOrderStatusByVendor);
router.put('/orders/:id/mark-paid', protect, isAdmin, markOrderAsPaid);
module.exports = router;
