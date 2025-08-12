const Vendor = require('../models/vendorModel.js');
const User = require('../models/userModel.js');
const Order = require('../models/orderModel.js');
const Product = require('../models/productModel.js');
const Banner = require('../models/bannerModel.js'); 


// @desc    Get all vendors by admin (with optional status filter)
const getAllVendors = async (req, res) => {
    try {
        const statusFilter = req.query.status ? { status: req.query.status } : {};
        const vendors = await Vendor.find({ ...statusFilter }).populate('owner', 'email');
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update vendor details by admin
// @desc    Update vendor details by admin
const updateVendorStatus = async (req, res) => {
    const {
        status,
        serviceRadius,
        hyperlocalRadius,
        minCartValueHyperlocal,
        minCartValueRegular,
        freeDeliveryRadius,
        baseDeliveryCharge,
        baseDeliveryRadius,
        extraChargePerUnit,
        extraChargeUnitDistance
    } = req.body;

    try {
        const vendor = await Vendor.findById(req.params.id);
        if (vendor) {
            if (status) vendor.status = status;

            if (serviceRadius !== undefined && serviceRadius !== '') {
                vendor.serviceRadius = Number(serviceRadius);
            }

            if (hyperlocalRadius !== undefined && hyperlocalRadius !== '') {
                vendor.hyperlocalRadius = Number(hyperlocalRadius);
            }

            if (minCartValueHyperlocal !== undefined && minCartValueHyperlocal !== '') {
                vendor.minCartValueHyperlocal = Number(minCartValueHyperlocal);
            }

            if (minCartValueRegular !== undefined && minCartValueRegular !== '') {
                vendor.minCartValueRegular = Number(minCartValueRegular);
            }

            // ✅ New delivery charges related fields
            if (freeDeliveryRadius !== undefined && freeDeliveryRadius !== '') {
                vendor.freeDeliveryRadius = Number(freeDeliveryRadius);
            }

            if (baseDeliveryCharge !== undefined && baseDeliveryCharge !== '') {
                vendor.baseDeliveryCharge = Number(baseDeliveryCharge);
            }

            if (baseDeliveryRadius !== undefined && baseDeliveryRadius !== '') {
                vendor.baseDeliveryRadius = Number(baseDeliveryRadius);
            }

            if (extraChargePerUnit !== undefined && extraChargePerUnit !== '') {
                vendor.extraChargePerUnit = Number(extraChargePerUnit);
            }

            if (extraChargeUnitDistance !== undefined && extraChargeUnitDistance !== '') {
                vendor.extraChargeUnitDistance = Number(extraChargeUnitDistance);
            }

            await vendor.save();
            res.json({ message: 'Vendor details updated successfully' });
        } else {
            res.status(404).json({ message: 'Vendor not found' });
        }
    } catch (error) {
        console.error("Update Vendor Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all orders by admin
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .populate('vendor', 'name');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update order status by admin
const updateOrderStatusByAdmin = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = req.body.status || order.status;
            await order.save();
            res.json({ message: 'Order status updated successfully' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all products by admin
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({})
            .populate('vendor', 'name');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a product by admin
const deleteProductByAdmin = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.remove();
            res.json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get app settings



// ✅ New: Admin Dashboard Summary
const getAdminDashboardSummary = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalVendors = await Vendor.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        const totalRevenueData = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = totalRevenueData[0]?.total || 0;

        // 🕒 Daily Orders (last 7 days)
        const pastWeek = new Date();
        pastWeek.setDate(pastWeek.getDate() - 7);
        const dailyOrders = await Order.aggregate([
            { $match: { createdAt: { $gte: pastWeek } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 🥇 Top Categories (by product count)
        const topCategories = await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // 🥇 Top Vendors (by product count)
        const topVendors = await Product.aggregate([
            {
                $group: {
                    _id: "$vendor",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Resolve vendor names
        const vendorIds = topVendors.map(v => v._id);
        const vendorData = await Vendor.find({ _id: { $in: vendorIds } });
        const topVendorsWithName = topVendors.map(v => {
            const vendor = vendorData.find(vd => vd._id.toString() === v._id.toString());
            return {
                name: vendor?.shopName || "Unknown",
                count: v.count
            };
        });

        res.json({
            totalUsers,
            totalVendors,
            totalProducts,
            totalOrders,
            totalRevenue,
            dailyOrders,
            topCategories,
            topVendors: topVendorsWithName
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
// @desc    Get dashboard stats for admin
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalVendors = await Vendor.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        // Optional: Daily order counts (last 7 days)
        const last7Days = [...Array(7)].map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        });

        const orderData = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            }
        ]);

        const orderStats = last7Days.reverse().map(date => {
            const found = orderData.find(d => d._id === date);
            return { date, count: found ? found.count : 0 };
        });

        // Category-wise product count
        const categoryStats = await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            totalUsers,
            totalVendors,
            totalProducts,
            totalOrders,
            orderStats,
            categoryStats
        });

    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
// @desc Dashboard Summary for Admin
// @desc    Get dashboard summary for admin
const getDashboardSummary = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalVendors = await Vendor.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalSales = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        const totalProducts = await Product.countDocuments();

        res.json({
            users: totalUsers,
            vendors: totalVendors,
            orders: totalOrders,
            sales: totalSales[0]?.total || 0,
            products: totalProducts
        });
    } catch (error) {
        console.error("Dashboard summary error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
// @desc    Vendor wise sales summary
// @desc    Get vendor sales summary
const getVendorSalesSummary = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'delivered' }).populate('vendor');

    const summary = {};

    for (const order of orders) {
      const vendorId = order.vendor?._id?.toString();
      if (!vendorId) continue;

      if (!summary[vendorId]) {
        summary[vendorId] = {
          vendorName: order.vendor.name,
          totalSales: 0,
          orderCount: 0,
        };
      }

      summary[vendorId].totalSales += order.totalAmount;
      summary[vendorId].orderCount += 1;
    }

    res.json(Object.values(summary));
  } catch (error) {
    console.error('Vendor Sales Summary Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
// Vendor wise sales summary


const getVendorWiseSalesSummary = async (req, res) => {
    try {
        const vendors = await Vendor.find();
        const result = [];

        for (const vendor of vendors) {
            const orders = await Order.find({ vendor: vendor._id });
            const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);
            result.push({
                vendorName: vendor.name,
                totalSales: totalSales,
            });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales summary' });
    }
};

const createBanner = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Image is required.' });
        const { title, vendor } = req.body;
        const newBanner = new Banner({ title, vendor, image: req.file.path });
        await newBanner.save();
        res.status(201).json(newBanner);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find({}).populate('vendor', 'shopName');
        res.json(banners);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (banner) {
            await banner.deleteOne();
            res.json({ message: 'Banner removed' });
        } else {
            res.status(404).json({ message: 'Banner not found' });
        }
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};


module.exports = {
    getAllVendors,
    updateVendorStatus,
    getAllOrders,
    updateOrderStatusByAdmin,
    getAllProducts,
    deleteProductByAdmin, getAdminDashboardSummary, getDashboardStats, getDashboardSummary, getVendorSalesSummary, getVendorWiseSalesSummary, createBanner, deleteBanner, getAllBanners
};

