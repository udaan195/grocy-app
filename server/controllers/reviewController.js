const Review = require('../models/reviewModel');
const Product = require('../models/productModel');

const addReview = async (req, res) => {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    const alreadyReviewed = await Review.findOne({ product: productId, user: req.user._id });
    if (alreadyReviewed) {
        return res.status(400).json({ message: 'You have already reviewed this product.' });
    }

    const review = await Review.create({
        product: productId,
        user: req.user._id,
        rating,
        comment,
    });

    const reviews = await Review.find({ product: productId });
    const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
        rating: average,
        numReviews: reviews.length
    });

    res.status(201).json({ message: 'Review submitted successfully.' });
};

const getProductReviews = async (req, res) => {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name');
    res.json(reviews);
};

module.exports = { addReview, getProductReviews };