const Banner = require('../models/bannerModel.js');
const Vendor = require('../models/vendorModel.js');

const getActiveBanners = async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.json([]);

        const nearbyVendors = await Vendor.find({
            location: { $nearSphere: { $geometry: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] }, $maxDistance: 10000 } },
            status: 'approved'
        }).select('_id');

        const vendorIds = nearbyVendors.map(v => v._id);
        const banners = await Banner.find({ vendor: { $in: vendorIds }, isActive: true });
        res.json(banners);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};
module.exports = { getActiveBanners };
