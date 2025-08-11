// server/utils/notificationHelper.js  (नया नाम या replace existing socketHelper.js)
const Notification = require('../models/notificationModel');
const Vendor = require('../models/vendorModel');
const { sendTelegramNotification } = require('./notificationService');

// payload: { vendorId, type, message, link, orderId, extra }
const createAndSendNotification = async (vendorId, payload) => {
  try {
    // 1) Save notification in DB (so admin/vendor can see history)
    const notification = await Notification.create({
      user: vendorId,
      message: payload.message,
      type: payload.type || 'generic',
      orderId: payload.orderId || null,
      link: payload.link || null,
      read: false,
    });

    // 2) Try to fetch vendor's telegram chat id
    const vendor = await Vendor.findById(vendorId);
    if (vendor && vendor.telegramChatId) {
      const telegramMessage = buildTelegramMessage(payload, vendor);
      const ok = await sendTelegramNotification(vendor.telegramChatId, telegramMessage);
      if (!ok) {
        console.warn('Telegram send failed, notification saved for vendor:', vendorId);
      }
    } else {
      console.log('Vendor has no telegramChatId; notification saved only.', vendorId);
    }

    return notification;
  } catch (err) {
    console.error('createAndSendNotification error:', err);
    throw err;
  }
};

function buildTelegramMessage(payload, vendor) {
  // payload expected to contain orderId, message, items (optional), total, payment, shippingAddress etc.
  // Build a neat HTML message
  const lines = [];
  lines.push('<b>🛒 New