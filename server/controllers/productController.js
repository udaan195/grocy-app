const Product = require('../models/productModel.js');
const Vendor = require('../models/vendorModel.js');

// --- दूरी की गणना करने का फंक्शन ---
function haversineDistance(coords1, coords2) {
    function toRad(x) { return x * Math.PI / 180; }
    const R = 6371;
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lon - coords1.lon);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);
    const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// @desc    products based on location, category, and search
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const { lat, lon, category, search } = req.query;
        if (!lat || !lon) return res.status(400).json({ message: "Location is required." });

        const maxDiscoveryRadius = 1000 * 1000;
        const allNearbyVendors = await Vendor.find({
            location: {
                $nearSphere: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] },
                    $maxDistance: maxDiscoveryRadius
                }
            },
            status: 'approved'
        });

        const customerCoords = { lat: parseFloat(lat), lon: parseFloat(lon) };
        
        const wideRangeVendors = allNearbyVendors.filter(v =>
            v.serviceRadius > 0 &&
            (haversineDistance(customerCoords, {
                lat: v.location.coordinates[1],
                lon: v.location.coordinates[0]
            }) * 1000) <= v.serviceRadius
        );

        const hyperlocalVendors = allNearbyVendors.filter(v =>
            v.hyperlocalRadius > 0 &&
            (haversineDistance(customerCoords, {
                lat: v.location.coordinates[1],
                lon: v.location.coordinates[0]
            }) * 1000) <= v.hyperlocalRadius
        );

        const wideRangeVendorIds = wideRangeVendors.map(v => v._id);
        const hyperlocalVendorIds = hyperlocalVendors.map(v => v._id);

        if (wideRangeVendorIds.length === 0 && hyperlocalVendorIds.length === 0) {
            return res.json([]);
        }

        const productFilter = {
            $or: [
                { vendor: { $in: wideRangeVendorIds }, isHyperlocal: false },
                { vendor: { $in: hyperlocalVendorIds }, isHyperlocal: true }
            ]
        };

       if (category && category.toLowerCase() !== 'all') {
            // केस-इन्सेंसिटिव मैचिंग के लिए रेगुलर एक्सप्रेशन का इस्तेमाल करें
            // यह 'Dairy & Bakery' और 'dairy & bakery' दोनों को ढूंढेगा
            productFilter.category = { $regex: `^${category}$`, $options: 'i' };
        }
        if (search && search.trim() !== '') {
            productFilter.name = { $regex: search.trim(), $options: 'i' };
        }

        const products = await Product.find(productFilter);
        res.json(products);

    } catch (error) {
        console.error("Get Products Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ✅ FIXED: @desc Get a single product with related suggestions
// @route GET /api/products/:id
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('vendor', 'shopName');

        if (!product) return res.status(404).json({ message: 'Product not found' });

        const vendorId = product.vendor?._id || product.vendor;

        const relatedProducts = await Product.find({
            vendor: vendorId,
            _id: { $ne: product._id }
        }).limit(4);

        return res.status(200).json({ product, relatedProducts });

    } catch (error) {
        console.error("Get Product Error:", error);
        return res.status(500).json({ message: 'Server Error' });
    }
};

// ---------------------- Other controllers ---------------------- //

const createProduct = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Image upload is required.' });

        const { name, description, category, quantityValue, quantityUnit, originalPrice, discountedPrice, stock, deliveryCharge, isHyperlocal } = req.body;
        const imageUrl = req.file.path;
        const vendorId = req.user.vendorInfo;

        const product = new Product({
            vendor: vendorId,
            name,
            description,
            category,
            quantityValue,
            quantityUnit,
            originalPrice,
            discountedPrice,
            stock,
            deliveryCharge,
            isHyperlocal: isHyperlocal || false,
            image: imageUrl
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({ vendor: req.user.vendorInfo });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateMyProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product && product.vendor.toString() === req.user.vendorInfo.toString()) {
            const { name, description, category, quantityValue, quantityUnit, originalPrice, discountedPrice, stock, deliveryCharge, minOrderQuantity, isHyperlocal } = req.body;

            if (name) product.name = name;
            if (description) product.description = description;
            if (category) product.category = category;
            if (quantityUnit) product.quantityUnit = quantityUnit;
            if (quantityValue !== undefined) product.quantityValue = Number(quantityValue);
            if (originalPrice !== undefined) product.originalPrice = Number(originalPrice);
            if (discountedPrice !== undefined) product.discountedPrice = Number(discountedPrice);
            if (stock !== undefined) product.stock = Number(stock);
            if (deliveryCharge !== undefined) product.deliveryCharge = Number(deliveryCharge);
            if (minOrderQuantity !== undefined) product.minOrderQuantity = Number(minOrderQuantity);
            if (isHyperlocal !== undefined) product.isHyperlocal = isHyperlocal;

            if (req.file) {
                product.image = req.file.path;
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found or not authorized' });
        }
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteMyProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product && product.vendor.toString() === req.user.vendorInfo.toString()) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found or not authorized' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const addProductReview = async (req, res) => {
    const { rating, comment } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ message: "Product not found" });

        const existingReviewIndex = product.reviews.findIndex(
            r => r.user.toString() === req.user._id.toString()
        );

        if (existingReviewIndex !== -1) {
            // ✅ User has already reviewed — update existing review
            product.reviews[existingReviewIndex].rating = Number(rating);
            product.reviews[existingReviewIndex].comment = comment;
            product.reviews[existingReviewIndex].createdAt = new Date();
        } else {
            // ✅ New Review
            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id,
                createdAt: new Date()
            };
            product.reviews.push(review);
            product.numReviews = product.reviews.length;
        }

        // ✅ Recalculate average rating
        product.rating =
            product.reviews.reduce((acc, r) => r.rating + acc, 0) / product.reviews.length;

        await product.save();
        res.status(201).json({ message: "Review submitted successfully." });
    } catch (error) {
        console.error("Review Submit Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// --------------------- EXPORT --------------------- //
module.exports = {
    getProducts,
    getProductById,
    createProduct,
    getMyProducts,
    updateMyProduct,
    deleteMyProduct,
    addProductReview
};