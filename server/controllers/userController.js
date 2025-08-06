const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// टोकन बनाने का हेल्पर फंक्शन
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// ✅ Updated: Add a new address to user profile (with geolocation & strict check)
// @desc    Add a new address to user profile
// @route   POST /api/users/address
// @access  Private
const addShippingAddress = async (req, res) => {
    try {
        const { 
            fullName, phoneNumber, pincode, state, city, houseNo, area, landmark, 
            latitude, longitude // ✅ नए फील्ड्स जो frontend से आ सकते हैं
        } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        let finalCoordinates = [];

        // ✅ Step 1: अगर latitude और longitude मौजूद हैं, तो उन्हें इस्तेमाल करें
        if (latitude && longitude) {
            finalCoordinates = [parseFloat(longitude), parseFloat(latitude)];
        } else {
            // ✅ Step 2: Geolocation (fallback to Nominatim)
            const addressString = `${houseNo}, ${area}, ${city}, ${state}, ${pincode}`;
            const { data } = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressString)}&format=json&limit=1`);
            if (data.length > 0) {
                finalCoordinates = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
            } else {
                return res.status(400).json({ message: "Could not find location for this address." });
            }
        }

        // ✅ Step 3: Add address
        const newAddress = { 
            fullName, phoneNumber, pincode, state, city, houseNo, area, landmark,
            latitude: finalCoordinates[1],
            longitude: finalCoordinates[0],
            location: { type: 'Point', coordinates: finalCoordinates }
        };

        user.addresses.push(newAddress);
        await user.save();
        res.status(201).json(user.addresses);

    } catch (error) {
        console.error("Add Address Error:", error);
        res.status(500).json({ message: "Server error while saving address." });
    }
};

// बाकी सब फंक्शन्स पहले जैसे ही:

// @desc    Get all addresses of a user
const getShippingAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json(user.addresses);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a user's shipping address
const updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const addressId = req.params.id;

        if (user) {
            const address = user.addresses.id(addressId);
            if (address) {
                address.set(req.body);
                await user.save();
                res.json(user.addresses);
            } else {
                res.status(404).json({ message: 'Address not found' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a user's shipping address
const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const addressId = req.params.id;

        if (user) {
            user.addresses.pull({ _id: addressId });
            await user.save();
            res.json(user.addresses);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Complete user profile after OTP login
const completeUserProfile = async (req, res) => {
    try {
        const { name, phoneNumber } = req.body;
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = name || user.name;
            user.phoneNumber = phoneNumber || user.phoneNumber;
            user.otp = null;
            user.otpExpires = null;
            await user.save();

            res.json({
                message: 'Profile completed successfully!',
                token: generateToken(user._id, user.role),
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error completing profile:", error);
        res.status(500).json({ message: 'Server error while completing profile' });
    }
};
const Notification = require('../models/notificationModel');

const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.params.id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
    addShippingAddress,
    getShippingAddresses,
    updateAddress,
    deleteAddress,
    completeUserProfile,
    getUserNotifications // <-- ✅ इसे export करो
};
