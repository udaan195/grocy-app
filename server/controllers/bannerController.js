const Banner = require('../models/bannerModel.js');
const Vendor = require('../models/vendorModel.js'); // इसे रखें, बाद में ज़रूरत पड़ेगी

const getActiveBanners = async (req, res) => {
    try {
        console.log("--- RUNNING BANNER TEST: IGNORING LOCATION FILTER ---");

        // अस्थायी रूप से, सभी एक्टिव बैनर्स को ढूंढें, चाहे वेंडर कहीं भी हो
        const banners = await Banner.find({ isActive: true });

        console.log(`Found ${banners.length} active banners in total.`);
        res.json(banners);

    } catch (error) {
        console.error("Get Banners Error (Test Mode):", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getActiveBanners };
