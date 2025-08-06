const express = require('express');
const router = express.Router();
const {
  addShippingAddress,
  getShippingAddresses,
  updateAddress,
  deleteAddress,
  getUserNotifications
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// ✅ Address routes
router.post('/address', protect, addShippingAddress);
router.get('/address', protect, getShippingAddresses);
router.put('/address/:id', protect, updateAddress);
router.delete('/address/:id', protect, deleteAddress);

// ✅ Notification route
router.get('/:id/notifications', getUserNotifications);

module.exports = router;