import React, { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import './CartPage.css';

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const navigate = useNavigate();

    const itemsTotal = cartItems
  .filter(item => !item.isFreeItem)
  .reduce((total, item) => total + item.discountedPrice * item.quantity, 0);

    const handlePlaceOrder = () => {
        setIsPlacingOrder(true);
        setTimeout(() => {
            navigate('/checkout');
        }, 1500);
    };

    return (
        <div className="cart-page">
            <h2>Your Shopping Cart</h2>

            {cartItems.length === 0 ? (
                <div className="cart-empty">
                    <div className="cart-empty-icon"><FaShoppingCart /></div>
                    <p>Your cart is looking a little empty.</p>
                    <Link to="/"><button>Start Shopping</button></Link>
                </div>
            ) : (
                <div className="cart-layout">
                    <div className="cart-items-list">
                        {cartItems.map(item => (
                            <div key={item._id} className="cart-item">
                                <img src={item.image} alt={item.name} className="cart-item-img" />
                                <div className="cart-item-details">
                                    <h4>
                                        {item.name}
                                        {item.isFreeItem && <span style={{ color: 'green', fontSize: '0.9rem' }}> (Free)</span>}
                                    </h4>
                                    <p>
                                        ₹{item.discountedPrice}
                                        {item.isFreeItem && <span style={{ color: 'green' }}> (Free)</span>}
                                    </p>
                                </div>

                                <div className="cart-item-actions">
                                    {item.isFreeItem ? (
                                        <div className="quantity-stepper">
                                            <span className="quantity-value">Qty: 1</span>
                                        </div>
                                    ) : (
                                        <div className="quantity-stepper">
                                            <button
                                                className="quantity-btn"
                                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                            >-</button>
                                            <span className="quantity-value">{item.quantity}</span>
                                            <button
                                                className="quantity-btn"
                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                            >+</button>
                                        </div>
                                    )}
                                    {!item.isFreeItem && (
                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            className="remove-btn"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary-card">
                        <h3>Price Details</h3>
                        <div className="summary-row">
                            <span>Price ({cartItems.length} items)</span>
                            <span>₹{itemsTotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Delivery Charges</span>
                            <span>Calculated at next step</span>
                        </div>
                        <div className="summary-row grand-total">
                            <span>Total Amount (Approx)</span>
                            <span>₹{itemsTotal.toFixed(2)}</span>
                        </div>

                        <button
                            className="checkout-btn"
                            style={{ width: '100%', marginTop: '1rem' }}
                            onClick={handlePlaceOrder}
                            disabled={isPlacingOrder}
                        >
                            {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;