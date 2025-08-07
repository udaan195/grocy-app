import React, { useState } from 'react';
import axios from '../api.js';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../constants/categories';

const AddProductPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: CATEGORIES[0],
        quantityValue: '',
        quantityUnit: 'kg',
        originalPrice: '',
        discountedPrice: '',
        stock: '',
        
        isHyperlocal: false
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleCheckboxChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.checked });
    const handleImageChange = (e) => setImage(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const productData = new FormData();
        for (const key in formData) {
            productData.append(key, formData[key]);
        }
        if (image) {
            productData.append('image', image);
        }

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
            await axios.post('https://grocy-app-server.onrender.com/api/products', productData, config);
            alert('Product added successfully!');
            navigate('/vendor/products');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto', backgroundColor: '#fff', borderRadius: '8px' }}>
            <h2>Add New Product</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" required />
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Product Description" required rows="4"></textarea>
                
                <select name="category" value={formData.category} onChange={handleChange}>
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input name="quantityValue" type="number" value={formData.quantityValue} onChange={handleChange} placeholder="Quantity Value (e.g., 1, 500)" required />
                    <select name="quantityUnit" value={formData.quantityUnit} onChange={handleChange}>
                        <option value="kg">kg</option>
                        <option value="gm">gm</option>
                        <option value="Ltr">Ltr</option>
                        <option value="ml">ml</option>
                        <option value="Pcs">Pcs</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input name="originalPrice" type="number" value={formData.originalPrice} onChange={handleChange} placeholder="Original Price" required />
                    <input name="discountedPrice" type="number" value={formData.discountedPrice} onChange={handleChange} placeholder="Discounted Price" required />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input name="stock" type="number" value={formData.stock} onChange={handleChange} placeholder="Stock" required />
                    <input name="deliveryCharge" type="number" value={formData.deliveryCharge} onChange={handleChange} placeholder="Delivery Charge" required />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" name="isHyperlocal" id="isHyperlocal" checked={formData.isHyperlocal} onChange={handleCheckboxChange} style={{width: 'auto'}}/>
                    <label htmlFor="isHyperlocal">Hyperlocal Only (Show to very nearby customers)</label>
                </div>

                <div>
                    <label>Product Image:</label><br />
                    <input type="file" name="image" onChange={handleImageChange} accept="image/*" required />
                </div>
                
                <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Product'}</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
};

export default AddProductPage;
