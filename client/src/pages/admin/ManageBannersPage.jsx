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
    const [submitting, setSubmitting] = useState(false);

    const getToken = () => localStorage.getItem('token');

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            const [bannersRes, vendorsRes] = await Promise.all([
                axios.get('/api/admin/banners', config),
                axios.get('/api/admin/vendors?status=approved', config) // सिर्फ अप्रूव्ड वेंडर्स लाएं
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
        if (!image) {
            alert('Please select an image file.');
            return;
        }
        setSubmitting(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('vendor', selectedVendor);
        formData.append('image', image); // <-- की (key) का नाम 'image' होना चाहिए

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${getToken()}` } };
            await axios.post('/api/admin/banners', formData, config);
            alert('Banner added successfully!');
            fetchData(); // लिस्ट को रिफ्रेश करें
            // फॉर्म को रीसेट करें
            setTitle('');
            setSelectedVendor('');
            setImage(null);
        } catch (error) {
            alert('Failed to add banner.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (bannerId) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${getToken()}` } };
                await axios.delete(`/api/admin/banners/${bannerId}`, config);
                alert('Banner deleted successfully!');
                fetchData();
            } catch (error) {
                alert('Failed to delete banner.');
            }
        }
    };

    if (loading) return <Loader />;

    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
            <div style={{backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem'}}>
                <h2>Add New Banner</h2>
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <input type="text" placeholder="Banner Title" value={title} onChange={e => setTitle(e.target.value)} required />
                    <select value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)} required>
                        <option value="">-- Select a Vendor --</option>
                        {vendors.map(v => <option key={v._id} value={v._id}>{v.shopName}</option>)}
                    </select>
                    <input type="file" onChange={e => setImage(e.target.files[0])} required />
                    <button type="submit" disabled={submitting}>
                        {submitting ? 'Uploading...' : 'Add Banner'}
                    </button>
                </form>
            </div>

            <h3>Existing Banners</h3>
            <div>
                {banners.length === 0 ? <p>No banners created yet.</p> :
                 banners.map(banner => (
                    <div key={banner._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img src={banner.image} alt={banner.title} style={{ width: '120px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
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
