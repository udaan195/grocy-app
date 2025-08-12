const express = require('express');
const router = express.Router();
const { getActiveBanners } = require('../controllers/bannerController.js');

router.route('/').get(getActiveBanners);
module.exports = router;
