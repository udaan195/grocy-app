const Banner = require('../models/bannerModel.js');
const Vendor = require('../models/vendorModel.js');

const getActiveBanners = async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.json([]);

        // वेंडर की अधिकतम सर्विस रेंज (जैसे 50km) में बैनर ढूंढें
        const maxRadius = 50 * 1000; 

        const nearbyVendors = await Vendor.find({
            location: {
                $nearSphere: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] },
                    $maxDistance: maxRadius
                }
            },
            status: 'approved'
        }).select('_id');
        
        if (nearbyVendors.length === 0) {
            return res.json([]);
        }

        const vendorIds = nearbyVendors.map(v => v._id);

        const banners = await Banner.find({ 
            vendor: { $in: vendorIds }, 
            isActive: true 
        });

        res.json(banners);
    } catch (error) {
        console.error("Get Banners Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getActiveBanners };
