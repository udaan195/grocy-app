const express = require('express');
const router = express.Router();
const { getActiveBanners } = require('../controllers/bannerController.js');

// यह एक पब्लिक राउट है
router.route('/').get(getActiveBanners);

module.exports = router;
