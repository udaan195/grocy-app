import React, { useState, useEffect } from 'react';
import axios from '../api.js';
import { Link } from 'react-router-dom'; // ✅ Link import किया गया
import Loader from '../components/Loader.jsx';
import './DashboardPages.css';

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null); // ✅ यूज़र डेटा स्टेट

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const userInfo = JSON.parse(localStorage.getItem('user')); // ✅ यूज़र रोल के लिए
                setUser(userInfo);

                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('https://grocy-app-server.onrender.com/api/orders/myorders', config);
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <Loader />;

    return (
        <div style={{ padding: '1rem' }}>
            <h2>My Orders</h2>
            {orders.length === 0 ? (
                <p>You have no orders yet.</p>
            ) : (
                orders.map(order => (
                    <div
                        key={order._id}
                        style={{
                            border: '1px solid #ccc',
                            padding: '1rem',
                            margin: '1rem 0',
                            borderRadius: '8px',
                            backgroundColor: '#f9f9f9'
                        }}
                    >
                        <p><b>Order ID:</b> {order._id}</p>
                        <p><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</p>
                        <p><b>Total:</b> ₹{order.totalAmount.toFixed(2)}</p>
                        <p><b>Status:</b> {order.orderStatus}</p>

                        {/* ✅ Estimated Delivery */}
                        {order.estimatedDeliveryTime && (
                            <p><b>Estimated Delivery:</b> {order.estimatedDeliveryTime}</p>
                        )}

                        {/* ✅ Conditional Chat Button */}
                        {user && (order.orderStatus === 'Processing' || order.orderStatus === 'Shipped') && (
                            <Link to={`/chat/${order._id}`}>
                                <button style={{ marginTop: '10px' }}>
                                    Chat with {user.role === 'vendor' ? 'Customer' : 'Vendor'}
                                </button>
                            </Link>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default MyOrdersPage;