const express = require('express');
const { addReview, getProductReviews } = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/:productId', protect, addReview);
router.get('/:productId', getProductReviews);

module.exports = router;