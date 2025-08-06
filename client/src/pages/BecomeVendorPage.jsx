import React, { useState } from 'react';
import axios from '../api.js';
import { useNavigate } from 'react-router-dom';

const BecomeVendorPage = () => {
    const [formData, setFormData] = useState({
        shopName: '',
        shopAddress: '',
        latitude: '',
        longitude: '',
        telegramId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // GPS से लोकेशन लेने का फंक्शन
    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setFormData({
                    ...formData,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                alert('Location captured!');
            }, (err) => {
                setError('Could not get location: ' + err.message);
            });
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // localStorage से टोकन निकालें
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in.');
                setLoading(false);
                return;
            }

            // API रिक्वेस्ट के लिए हेडर में टोकन भेजें
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };

            await axios.post('http://localhost:5000/api/vendors/register', formData, config);

            alert('Congratulations! You are now a vendor. Please login again to see changes.');
            localStorage.removeItem('token'); // टोकन हटाकर दोबारा लॉगिन करने के लिए कहें
            navigate('/login');

        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Become a Vendor</h2>
            <p>Register your shop to start selling.</p>
            <form onSubmit={handleSubmit}>
                <input name="shopName" value={formData.shopName} onChange={handleChange} placeholder="Shop Name" required /><br /><br />
                <input name="shopAddress" value={formData.shopAddress} onChange={handleChange} placeholder="Shop Full Address" required /><br /><br />
                <input name="telegramId" value={formData.telegramId} onChange={handleChange} placeholder="Telegram User ID (Optional)" /><br /><br />

                <h4>Shop Location</h4>
                <button type="button" onClick={handleGetLocation}>Use My Current Location</button><br /><br />
                <input name="latitude" value={formData.latitude} onChange={handleChange} placeholder="Latitude" required /><br /><br />
                <input name="longitude" value={formData.longitude} onChange={handleChange} placeholder="Longitude" required /><br /><br />

                <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register Shop'}</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default BecomeVendorPage;
