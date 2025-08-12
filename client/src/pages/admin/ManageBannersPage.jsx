import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../../components/Loader.jsx';
import { FaTrash } from 'react-icons/fa';

const ManageBannersPage = () => {
    const [banners, setBanners] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [title, setTitle] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const getToken = () => localStorage.getItem('token');

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            // एक साथ बैनर्स और वेंडर्स दोनों को fetch करें
            const [bannersRes, vendorsRes] = await Promise.all([
                axios.get('/api/admin/banners', config),
                axios.get('/api/admin/vendors', config) // वेंडर्स की लिस्ट पाने के लिए
            ]);
            setBanners(bannersRes.data);
            setVendors(vendorsRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('vendor', selectedVendor);
        formData.append('image', image);

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${getToken()}` } };
            await axios.post('/api/admin/banners', formData, config);
            alert('Banner added successfully!');
            fetchData(); // <-- सफल होने पर लिस्ट को रिफ्रेश करें
        } catch (error) {
            alert('Failed to add banner.');
        }
    };

    const handleDelete = async (bannerId) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${getToken()}` } };
                await axios.delete(`/api/admin/banners/${bannerId}`, config);
                alert('Banner deleted successfully!');
                fetchData(); // <-- सफल होने पर लिस्ट को रिफ्रेश करें
            } catch (error) {
                alert('Failed to delete banner.');
            }
        }
    };

    if (loading) return <Loader />;

    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
            <h2>Manage Banners</h2>
            
            {/* --- नया बैनर बनाने का फॉर्म --- */}
            <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                <h3>Add New Banner</h3>
                <input type="text" placeholder="Banner Title" onChange={e => setTitle(e.target.value)} required />
                <select onChange={e => setSelectedVendor(e.target.value)} required>
                    <option value="">Select Vendor</option>
                    {vendors.filter(v => v.status === 'approved').map(v => 
                        <option key={v._id} value={v._id}>{v.shopName}</option>
                    )}
                </select>
                <input type="file" onChange={e => setImage(e.target.files[0])} required />
                <button type="submit" style={{marginTop: '1rem'}}>Add Banner</button>
            </form>

            {/* --- मौजूदा बैनर्स की लिस्ट --- */}
            <h3>Existing Banners</h3>
            <div>
                {banners.length === 0 ? <p>No banners found.</p> :
                 banners.map(banner => (
                    <div key={banner._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img src={banner.image} alt={banner.title} style={{ width: '100px', height: '50px', objectFit: 'cover' }} />
                            <div>
                                <h4>{banner.title}</h4>
                                <p>For: {banner.vendor?.shopName || 'N/A'}</p>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(banner._id)} style={{backgroundColor: 'red'}}><FaTrash /></button>
                    </div>
                 ))
                }
            </div>
        </div>
    );
};

export default ManageBannersPage;
