import React, { useState, useEffect } from 'react';
import axios from '../../api.js';
import { useParams, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../constants/categories.js';
import Loader from '../../components/Loader.jsx';

const EditProductPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantityValue: '',
    quantityUnit: '',
    originalPrice: '',
    discountedPrice: '',
    stock: '',
    isHyperlocal: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`/api/products/${productId}`, config);
        setFormData(data.product);
        setImagePreview(data.product.image);
      } catch (error) {
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCheckboxChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.checked });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productData = new FormData();
    for (const key in formData) {
      productData.append(key, formData[key]);
    }
    if (imageFile) {
      productData.append('image', imageFile);
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.put(`/api/products/${productId}`, productData, config);
      alert('Product updated successfully!');
      navigate('/vendor/products');
    } catch (error) {
      alert('Failed to update product.');
    }
  };

  if (loading) return <Loader />;
  if (error)
    return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h2>Edit Product</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'cover',
              borderRadius: '8px',
            }}
          />
        )}
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Product Name"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          required
        />
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          name="quantityValue"
          type="text"
          value={formData.quantityValue}
          onChange={handleChange}
          placeholder="Quantity Value"
        />
        <input
          name="quantityUnit"
          type="text"
          value={formData.quantityUnit}
          onChange={handleChange}
          placeholder="Quantity Unit"
        />
        <input
          name="originalPrice"
          type="number"
          value={formData.originalPrice}
          onChange={handleChange}
          placeholder="Original Price"
          required
        />
        <input
          name="discountedPrice"
          type="number"
          value={formData.discountedPrice}
          onChange={handleChange}
          placeholder="Discounted Price"
          required
        />
        <input
          name="stock"
          type="number"
          value={formData.stock}
          onChange={handleChange}
          placeholder="Stock"
          required
        />
        <label>
          <input
            type="checkbox"
            name="isHyperlocal"
            checked={formData.isHyperlocal}
            onChange={handleCheckboxChange}
          />
          Hyperlocal Product
        </label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button type="submit">Update Product</button>
      </form>
    </div>
  );
};

export default EditProductPage;