// एक्सप्रेस का राउटर इम्पोर्ट करें
const express = require('express');
const router = express.Router();

// हमारे बनाए हुए कंट्रोलर्स और मिडलवेयर्स को इम्पोर्ट करें
const { createProduct, getProducts, getMyProducts, updateMyProduct, deleteMyProduct, getProductById, addProductReview } = require('../controllers/productController');
const { protect, isVendor } = require('../middlewares/authMiddleware.js');
const upload = require('../config/cloudinary.js');


// '/' पाथ के लिए रूट्स को चेन करें
router.route('/')
    // GET /api/products - सभी प्रोडक्ट्स पाने का पब्लिक राउट
    .get(getProducts)
    
    // POST /api/products - नया प्रोडक्ट बनाने का प्राइवेट राउट (सिर्फ वेंडर के लिए)
    .post(protect, isVendor, upload.single('image'), createProduct);

// राउटर को एक्सपोर्ट करें ताकि server.js में इस्तेमाल हो
 router.route('/myproducts').get(protect, isVendor, getMyProducts);

router.post('/:id/review', protect, addProductReview);

// ... router.route('/') ...

router.route('/:id')
    .get(getProductById)
    // PUT राउट में upload.single('image') जोड़ें
    .put(protect, isVendor, upload.single('image'), updateMyProduct) 
    .delete(protect, isVendor, deleteMyProduct);

module.exports = router;



