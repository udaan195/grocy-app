const Vendor = require('../models/vendorModel.js');
const { haversineDistance } = require('../utils/haversineHelper.js'); // 🧠 optional helper file

const calculateDeliveryCharge = async (req, res) => {
  try {
    const { cartItems, customerLocation } = req.body;

    if (!cartItems || !customerLocation?.coordinates) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const vendorIds = [...new Set(cartItems.map(item => item.vendor))];
    let totalCharge = 0;

    for (const vendorId of vendorIds) {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor?.location?.coordinates) continue;

      const customerCoords = {
        lat: customerLocation.coordinates[1],
        lon: customerLocation.coordinates[0],
      };

      const vendorCoords = {
        lat: vendor.location.coordinates[1],
        lon: vendor.location.coordinates[0],
      };

      const distance = haversineDistance(customerCoords, vendorCoords); // in meters

      let charge = 0;
      if (distance <= vendor.freeDeliveryRadius) {
        charge = 0;
      } else if (distance <= vendor.baseDeliveryRadius) {
        charge = vendor.baseDeliveryCharge;
      } else {
        const extraDistance = distance - vendor.baseDeliveryRadius;
        const units = Math.ceil(extraDistance / vendor.extraChargeUnitDistance);
        charge = vendor.baseDeliveryCharge + (units * vendor.extraChargePerUnit);
      }

      totalCharge += charge;
    }

    return res.json({ deliveryCharge: totalCharge });
  } catch (err) {
    console.error("🚨 Delivery charge calc failed:", err);
    res.status(500).json({ message: 'Delivery calculation failed' });
  }
};

module.exports = {
  calculateDeliveryCharge,
};