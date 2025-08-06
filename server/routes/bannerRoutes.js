const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { uploadBanner, getVendorBanners, getNearbyBanners } = require('../controllers/bannerController');

router.post('/', protect, uploadBanner); // admin/vendor
router.get('/vendor/:vendorId', protect, getVendorBanners);
router.get('/nearby', protect, getNearbyBanners);

module.exports = router;