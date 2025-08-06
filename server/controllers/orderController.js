const { sendTelegramNotification } = require('../utils/notificationService.js');
const { haversineDistance } = require('../utils/distanceHelper.js');
const Order = require('../models/orderModel.js');
const Product = require('../models/productModel.js');
const Vendor = require('../models/vendorModel.js');
const User = require('../models/userModel.js');
const Offer = require('../models/couponModel.js');


// ✅ Place Order
const placeOrder = async (req, res) => {
    try {
        const { cartItems, shippingAddress, paymentMethod, appliedCoupon } = req.body;
        const customer = await User.findById(req.user._id);

        const vendorGroups = {};
        for (const item of cartItems) {
            const product = await Product.findById(item._id).populate('vendor');
            if (!product || !product.vendor) continue;
            const vendorId = product.vendor._id.toString();
            if (!vendorGroups[vendorId]) {
                vendorGroups[vendorId] = { vendor: product.vendor, items: [] };
            }
            vendorGroups[vendorId].items.push({ ...item, productDetails: product });
        }

        let finalDiscount = 0;
        if (appliedCoupon) {
            const coupon = await Offer.findOne({ couponCode: appliedCoupon, isActive: true });
            if (coupon) {
                const totalCartValue = cartItems.reduce((sum, item) => sum + item.quantity * item.discountedPrice, 0);
                if (coupon.offerType === 'Welcome' && totalCartValue >= (coupon.minPurchaseWelcome || 0)) {
                    const detail = coupon.welcomeOfferDetail || {};
                    if (detail.type === 'FlatOff') {
                        finalDiscount = detail.flatOffValue || 0;
                    } else if (detail.type === 'Percentage') {
                        finalDiscount = Math.floor((totalCartValue * (detail.percentOff || 0)) / 100);
                    }
                }
            }
        }

        for (const vendorId in vendorGroups) {
            const group = vendorGroups[vendorId];
            let deliveryCharge = 0;
            const itemsTotal = group.items.reduce((sum, item) => sum + item.quantity * item.discountedPrice, 0);
            const vendor = await Vendor.findById(vendorId);

            // 🚚 Delivery charge calculation
            if (vendor?.location?.coordinates?.length > 0 && shippingAddress?.location?.coordinates?.length > 0) {
                const customerCoords = {
                    lat: shippingAddress.location.coordinates[1],
                    lon: shippingAddress.location.coordinates[0]
                };
                const vendorCoords = {
                    lat: vendor.location.coordinates[1],
                    lon: vendor.location.coordinates[0]
                };
                const distance = haversineDistance(customerCoords, vendorCoords);

                if (distance <= vendor.freeDeliveryRadius) {
                    deliveryCharge = 0;
                } else if (distance <= vendor.baseDeliveryRadius) {
                    deliveryCharge = vendor.baseDeliveryCharge;
                } else {
                    const extraDistance = distance - vendor.baseDeliveryRadius;
                    const extraChargeUnits = Math.ceil(extraDistance / vendor.extraChargeUnitDistance);
                    deliveryCharge = vendor.baseDeliveryCharge + (extraChargeUnits * vendor.extraChargePerUnit);
                }
            }

            const totalAmount = itemsTotal + deliveryCharge - finalDiscount;

            const newOrder = await Order.create({
                customer: req.user._id,
                vendor: vendorId,
                items: group.items.map(i => ({
                    product: i._id,
                    name: i.name,
                    quantity: i.quantity,
                    price: i.discountedPrice,
                    image: i.image,
                    quantityValue: i.quantityValue,
                    quantityUnit: i.quantityUnit
                })),
                shippingAddress,
                paymentMethod,
                itemsTotal,
                deliveryCharge,
                discountAmount: finalDiscount,
                appliedCoupon: appliedCoupon || null,
                totalAmount
            });

            // 🔔 Real-time Socket Notification
            

            // 📲 Telegram Notification (per vendor)
            if (vendor?.telegramChatId) {
                const itemLines = group.items.map((item, index) => {
                    return `${index + 1}. <b>${item.name}</b> - ${item.quantity} ${item.quantityValue}${item.quantityUnit} @ ₹${item.discountedPrice}`;
                }).join('\n');

                const message = `
<b>🛒 नया ऑर्डर प्राप्त हुआ!</b>

<b>🧾 Order ID:</b> ${newOrder._id}
<b>🏪 Shop:</b> ${vendor.shopName}
<b>🧍‍♂️ Customer:</b> ${shippingAddress.fullName}
<b>📍 Address:</b>
${shippingAddress.houseNo}, ${shippingAddress.area}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}

<b>🛍 Items:</b>
${itemLines}

<b>💰 Total:</b> ₹${totalAmount}
<b>💳 Payment Mode:</b> ${paymentMethod}
${appliedCoupon ? `<b>🎟 Coupon Applied:</b> ${appliedCoupon}` : ''}
                `.trim();

                await sendTelegramNotification(vendor.telegramChatId, message);
            }
        }

        res.status(201).json({ message: 'Order placed successfully!' });
    } catch (error) {
        console.error("Place Order Error:", error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
// 👇 बाकी सारे unchanged methods same रहते हैं
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id })
            .populate('vendor', 'shopName')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getVendorOrders = async (req, res) => {
    try {
        if (!req.user.vendorInfo) {
            return res.status(400).json({ message: 'User is not a vendor' });
        }

        const statusFilter = req.query.status ? { status: req.query.status } : {};
        const orders = await Order.find({ vendor: req.user.vendorInfo, ...statusFilter })
            .populate('customer', 'name email')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateOrderStatusByVendor = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('customer', 'email');
        
        if (order && order.vendor.toString() === req.user.vendorInfo.toString()) {
            const previousStatus = order.orderStatus;
            order.orderStatus = req.body.status || order.orderStatus;
            order.estimatedDeliveryTime = req.body.deliveryTime || order.estimatedDeliveryTime;

            // ✅ अगर स्टेटस 'delivered' हो गया और पहले नहीं था तो सेलिंग अपडेट करो
            if (order.orderStatus === 'delivered' && previousStatus !== 'delivered') {
                for (let item of order.orderItems) {
                    const product = await Product.findById(item.product);
                    if (product) {
                        product.totalSold += item.quantity;
                        await product.save();
                    }
                }
            }

            await order.save();
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found or not authorized' });
        }
    } catch (error) {
        console.error("Order Update Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email')
            .populate('vendor', 'shopName owner');

        if (order) {
            const isCustomer = order.customer._id.toString() === req.user._id.toString();
            const isVendorOwner = order.vendor.owner.toString() === req.user._id.toString();

            if (isCustomer || isVendorOwner) {
                res.json(order);
            } else {
                res.status(401).json({ message: 'Not authorized to view this order' });
            }
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
// @desc    Mark order as paid (admin only)
const markOrderAsPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.paymentStatus = 'Paid';
        await order.save();

        res.json({ message: 'Order marked as Paid' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    placeOrder,
    getMyOrders,
    getVendorOrders,
    updateOrderStatusByVendor,
    getOrderById,markOrderAsPaid
};