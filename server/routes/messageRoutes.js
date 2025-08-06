const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/messageController.js');
const { protect } = require('../middlewares/authMiddleware');

router.route('/:orderId').get(protect, getMessages).post(protect, sendMessage);

module.exports = router;
