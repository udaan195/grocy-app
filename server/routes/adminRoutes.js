const express = require('express');
const router = express.Router();

// --- कंट्रोलर से सभी फंक्शन्स को यहाँ इम्पोर्ट करें ---
const { 
    getAllVendors, 
    updateVendorStatus,
    getAllOrders,
    updateOrderStatusByAdmin,
    getAllProducts,
    deleteProductByAdmin,
    getAdminDashboardSummary, 
    getDashboardStats, 
    getVendorSalesSummary, 
    getVendorWiseSalesSummary  // ✅ New imports
} = require('../controllers/adminController');

const { protect, isAdmin } = require('../middlewares/authMiddleware');

// ✅ Dashboard Summary Routes
router.get('/dashboard-summary', protect, isAdmin, getAdminDashboardSummary);
router.get('/stats', protect, isAdmin, getDashboardStats);
router.get('/vendor-sales-summary', protect, isAdmin, getVendorSalesSummary);
router.route('/dashboard/vendor-sales').get(protect, isAdmin, getVendorWiseSalesSummary);

// 🧾 Vendor Routes
router.route('/vendors').get(protect, isAdmin, getAllVendors);
router.route('/vendors/:id/status').put(protect, isAdmin, updateVendorStatus);

// 📦 Order Routes
router.route('/orders').get(protect, isAdmin, getAllOrders);
router.route('/orders/:id/status').put(protect, isAdmin, updateOrderStatusByAdmin);

// 🛒 Product Routes
router.route('/products').get(protect, isAdmin, getAllProducts);
router.route('/products/:id').delete(protect, isAdmin, deleteProductByAdmin);

// ✨ Future: Settings Routes...

module.exports = router;