import React, { useState, useEffect } from 'react';
import axios from '../../api.js';

const AdminManageOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [groupedOrders, setGroupedOrders] = useState({}); // ग्रुप किए हुए ऑर्डर्स के लिए नई state
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem('token');

    const fetchOrders = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            const { data } = await axios.get('https://grocy-app-server.onrender.com/api/admin/orders', config);
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // --- यह नया लॉजिक है जो ऑर्डर्स को ग्रुप करेगा ---
    useEffect(() => {
        const groupByVendor = orders.reduce((acc, order) => {
            // वेंडर का नाम निकालें, अगर वेंडर डिलीट हो गया है तो 'Unknown Vendor' दिखाएं
            const vendorName = order.vendor?.shopName || 'Unknown Vendor';
            // अगर ग्रुप पहले से नहीं है, तो एक नया बनाएं
            if (!acc[vendorName]) {
                acc[vendorName] = [];
            }
            // उस ग्रुप में ऑर्डर को डालें
            acc[vendorName].push(order);
            return acc;
        }, {});
        setGroupedOrders(groupByVendor);
    }, [orders]); // यह तब चलेगा जब भी orders की लिस्ट बदलेगी
    // ---------------------------------------------

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            await axios.put(`https://grocy-app-server.onrender.com/api/admin/orders/${orderId}/status`, { status: newStatus }, config);
            fetchOrders(); // लिस्ट को रिफ्रेश करें
        } catch (error) {
            alert('Failed to update order status.');
        }
    };

    if (loading) return <p>Loading all orders...</p>;

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Manage All Orders</h1>
            {Object.keys(groupedOrders).length === 0 ? <p>No orders found.</p> : (
                // हर वेंडर के लिए एक सेक्शन बनाएं
                Object.keys(groupedOrders).map(vendorName => (
                    <div key={vendorName} style={{ marginBottom: '2rem' }}>
                        <h3 style={{ backgroundColor: '#f0f2f5', padding: '1rem', borderRadius: '8px' }}>
                            Shop: {vendorName}
                        </h3>
                        {groupedOrders[vendorName].map(order => (
                            <div key={order._id} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0', borderRadius: '8px' }}>
                                <p><b>Order ID:</b> {order._id}</p>
                                <p><b>Customer:</b> {order.customer?.email || 'N/A'}</p>
                                <p><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</p>
                                <p><b>Total:</b> ₹{order.totalAmount.toFixed(2)}</p>
                                <p><b>Status:</b> {order.orderStatus}</p>
                                <div style={{ marginTop: '10px' }}>
                                    <label>Change Status: </label>
                                    <select 
                                        value={order.orderStatus} 
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                    >
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                ))
            )}
        </div>
    );
};

export default AdminManageOrdersPage;
