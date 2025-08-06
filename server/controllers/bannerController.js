const Banner = require('../models/bannerModel');
const cloudinary = require('cloudinary').v2;

// Cloudinary Config (Already done in your app.js or config file)

const uploadBanner = async (req, res) => {
  try {
    const { title, image, vendorId } = req.body;
    const uploaderId = req.user._id;

    const vendor = req.user.role === 'admin' ? vendorId : uploaderId;

    if (!image || !title) {
      return res.status(400).json({ message: 'Title and image are required.' });
    }

    const uploadRes = await cloudinary.uploader.upload(image, {
      folder: 'banners'
    });

    const banner = await Banner.create({
      vendor,
      title,
      image: uploadRes.secure_url
    });

    res.status(201).json(banner);
  } catch (err) {
    console.error('❌ Banner Upload Error:', err);
    res.status(500).json({ message: 'Banner upload failed' });
  }
};

const getVendorBanners = async (req, res) => {
  const vendorId = req.params.vendorId;
  const banners = await Banner.find({ vendor: vendorId }).sort({ createdAt: -1 });
  res.json(banners);
};

const getNearbyBanners = async (req, res) => {
  const user = await require('../models/userModel').findById(req.user._id);
  const banners = await Banner.find().populate('vendor');

  const haversine = (lat1, lon1, lat2, lon2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const nearby = banners.filter(b => {
    const v = b.vendor;
    if (!v || !v.location) return false;
    const dist = haversine(user.location.lat, user.location.lon, v.location.lat, v.location.lon);
    return dist <= 10;
  });

  res.json(nearby);
};

module.exports = {
  uploadBanner,
  getVendorBanners,
  getNearbyBanners
};