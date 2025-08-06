import React, { useState, useEffect } from 'react';
import axios from '../../api.js';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader.jsx';
import './ManageOrdersPage.css';

const ManageOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Processing');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [deliveryTimes, setDeliveryTimes] = useState({});

    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${getToken()}` } };
                const url = `/api/orders/vendor?status=${filter}`;
                const { data } = await axios.get(url, config);
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [filter]);

    const handleUpdate = async (orderId, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            const deliveryTime = deliveryTimes[orderId] || orders.find(o => o._id === orderId).estimatedDeliveryTime;
            
            const { data: updatedOrder } = await axios.put(
                `/api/orders/${orderId}/status`, 
                { status: newStatus, deliveryTime: deliveryTime }, 
                config
            );
            
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order._id === orderId ? updatedOrder : order
                )
            );
            alert('Status updated successfully!');
        } catch (error) {
            alert('Failed to update status.');
        }
    };
    
    const toggleOrderItems = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    if (loading) return <Loader />;

    return (
        <div className="manage-orders-page">
            <h1>Manage Orders</h1>
            <div className="order-filters">
                <button className={`filter-btn ${filter === 'Processing' ? 'active' : ''}`} onClick={() => setFilter('Processing')}>New</button>
                <button className={`filter-btn ${filter === 'Shipped' ? 'active' : ''}`} onClick={() => setFilter('Shipped')}>Shipped</button>
                <button className={`filter-btn ${filter === 'Delivered' ? 'active' : ''}`} onClick={() => setFilter('Delivered')}>Completed</button>
                <button className={`filter-btn ${filter === 'Cancelled' ? 'active' : ''}`} onClick={() => setFilter('Cancelled')}>Cancelled</button>
                <button className={`filter-btn ${filter === '' ? 'active' : ''}`} onClick={() => setFilter('')}>All</button>
            </div>
            {orders.length === 0 ? <p>No orders found with this status.</p> : 
                orders.map(order => (
                    <div key={order._id} className="order-card-vendor">
                        <div className="order-card-header">
                            <span><b>Order:</b> #{order._id.toString().slice(-6)}</span>
                            <span>{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="order-card-body">
                            <h4>Customer: {order.customer?.name || order.customer?.email}</h4>
                            <p><b>Total:</b> ₹{order.totalAmount.toFixed(2)}</p>
                            <span className="order-items-toggle" onClick={() => toggleOrderItems(order._id)}>
                                {expandedOrderId === order._id ? 'Hide Items' : 'Show Items'}
                            </span>
                            {expandedOrderId === order._id && (
                                <div className="order-items-list">
                                    {order.items.map(item => <p key={item.product}>- {item.name} (Qty: {item.quantity})</p>)}
                                </div>
                            )}
                            <div className="status-updater-vendor">
                                {order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled' ? (
                                    <p><b>Status:</b> <span style={{color: order.orderStatus === 'Delivered' ? 'green' : 'red'}}>{order.orderStatus}</span></p>
                                ) : (
                                    <>
                                        <select defaultValue={order.orderStatus} onChange={(e) => handleUpdate(order._id, e.target.value)}>
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                        <input type="text" placeholder="e.g., By 6 PM today" defaultValue={order.estimatedDeliveryTime} onChange={(e) => setDeliveryTimes({...deliveryTimes, [order._id]: e.target.value})} style={{flex: 1}}/>
                                    </>
                                )}
                                 <Link to={`/chat/${order._id}`}><button>Chat</button></Link>
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    );
};
export default ManageOrdersPage;
