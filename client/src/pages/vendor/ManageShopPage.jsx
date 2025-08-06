import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageShopPage = () => {
    const [shopDetails, setShopDetails] = useState({ shopName: '', shopAddress: '', telegramId: '' });
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        const fetchShopDetails = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${getToken()}` } };
                const { data } = await axios.get('http://localhost:5000/api/vendors/myshop', config);
                setShopDetails(data);
            } catch (error) {
                console.error("Failed to fetch shop details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchShopDetails();
    }, []);

    const handleChange = (e) => {
        setShopDetails({ ...shopDetails, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            await axios.put('http://localhost:5000/api/vendors/myshop', shopDetails, config);
            alert('Shop details updated successfully!');
        } catch (error) {
            alert('Failed to update details.');
        }
    };

    if (loading) return <p>Loading shop details...</p>;

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
            <h1>Manage Your Shop</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label>Shop Name</label>
                    <input type="text" name="shopName" value={shopDetails.shopName} onChange={handleChange} />
                </div>
                <div>
                    <label>Shop Address</label>
                    <textarea name="shopAddress" value={shopDetails.shopAddress} onChange={handleChange} rows="3"></textarea>
                </div>
                <div>
                    <label>Telegram User ID</label>
                    <input type="text" name="telegramId" value={shopDetails.telegramId} onChange={handleChange} />
                </div>
                <button type="submit">Save Changes</button>
            </form>
        </div>
    );
};

export default ManageShopPage;
