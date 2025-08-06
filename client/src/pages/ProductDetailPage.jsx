import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import Loader from '../components/Loader.jsx';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const RelatedProductCard = ({ product }) => {
  // ...आपका existing RelatedProductCard unchanged...
  // Same as before
};

// --- ⭐ Rating Component ---
const renderStars = (rating) => {
  const stars = [];
  const rounded = Math.round(rating * 2) / 2;
  for (let i = 1; i <= 5; i++) {
    if (rounded >= i) {
      stars.push(<FaStar key={i} color="gold" size={16} />);
    } else if (rounded + 0.5 === i) {
      stars.push(<FaStarHalfAlt key={i} color="gold" size={16} />);
    } else {
      stars.push(<FaRegStar key={i} color="gold" size={16} />);
    }
  }
  return stars;
};

const ProductDetailPage = () => {
  const { id: productId } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:5000/api/products/${productId}`);
      setProduct(data.product);
      setRelatedProducts(data.relatedProducts);
      setReviews(data.product.reviews || []);
    } catch (error) {
      console.error("Failed to fetch product details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const submitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert("Please login to write a review.");

    try {
      await axios.post(
        `http://localhost:5000/api/products/${productId}/review`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Review submitted successfully!");
      setRating(0);
      setComment('');
      fetchProduct();
    } catch (err) {
      console.error(err);
      alert("Failed to submit review.");
    }
  };

  if (loading) return <Loader />;
  if (!product) return <p style={{ textAlign: 'center', padding: '2rem' }}>Sorry, product not found.</p>;

  return (
    <div style={styles.page}>
      <div style={styles.mainProductSection}>
        <div style={styles.imageWrapper}>
          <img src={product.image} alt={product.name} style={styles.mainImage} />
        </div>
        <div style={styles.detailsWrapper}>
          <h2 style={styles.productName}>{product.name}</h2>
          <p style={styles.vendorName}>Sold by: <b>{product.vendor?.shopName || 'Grocy Seller'}</b></p>

          {/* ⭐ Rating Display */}
          {product.numReviews > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1rem' }}>
              {renderStars(product.rating)}
              <span>({product.numReviews} reviews)</span>
            </div>
          )}

          <p style={styles.description}>{product.description}</p>
          <div style={styles.priceContainer}>
            <span style={styles.discountedPrice}>₹{product.discountedPrice}</span>
            {product.originalPrice > product.discountedPrice && (
              <span style={styles.originalPrice}>₹{product.originalPrice}</span>
            )}
          </div>
          <button onClick={() => addToCart(product)} style={styles.addToCartButton}>Add to Cart</button>
        </div>
      </div>

      {/* ✍ Review Form */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Write a Review</h3>
        <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} required>
            <option value="">Select Rating</option>
            <option value="5">⭐️⭐️⭐️⭐️⭐️ Excellent</option>
            <option value="4">⭐️⭐️⭐️⭐️ Good</option>
            <option value="3">⭐️⭐️⭐️ Average</option>
            <option value="2">⭐️⭐️ Poor</option>
            <option value="1">⭐️ Terrible</option>
          </select>
          <textarea
            placeholder="Write your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            required
          />
          <button type="submit" style={{ padding: '0.6rem', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '4px' }}>Submit Review</button>
        </form>
      </div>

      {/* 📃 List of Reviews */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Customer Reviews</h3>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map((r, i) => (
            <div key={i} style={{ borderBottom: '1px solid #ccc', padding: '0.8rem 0' }}>
              <strong>{r.name}</strong>
              <div style={{ display: 'flex', gap: 4 }}>{renderStars(r.rating)}</div>
              <p>{r.comment}</p>
              <small>{new Date(r.createdAt).toLocaleDateString()}</small>
            </div>
          ))
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div style={styles.relatedSection}>
          <h3 style={styles.relatedHeading}>You Might Also Like</h3>
          <div style={styles.relatedGrid}>
            {relatedProducts.map(p => (
              <RelatedProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
    page: { maxWidth: '900px', margin: '0 auto', padding: '1rem' },
    mainProductSection: { display: 'flex', flexWrap: 'wrap', gap: '2rem', backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
    imageWrapper: { flex: 1, minWidth: '250px' },
    mainImage: { width: '100%', borderRadius: '8px' },
    detailsWrapper: { flex: 2, minWidth: '300px', display: 'flex', flexDirection: 'column' },
    productName: { fontSize: '1.8rem', marginBottom: '0.5rem' },
    vendorName: { color: '#555', fontWeight: '500', display: 'block', marginBottom: '1rem' },
    description: { lineHeight: 1.6, marginBottom: '1.5rem', flexGrow: 1 },
    priceContainer: { marginBottom: '1.5rem' },
    discountedPrice: { fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-color)' },
    originalPrice: { fontSize: '1.2rem', color: '#999', textDecoration: 'line-through', marginLeft: '1rem' },
    addToCartButton: { width: 'auto', alignSelf: 'flex-start', padding: '0.8rem 2rem', fontSize: '1.1rem' },
    relatedSection: { marginTop: '3rem' },
    relatedHeading: { marginBottom: '1.5rem', fontSize: '1.5rem', textAlign: 'center' },
    relatedGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' },
    // Related Card Styles
    relatedCard: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' },
    relatedImageContainer: { position: 'relative' },
    relatedImage: { width: '100%', height: '120px', objectFit: 'cover' },
    relatedDiscountBadge: { position: 'absolute', top: '8px', left: '8px', backgroundColor: 'var(--secondary-color, #f57f17)', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' },
    relatedCardContent: { padding: '0.75rem' },
    relatedProductName: { fontSize: '0.9rem', fontWeight: '600', margin: '0 0 4px 0', height: '32px', overflow: 'hidden' },
    relatedQuantityText: { color: '#555', margin: '0 0 8px 0', fontSize: '0.8rem' },
    relatedDiscountedPrice: { fontWeight: 'bold', fontSize: '1.1rem' },
    relatedOriginalPrice: { textDecoration: 'line-through', color: '#999', marginLeft: '8px', fontSize: '0.9rem' },
    relatedAddToCartButton: { width: '100%', padding: '0.6rem', backgroundColor: 'var(--primary-color, green)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }
};

export default ProductDetailPage;