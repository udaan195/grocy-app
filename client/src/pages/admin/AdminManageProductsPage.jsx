import React, { useState, useEffect } from 'react';
import axios from '../../api.js';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Loader from '../../components/Loader.jsx';
import './AdminManageProductsPage.css'; // <-- CSS फाइल को इम्पोर्ट करें

const AdminManageProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [groupedProducts, setGroupedProducts] = useState({});
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem('token');

    const fetchProducts = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            const { data } = await axios.get('https://grocy-app-server.onrender.com/api/admin/products', config);
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // प्रोडक्ट्स को वेंडर के हिसाब से ग्रुप करने का लॉजिक
    useEffect(() => {
        const groupByVendor = products.reduce((acc, product) => {
            const vendorName = product.vendor?.shopName || 'Unknown Vendor';
            if (!acc[vendorName]) {
                acc[vendorName] = [];
            }
            acc[vendorName].push(product);
            return acc;
        }, {});
        setGroupedProducts(groupByVendor);
    }, [products]);

    // प्रोडक्ट डिलीट करने का फंक्शन
    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product permanently?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${getToken()}` } };
                await axios.delete(`https://grocy-app-server.onrender.com/api/admin/products/${productId}`, config);
                fetchProducts(); // डिलीट करने के बाद लिस्ट को रिफ्रेश करें
            } catch (error) {
                alert('Failed to delete product.');
            }
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="admin-products-page">
            <h1>Manage All Products</h1>
            {Object.keys(groupedProducts).length === 0 ? <p>No products found.</p> : (
                Object.keys(groupedProducts).map(vendorName => (
                    <div key={vendorName} className="vendor-group">
                        <h3 className="vendor-group-header">
                            Shop: {vendorName}
                        </h3>
                        {groupedProducts[vendorName].map(p => (
                            <div key={p._id} className="product-row">
                                <div className="product-info">
                                    <img src={p.image} alt={p.name} />
                                    <div>
                                        <h4>{p.name}</h4>
                                        <p>Price: ₹{p.discountedPrice}</p>
                                    </div>
                                </div>
                                <div className="product-actions">
                                    {/* एडमिन भी उसी एडिट पेज का इस्तेमाल करेगा */}
                                    <Link to={`/vendor/edit-product/${p._id}`}>
                                        <FaEdit style={{ cursor: 'pointer', color: 'green' }} />
                                    </Link>
                                    <FaTrash onClick={() => handleDelete(p._id)} style={{ cursor: 'pointer', color: 'red' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ))
            )}
        </div>
    );
};

export default AdminManageProductsPage;
