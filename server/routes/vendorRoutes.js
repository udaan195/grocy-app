const express = require('express');
const router = express.Router();

const { 
    registerVendor, 
    getMyVendorDetails, 
    updateMyVendorDetails, 
    getVendorsByIds 
} = require('../controllers/vendorController');

const { protect, isVendor } = require('../middlewares/authMiddleware');

// ✅ Vendor registration (only for logged-in users)
router.route('/register').post(protect, registerVendor);

// ✅ View and update vendor's own shop details (only for users with vendor role)
router.route('/myshop')
    .get(protect, isVendor, getMyVendorDetails)
    .put(protect, isVendor, updateMyVendorDetails);

// ✅ Get vendors by array of IDs (can be a public route)
router.route('/by-ids').post(getVendorsByIds);

module.exports = router;