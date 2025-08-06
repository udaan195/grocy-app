import React, { useState, useEffect } from 'react';
import axios from '../../api.js';
import './ManageVendorsPage.css';

const ManageVendorsPage = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');

    const [editingVendorId, setEditingVendorId] = useState(null);
    const [editData, setEditData] = useState({
        serviceRadius: '',
        hyperlocalRadius: '',
        minCartValueHyperlocal: '',
        minCartValueRegular: '',
        freeDeliveryRadius: '',
        baseDeliveryCharge: '',
        baseDeliveryRadius: '',
        extraChargePerUnit: '',
        extraChargeUnitDistance: ''
    });

    const getToken = () => localStorage.getItem('token');

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            const url = `http://localhost:5000/api/admin/vendors?status=${filter}`;
            const { data } = await axios.get(url, config);
            setVendors(data);
        } catch (error) {
            console.error("Failed to fetch vendors", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, [filter]);

    const handleUpdateStatus = async (vendorId, newStatus) => {
        if (window.confirm(`Are you sure you want to ${newStatus} this vendor?`)) {
            try {
                const config = { headers: { Authorization: `Bearer ${getToken()}` } };
                await axios.put(`http://localhost:5000/api/admin/vendors/${vendorId}/status`, { status: newStatus }, config);
                fetchVendors();
            } catch (error) {
                alert('Failed to update status.');
            }
        }
    };

    const handleEditClick = (vendor) => {
        setEditingVendorId(vendor._id);
        setEditData({
            serviceRadius: vendor.serviceRadius || '',
            hyperlocalRadius: vendor.hyperlocalRadius || '',
            minCartValueHyperlocal: vendor.minCartValueHyperlocal || '',
            minCartValueRegular: vendor.minCartValueRegular || '',
            freeDeliveryRadius: vendor.freeDeliveryRadius || '',
            baseDeliveryCharge: vendor.baseDeliveryCharge || '',
            baseDeliveryRadius: vendor.baseDeliveryRadius || '',
            extraChargePerUnit: vendor.extraChargePerUnit || '',
            extraChargeUnitDistance: vendor.extraChargeUnitDistance || ''
        });
    };

    const handleSave = async (vendorId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            await axios.put(`http://localhost:5000/api/admin/vendors/${vendorId}/status`, editData, config);
            setEditingVendorId(null);
            fetchVendors();
            alert('Vendor details updated!');
        } catch (error) {
            alert('Failed to update details.');
        }
    };

    return (
        <div className="vendor-management-page">
            <h1>Manage Vendors</h1>

            <div className="filter-controls">
                <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>New Vendors</button>
                <button className={`filter-btn ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>Approved Vendors</button>
                <button className={`filter-btn ${filter === '' ? 'active' : ''}`} onClick={() => setFilter('')}>All Vendors</button>
                <button className={`filter-btn ${filter === 'suspended' ? 'active' : ''}`} onClick={() => setFilter('suspended')}>Suspended</button>
            </div>

            {loading ? <p>Loading vendors...</p> : (
                <div>
                    {vendors.length === 0 ? <p>No vendors found with this status.</p> :
                        vendors.map(vendor => (
                            <div key={vendor._id} className="vendor-card">
                                <h4>{vendor.shopName}</h4>
                                <p>Owner: {vendor.owner?.email || 'N/A'}</p>
                                <p>Status: <span className="status">{vendor.status}</span></p>

                                {vendor.status === 'approved' && (
                                    editingVendorId === vendor._id ? (
                                        <div className="edit-form">
                                            <input
                                                type="number"
                                                placeholder="Service Radius (m)"
                                                value={editData.serviceRadius}
                                                onChange={(e) => setEditData({ ...editData, serviceRadius: e.target.value })}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Hyperlocal Radius (m)"
                                                value={editData.hyperlocalRadius}
                                                onChange={(e) => setEditData({ ...editData, hyperlocalRadius: e.target.value })}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Min Cart (Hyperlocal)"
                                                value={editData.minCartValueHyperlocal}
                                                onChange={(e) => setEditData({ ...editData, minCartValueHyperlocal: e.target.value })}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Min Cart (Regular)"
                                                value={editData.minCartValueRegular}
                                                onChange={(e) => setEditData({ ...editData, minCartValueRegular: e.target.value })}
                                            />

                                            {/* New Delivery Charge Fields */}
                                            <h4>Delivery Charge Rules</h4>
                                            <input
                                                type="number"
                                                placeholder="Free Radius (m)"
                                                value={editData.freeDeliveryRadius}
                                                onChange={(e) => setEditData({ ...editData, freeDeliveryRadius: e.target.value })}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Base Charge (₹)"
                                                value={editData.baseDeliveryCharge}
                                                onChange={(e) => setEditData({ ...editData, baseDeliveryCharge: e.target.value })}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Base Radius (m)"
                                                value={editData.baseDeliveryRadius}
                                                onChange={(e) => setEditData({ ...editData, baseDeliveryRadius: e.target.value })}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Extra Charge (₹)"
                                                value={editData.extraChargePerUnit}
                                                onChange={(e) => setEditData({ ...editData, extraChargePerUnit: e.target.value })}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Per Extra Distance (m)"
                                                value={editData.extraChargeUnitDistance}
                                                onChange={(e) => setEditData({ ...editData, extraChargeUnitDistance: e.target.value })}
                                            />

                                            <button onClick={() => handleSave(vendor._id)}>Save</button>
                                            <button onClick={() => setEditingVendorId(null)} className="cancel-btn">Cancel</button>
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: '1rem' }}>
                                            <p>
                                                Service Radius: <b>{vendor.serviceRadius || 0}m</b> |
                                                Hyperlocal Radius: <b>{vendor.hyperlocalRadius || 0}m</b>
                                            </p>
                                            <p>
                                                Min Cart (Hyperlocal): <b>₹{vendor.minCartValueHyperlocal || 0}</b> |
                                                Min Cart (Regular): <b>₹{vendor.minCartValueRegular || 0}</b>
                                            </p>
                                            <p>
                                                Free Radius: <b>{vendor.freeDeliveryRadius || 0}m</b> |
                                                Base Radius: <b>{vendor.baseDeliveryRadius || 0}m</b>
                                            </p>
                                            <p>
                                                Base Charge: <b>₹{vendor.baseDeliveryCharge || 0}</b> |
                                                Extra ₹{vendor.extraChargePerUnit || 0} per {vendor.extraChargeUnitDistance || 0}m
                                            </p>
                                            <button onClick={() => handleEditClick(vendor)}>Edit Values</button>
                                        </div>
                                    )
                                )}

                                <div className="vendor-actions">
                                    {vendor.status === 'pending' && (
                                        <button onClick={() => handleUpdateStatus(vendor._id, 'approved')} style={{ backgroundColor: 'var(--primary-color)' }}>Approve</button>
                                    )}
                                    {vendor.status === 'approved' && (
                                        <button onClick={() => handleUpdateStatus(vendor._id, 'suspended')} style={{ backgroundColor: 'orange' }}>Suspend</button>
                                    )}
                                    {vendor.status === 'suspended' && (
                                        <button onClick={() => handleUpdateStatus(vendor._id, 'approved')} style={{ backgroundColor: 'var(--primary-color)' }}>Re-Approve</button>
                                    )}
                                    {vendor.status !== 'blocked' && (
                                        <button onClick={() => handleUpdateStatus(vendor._id, 'blocked')} style={{ backgroundColor: 'red' }}>Block</button>
                                    )}
                                </div>
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    );
};

export default ManageVendorsPage;