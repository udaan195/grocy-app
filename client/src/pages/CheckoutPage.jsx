// imports (same as before, कोई बदलाव नहीं)
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import axios from '../api.js';
import { useNavigate, Link } from 'react-router-dom';
import { haversineDistance } from '../utils/distanceHelper.js';
import './CheckoutPage.css';

// Loader component (unchanged)
const Loader = () => (
  <div className="checkout-loader-container">
    <div className="spinner"></div>
    <p>Processing your order...</p>
  </div>
);

const CheckoutPage = () => {
  const { cartItems, clearCart, applyCoupon } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(true);
  const [vendorsInCart, setVendorsInCart] = useState([]); // ✅ kept

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState({ text: '', type: '' });
  const [isApplying, setIsApplying] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);

  const [itemsTotal, setItemsTotal] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [cartValidation, setCartValidation] = useState({ isValid: true, messages: [] });

  const user = JSON.parse(localStorage.getItem('user'));
  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) return setLoading(false);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data: addressRes } = await axios.get('/api/users/address', config);
        setAddresses(addressRes);
        if (addressRes.length > 0) setSelectedAddress(addressRes[0]);
      } catch {
        console.log('Failed to fetch addresses');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!cartItems.length || !selectedAddress) return;

    const total = cartItems.reduce((sum, item) =>
      sum + (item.isFreeItem ? 0 : item.discountedPrice * item.quantity), 0);
    setItemsTotal(total);

   const calculateDistanceCharge = async () => {
  try {
    const token = getToken();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.post('/api/delivery/calculate', {
      cartItems,
      customerLocation: selectedAddress.location,
    }, config);
    setDeliveryCharge(data.deliveryCharge);
  } catch (err) {
    console.error('Distance delivery calc failed:', err);
    setDeliveryCharge(0); // ✅ Fallback hat gaya
  }
};

    calculateDistanceCharge();
  }, [cartItems, selectedAddress]); // 🔁 removed settings from dependency

  useEffect(() => {
    const validateCart = async () => {
      if (cartItems.length === 0 || !selectedAddress || !selectedAddress.location?.coordinates) {
        setCartValidation({ isValid: true, messages: [] });
        return;
      }

      const vendorIds = [...new Set(cartItems.map(item => item.vendor))];
      if (vendorIds.length === 0) return;

      try {
        const { data: vendors } = await axios.post('/api/vendors/by-ids', { vendorIds });
        setVendorsInCart(vendors);

        let allConditionsMet = true;
        const newValidationMessages = [];

        vendors.forEach(vendor => {
          if (!vendor.location?.coordinates || vendor.location.coordinates.length < 2) return;

          const customerCoords = {
            lat: selectedAddress.location.coordinates[1],
            lon: selectedAddress.location.coordinates[0]
          };
          const vendorCoords = {
            lat: vendor.location.coordinates[1],
            lon: vendor.location.coordinates[0]
          };

          const distance = haversineDistance(customerCoords, vendorCoords);

          const requiredMin = distance <= vendor.hyperlocalRadius
            ? vendor.minCartValueHyperlocal
            : vendor.minCartValueRegular;

          const vendorItemsTotal = cartItems
            .filter(item => item.vendor === vendor._id)
            .reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0);

          if (vendorItemsTotal < requiredMin) {
            allConditionsMet = false;
            newValidationMessages.push(`Min. order of ₹${requiredMin} for ${vendor.shopName} not met.`);
          }
        });

        setCartValidation({ isValid: allConditionsMet, messages: newValidationMessages });
      } catch (error) {
        console.error("Distance/Delivery calc failed:", error);
      }
    };

    validateCart();
  }, [cartItems, selectedAddress]);


  const grandTotal = (Number(itemsTotal) + Number(deliveryCharge) - Number(discountAmount)).toFixed(2);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage({ text: 'Please enter a coupon code.', type: 'error' });
      return;
    }

    if (couponApplied) {
      setCouponMessage({ text: 'Coupon already applied. Remove it to apply a new one.', type: 'error' });
      return;
    }

    setIsApplying(true);
    try {
      const token = getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post('/api/coupons/validate', {
        couponCode,
        cartItems
      }, config);

      let calcDiscount = 0;

      if (data.discountType === 'FlatOff') {
        calcDiscount = Number(data.discountValue);
      } else if (data.discountType === 'FreeDelivery') {
        setDeliveryCharge(0);
      } else if (data.discountType === 'FreeProduct') {
        const freeProduct = data.freeProduct;
        if (freeProduct) applyCoupon(data, freeProduct);
      } else if (data.discountType === 'BuyXGetY') {
        applyCoupon(data);
      }

      setDiscountAmount(calcDiscount);
      setCouponApplied(true);
      setCouponMessage({ text: data.message || 'Coupon applied successfully!', type: 'success' });

    } catch (err) {
      setDiscountAmount(0);
      setCouponApplied(false);
      setCouponMessage({ text: err.response?.data?.message || 'Invalid Coupon', type: 'error' });
    } finally {
      setIsApplying(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return alert('Please select address');
    setLoading(true);
    const token = getToken();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const payload = {
      cartItems,
      shippingAddress: selectedAddress,
      paymentMethod,
      discountAmount,
      appliedCoupon: discountAmount > 0 ? couponCode : null,
    };

    if (paymentMethod === 'COD') {
      try {
        await axios.post('/api/orders', payload, config);
        alert('Order Placed Successfully!');
        clearCart();
        navigate('/');
      } catch (err) {
        alert(err.response?.data?.message || 'Order failed');
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const { data: { order } } = await axios.post(
          '/api/payment/create-order',
          { amount: Math.round(grandTotal * 100) },
          config
        );

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: "INR",
          name: "Grocy App",
          description: "Order Payment",
          order_id: order.id,
          handler: async function () {
            try {
              await axios.post('/api/orders', payload, config);
              alert('Payment successful & Order placed!');
              clearCart();
              navigate('/');
            } catch {
              alert('Payment success, but order saving failed.');
            }
          },
          prefill: {
            name: selectedAddress.fullName,
            email: user.email,
            contact: selectedAddress.phoneNumber
          },
          theme: { color: "#48bb78" }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', () => {
          alert('Payment failed. Please try again.');
        });
        rzp1.open();
      } catch (err) {
        alert('Failed to initiate payment.');
        setLoading(false);
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      {!cartValidation.isValid && (
        <div className="checkout-section" style={{ border: '2px solid red', marginBottom: '1rem', padding: '1rem' }}>
          <h4 style={{ color: 'red' }}>Add Few More Items to Place Order:</h4>
          {cartValidation.messages.map((msg, i) => (
            <p key={i} style={{ color: 'red', margin: 0 }}>{msg}</p>
          ))}
        </div>
      )}

      {/* Address */}
      <div className="checkout-section address-list">
        <h3>1. Select Delivery Address</h3>
        {addresses.length > 0 ? (
          addresses.map(addr => (
            <div
              key={addr._id}
              className={`address-card ${selectedAddress?._id === addr._id ? 'selected' : ''}`}
              onClick={() => setSelectedAddress(addr)}
            >
              <p><b>{addr.fullName}</b>, {addr.phoneNumber}</p>
              <p>{addr.houseNo}, {addr.area}, {addr.city}</p>
            </div>
          ))
        ) : (
          <p>No saved addresses. <Link to="/profile">Add now</Link></p>
        )}
      </div>

      {/* Payment */}
      <div className="checkout-section payment-options">
        <h3>2. Select Payment Method</h3>
        <div className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`} onClick={() => setPaymentMethod('COD')}>
          <input type="radio" value="COD" checked={paymentMethod === 'COD'} readOnly />
          <span>Cash on Delivery</span>
        </div>
        <div className={`payment-option disabled`}>
        <input type="radio" name="payment" value="Online" disabled />
        <span>Online Payment (Temporarily Unavailable)</span>
    </div>
      </div>

      {/* Coupon */}
      <div className="checkout-section">
        <h3>3. Apply Coupon</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={couponCode}
            onChange={e => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon"
            style={{ textTransform: 'uppercase' }}
          />
          <button onClick={handleApplyCoupon} disabled={isApplying}>
            {isApplying ? 'Applying...' : 'Apply'}
          </button>
        </div>
        {couponMessage.text && (
          <p style={{ color: couponMessage.type === 'success' ? 'green' : 'red', marginTop: '10px' }}>
            {couponMessage.text}
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="checkout-section">
        <h3>4. Order Summary</h3>
        {cartItems.map(item => (
          <div key={item._id} className="summary-item">
            <img src={item.image} alt={item.name} />
            <div className="summary-details">
              <p><b>{item.name}</b></p>
              <p>Qty: {item.quantity}</p>
            </div>
            <span className="summary-price">₹{(item.discountedPrice * item.quantity).toFixed(2)}</span>
          </div>
        ))}

        <div className="summary-totals">
          <div className="summary-row"><span>Items Total:</span><span>₹{Number(itemsTotal).toFixed(2)}</span></div>
          <div className="summary-row"><span>Delivery Charge:</span><span>₹{Number(deliveryCharge).toFixed(2)}</span></div>
          {couponApplied && Number(discountAmount) > 0 && (
            <div className="summary-row" style={{ color: 'green' }}>
              <span>Coupon Applied:</span>
              <span>- ₹{Number(discountAmount).toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row grand-total"><span>Grand Total:</span><span>₹{grandTotal}</span></div>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={!selectedAddress || cartItems.length === 0 || !cartValidation.isValid}
        className="place-order-btn"
      >
        Place Order
      </button>
    </div>
  );
};

export default CheckoutPage;