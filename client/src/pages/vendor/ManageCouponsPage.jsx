import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../../components/Loader.jsx';
import './ManageCouponsPage.css';

const ManageCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ offerType: 'Welcome' });

  const getToken = () => localStorage.getItem('token');

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };
      const [couponRes, productRes] = await Promise.all([
        axios.get('/api/coupons/mycoupons', config),
        axios.get('/api/products/myproducts', config),
      ]);
      setCoupons(couponRes.data);
      setProducts(productRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleComboChange = (e) => {
    const { value, checked } = e.target;
    let updated = formData.comboProducts || [];
    if (checked) updated.push(value);
    else updated = updated.filter((id) => id !== value);
    setFormData({ ...formData, comboProducts: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };
      const dataToSend = { ...formData };

      const url =
        formData.offerType === 'Welcome'
          ? '/api/coupons/welcome'
          : formData.offerType === 'Combo'
          ? '/api/coupons/combo'
          : '/api/coupons/buyxgety';

      await axios.post(url, dataToSend, config);
      alert('Coupon Created!');
      setShowForm(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating coupon');
    }
  };

  const handleDelete = async (couponId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this coupon?');
    if (!confirmDelete) return;

    try {
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };
      await axios.delete(`/api/coupons/${couponId}`, config);
      alert('Coupon deleted');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting coupon');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="manage-coupons">
      <div className="header">
        <h1>Manage Coupons</h1>
        <button onClick={() => { setShowForm(!showForm); setFormData({ offerType: 'Welcome' }); }}>
          {showForm ? 'Cancel' : 'Create Coupon'}
        </button>
      </div>

      {showForm && (
        <form className="coupon-form" onSubmit={handleSubmit}>
          <select name="offerType" value={formData.offerType} onChange={handleChange}>
            <option value="Welcome">Welcome Offer</option>
            <option value="Combo">Combo Offer</option>
            <option value="BuyXGetY">Buy X Get Y</option>
          </select>

          {formData.offerType === 'Welcome' && (
            <>
              <input type="number" name="minPurchaseWelcome" placeholder="Min Purchase ₹" onChange={handleChange} required />
              <select name="welcomeOfferDetail.type" onChange={handleChange} required>
                <option value="">Select Benefit</option>
                <option value="FreeDelivery">Free Delivery</option>
                <option value="FlatOff">Flat Off</option>
              </select>
              {formData?.welcomeOfferDetail?.type === 'FlatOff' && (
                <input
                  type="number"
                  name="welcomeOfferDetail.flatOffValue"
                  placeholder="Flat Off ₹"
                  onChange={handleChange}
                  required
                />
              )}
              <input type="text" name="couponCode" placeholder="Coupon Code" onChange={handleChange} required />
            </>
          )}

          {formData.offerType === 'Combo' && (
            <>
              <div className="product-list">
                {products.map((p) => (
                  <label key={p._id}>
                    <input type="checkbox" value={p._id} onChange={handleComboChange} /> {p.name}
                  </label>
                ))}
              </div>
              <select name="comboOfferDetail.type" onChange={handleChange} required>
                <option value="">Select Benefit</option>
                <option value="FreeProduct">Free Product</option>
                <option value="FreeDelivery">Free Delivery</option>
                <option value="FlatOff">Flat Off</option>
              </select>
              {formData?.comboOfferDetail?.type === 'FreeProduct' && (
                <select name="comboOfferDetail.freeProductId" onChange={handleChange} required>
                  <option value="">Select Free Product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              )}
              {formData?.comboOfferDetail?.type === 'FlatOff' && (
                <input
                  type="number"
                  name="comboOfferDetail.flatOffValue"
                  placeholder="Flat Off ₹"
                  onChange={handleChange}
                  required
                />
              )}
              <input type="text" name="couponCode" placeholder="Coupon Code" onChange={handleChange} required />
            </>
          )}

          {formData.offerType === 'BuyXGetY' && (
            <>
              <select name="buyProduct" onChange={handleChange} required>
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
              <input type="number" name="buyQuantity" placeholder="Buy Quantity" onChange={handleChange} required />
              <input type="number" name="getQuantityFree" placeholder="Get Quantity Free" onChange={handleChange} required />
              <input type="text" name="couponCode" placeholder="Coupon Code" onChange={handleChange} required />
            </>
          )}

          <button type="submit">Save Coupon</button>
        </form>
      )}

      <div className="coupon-list">
        {coupons.map((c) => (
          <div key={c._id} className="coupon-item">
            <strong>{c.title || c.offerType}</strong> — {c.couponCode} ({c.offerType})
            <button
              style={{ marginLeft: '10px', color: 'white', background: 'red', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
              onClick={() => handleDelete(c._id)}
            >
              🗑 Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageCouponsPage;