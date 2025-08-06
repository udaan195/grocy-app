import React, { useState, useEffect } from 'react';
import axios from '../api.js';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaUserCircle } from 'react-icons/fa';
import './ProfilePage.css';
import Loader from '../components/Loader.jsx';

const ProfilePage = () => {
    const [addresses, setAddresses] = useState([]);
    const [formData, setFormData] = useState({
        fullName: '', phoneNumber: '', pincode: '', state: '',
        city: '', houseNo: '', area: '', landmark: '',
        latitude: '', longitude: ''
    });
    const [editingAddressId, setEditingAddressId] = useState(null); 
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));
    const getToken = () => localStorage.getItem('token');

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            const { data } = await axios.get('/api/users/address', config);
            setAddresses(data);
        } catch {
            setError('Failed to fetch addresses.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleDeleteAddress = async (addressId) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${getToken()}` } };
                const { data } = await axios.delete(`/api/users/address/${addressId}`, config);
                setAddresses(data);
            } catch {
                setError('Failed to delete address.');
            }
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditClick = (address) => {
        setEditingAddressId(address._id);
        setFormData(address);
        setShowForm(true);
    };

    const handleAddNewClick = () => {
        setEditingAddressId(null);
        setFormData({
            fullName: '', phoneNumber: '', pincode: '', state: '',
            city: '', houseNo: '', area: '', landmark: '',
            latitude: '', longitude: ''
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = getToken();
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };
        try {
            if (editingAddressId) {
                await axios.put(`/api/users/address/${editingAddressId}`, formData, config);
                alert('Address updated successfully!');
            } else {
                await axios.post('/api/users/address', formData, config);
                alert('Address added successfully!');
            }
            setShowForm(false);
            setEditingAddressId(null);
            fetchAddresses();
        } catch {
            alert('Operation failed. Please try again.');
        }
    };

    const handleUseMyLocation = () => {
        if (navigator.geolocation) {
            setIsFetchingLocation(true);
            setError('');
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;

                setFormData(prev => ({
                    ...prev,
                    latitude: latitude.toFixed(6),
                    longitude: longitude.toFixed(6)
                }));

                try {
                    const API_URL = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
                    const { data } = await axios.get(API_URL);
                    if (data && data.address) {
                        const addr = data.address;
                        setFormData(prev => ({
                            ...prev,
                            pincode: addr.postcode || prev.pincode,
                            state: addr.state || prev.state,
                            city: addr.city || addr.town || addr.village || prev.city,
                            area: `${addr.road || ''}, ${addr.suburb || ''}`.replace(/^,|,$/g, '').trim() || prev.area
                        }));
                    } else {
                        setError('Could not find address details for your location.');
                    }
                } catch {
                    setError('Failed to fetch address details. Check your internet connection.');
                } finally {
                    setIsFetchingLocation(false);
                }
            }, () => {
                setError('Permission denied or unable to fetch location.');
                setIsFetchingLocation(false);
            });
        } else {
            setError('Geolocation is not supported by your browser.');
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-welcome-card">
                <FaUserCircle size={50} style={{ color: '#a0aec0' }} />
                <div className="profile-welcome-details">
                    <p>Hello,</p>
                    <h3>{user?.name || 'User'}</h3>
                    <span>{user?.email}</span>
                </div>
            </div>

            {user?.role === 'customer' && (
                <div className="profile-action-prompt">
                    <h4>Want to sell your products on Grocy?</h4>
                    <Link to="/become-vendor"><button>Become a Vendor</button></Link>
                </div>
            )}
            {user?.role === 'vendor' && (
                <div className="profile-action-prompt">
                    <h4>Manage your shop and products</h4>
                    <Link to="/vendor/dashboard"><button>Go to Vendor Dashboard</button></Link>
                </div>
            )}

            <div className="saved-addresses-container">
                <div className="saved-addresses-header">
                    <h3>Your Saved Addresses</h3>
                    {!showForm && <button onClick={handleAddNewClick}>+ Add New Address</button>}
                </div>

                {loading && <Loader />}
                {error && <p style={{ color: 'red' }}>{error}</p>}

                {!showForm && !loading && addresses.map((addr) => (
                    <div key={addr._id} className="address-card">
                        <div>
                            <p><b>{addr.fullName}</b>, {addr.phoneNumber}</p>
                            <p>{addr.houseNo}, {addr.area}</p>
                            <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                            {addr.landmark && <p><i>Landmark: {addr.landmark}</i></p>}
                        </div>
                        <div className="address-actions">
                            <FaEdit onClick={() => handleEditClick(addr)} style={{ cursor: 'pointer', color: 'green' }} />
                            <FaTrash onClick={() => handleDeleteAddress(addr._id)} style={{ cursor: 'pointer', color: 'red' }} />
                        </div>
                    </div>
                ))}
                {!loading && !showForm && addresses.length === 0 && <p>You have no saved addresses.</p>}
            </div>

            {showForm && (
                <div className="address-form-container">
                    <h3>{editingAddressId ? 'Edit Your Address' : 'Add a New Address'}</h3>
                    <form onSubmit={handleSubmit} className="address-form">
                        <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name *" required />
                        <input name="phoneNumber" value={formData.phoneNumber} type="tel" onChange={handleChange} placeholder="Phone number *" required />

                        <div className="form-row">
                            <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode *" required />
                            <button type="button" onClick={handleUseMyLocation} disabled={isFetchingLocation}>
                                {isFetchingLocation ? 'Fetching...' : 'Use my location'}
                            </button>
                        </div>

                        <div className="form-row">
                            <input name="state" value={formData.state} onChange={handleChange} placeholder="State *" required />
                            <input name="city" value={formData.city} onChange={handleChange} placeholder="City *" required />
                        </div>

                        <input name="houseNo" value={formData.houseNo} onChange={handleChange} placeholder="House No., Building Name *" required />
                        <input name="area" value={formData.area} onChange={handleChange} placeholder="Road name, Area, Colony *" required />
                        <input name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Nearby Landmark (Optional)" />

                        {/* ✅ Lat/Lon Input Fields */}
                        <div className="form-row">
                            <input name="latitude" value={formData.latitude} onChange={handleChange} placeholder="Latitude" />
                            <input name="longitude" value={formData.longitude} onChange={handleChange} placeholder="Longitude" />
                        </div>

                        <div className="form-row">
                            <button type="button" onClick={() => setShowForm(false)} style={{ backgroundColor: '#718096' }}>Cancel</button>
                            <button type="submit" style={{ backgroundColor: 'var(--secondary-color)' }}>
                                {editingAddressId ? 'Update Address' : 'Save Address'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;