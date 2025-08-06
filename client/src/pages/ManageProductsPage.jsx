import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Loader from '../components/Loader.jsx'; // <-- ✅ Import your reusable Loader

const ManageProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        const fetchMyProducts = async () => {
            try {
                const token = getToken();
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                const { data } = await axios.get(
                    'http://localhost:5000/api/products/myproducts',
                    config
                );
                setProducts(data);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyProducts();
    }, []);

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                };
                setLoading(true);
                await axios.delete(
                    `http://localhost:5000/api/products/${productId}`,
                    config
                );
                const { data } = await axios.get(
                    'http://localhost:5000/api/products/myproducts',
                    config
                );
                setProducts(data);
            } catch (error) {
                alert('Failed to delete product.');
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) return <Loader />;

    return (
        <div style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>My Products</h2>
            {products.length === 0 ? (
                <p>You have not added any products yet.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Image</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Price</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                    />
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    {product.name}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    ₹{product.discountedPrice}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
<Link
    to={`/vendor/edit-product/${product._id}`}
    style={{
        marginRight: '10px',
        color: 'blue',
        textDecoration: 'none',
    }}
>
    <FaEdit />
</Link>
                                    <button
                                        onClick={() => handleDeleteProduct(product._id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'red',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ManageProductsPage;