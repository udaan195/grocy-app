const Vendor = require('../models/vendorModel');
const User = require('../models/userModel');

// @desc    Register a new vendor
// @route   POST /api/vendors/register
// @access  Private
const registerVendor = async (req, res) => {
    try {
        const { shopName, shopAddress, longitude, latitude, telegramId } = req.body;
        const userId = req.user._id;

        const existingVendor = await Vendor.findOne({ owner: userId });
        if (existingVendor) {
            return res.status(400).json({ message: 'User is already a vendor' });
        }

        const vendor = await Vendor.create({
            owner: userId,
            shopName,
            shopAddress,
            telegramId,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            }
        });

        const user = await User.findById(userId);
        user.role = 'vendor';
        user.vendorInfo = vendor._id;
        await user.save();

        res.status(201).json({
            message: 'Vendor registered successfully!',
            vendor
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get the logged-in vendor's shop details
// @route   GET /api/vendors/myshop
// @access  Private/Vendor
const getMyVendorDetails = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.user.vendorInfo);
        if (vendor) {
            res.json(vendor);
        } else {
            res.status(404).json({ message: 'Vendor details not found for this user.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update the logged-in vendor's shop details
// @route   PUT /api/vendors/myshop
// @access  Private/Vendor
const updateMyVendorDetails = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.user.vendorInfo);
        
        if (vendor) {
            vendor.shopName = req.body.shopName || vendor.shopName;
            vendor.shopAddress = req.body.shopAddress || vendor.shopAddress;
            vendor.telegramId = req.body.telegramId || vendor.telegramId;

            const updatedVendor = await vendor.save();
            res.json(updatedVendor);
        } else {
            res.status(404).json({ message: 'Vendor details not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get multiple vendors by their IDs
// @route   POST /api/vendors/by-ids
// @access  Public
const getVendorsByIds = async (req, res) => {
    try {
        const { vendorIds } = req.body;

        if (!vendorIds || !Array.isArray(vendorIds)) {
            return res.status(400).json({ message: "Vendor IDs must be an array." });
        }

        const vendors = await Vendor.find({ '_id': { $in: vendorIds } });
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { 
    registerVendor, 
    getMyVendorDetails, 
    updateMyVendorDetails,
    getVendorsByIds 
};