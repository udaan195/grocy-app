import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../../components/Loader.jsx';

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
        const config = { headers: { Authorization: `Bearer ${getToken()}` } };
        const [bannersRes, vendorsRes] = await Promise.all([
            axios.get('/api/admin/banners', config),
            axios.get('/api/admin/vendors', config)
        ]);
        setBanners(bannersRes.data);
        setVendors(vendorsRes.data);
        setLoading(false);
    };
    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('vendor', selectedVendor);
        formData.append('image', image);
        const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${getToken()}` } };
        await axios.post('/api/admin/banners', formData, config);
        fetchData();
    };

    if (loading) return <Loader />;

    return (
        <div>
            <h2>Manage Banners</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Banner Title" onChange={e => setTitle(e.target.value)} required />
                <select onChange={e => setSelectedVendor(e.target.value)} required>
                    <option value="">Select Vendor</option>
                    {vendors.filter(v => v.status === 'approved').map(v => <option key={v._id} value={v._id}>{v.shopName}</option>)}
                </select>
                <input type="file" onChange={e => setImage(e.target.files[0])} required />
                <button type="submit">Add Banner</button>
            </form>
            {/* Banners List */}
        </div>
    );
};
export default ManageBannersPage;
