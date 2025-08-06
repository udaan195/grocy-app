import React from 'react';
import { useCart } from '../context/CartContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  let discountPercent = 0;
  if (product.originalPrice > product.discountedPrice) {
    discountPercent = Math.round(
      ((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100
    );
  }

  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('कार्ट में आइटम जोड़ने के लिए कृपया लॉग इन करें।');
      navigate('/login');
    } else {
      addToCart(product);
      alert(`${product.name} कार्ट में जोड़ दिया गया है!`);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2;
    for (let i = 1; i <= 5; i++) {
      if (roundedRating >= i) {
        stars.push(<FaStar key={i} color="gold" size={14} />);
      } else if (roundedRating + 0.5 === i) {
        stars.push(<FaStarHalfAlt key={i} color="gold" size={14} />);
      } else {
        stars.push(<FaRegStar key={i} color="gold" size={14} />);
      }
    }
    return stars;
  };

  return (
    <Link to={`/product/${product._id}`} style={styles.cardLink}>
      <div style={styles.card}>
        <div style={styles.imageContainer}>
          <img src={product.image} alt={product.name} style={styles.image} />
          {discountPercent > 0 && (
            <span style={styles.discountBadge}>
              -{discountPercent}%
            </span>
          )}
        </div>

        <div style={styles.cardContent}>
          <div>
            <h3 style={styles.productName}>{product.name}</h3>
            <p style={styles.quantityText}>{product.quantityValue} {product.quantityUnit}</p>

            {/* ✅ Rating: always show, even if 0 reviews */}
            <div style={styles.ratingSection}>
              {renderStars(product.rating || 0)}
              <span style={styles.reviewCount}>
                ({product.numReviews || 0})
              </span>
            </div>

            <div style={styles.priceContainer}>
              <span style={styles.discountedPrice}>₹{product.discountedPrice}</span>
              {discountPercent > 0 && (
                <span style={styles.originalPrice}>
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
          </div>
          <button onClick={handleAddToCartClick} style={styles.addToCartButton}>
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
};

// 👇 styles remain same
const styles = {
  cardLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    height: '100%',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    textAlign: 'left',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '140px',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  discountBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    backgroundColor: 'var(--secondary-color, #f57f17)',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  cardContent: {
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  productName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    margin: '0 0 4px 0',
    lineHeight: '1.2',
    height: '2.4em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  quantityText: {
    color: '#555',
    margin: '0 0 8px 0',
    fontSize: '0.8rem',
  },
  ratingSection: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    gap: '4px',
  },
  reviewCount: {
    fontSize: '0.75rem',
    color: '#555',
    marginLeft: '4px',
  },
  priceContainer: {
    marginBottom: '10px',
  },
  discountedPrice: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  originalPrice: {
    textDecoration: 'line-through',
    color: '#999',
    marginLeft: '8px',
    fontSize: '0.9rem',
  },
  addToCartButton: {
    width: '100%',
    padding: '0.6rem',
    backgroundColor: 'var(--primary-color, green)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    marginTop: 'auto',
  },
};

export default ProductCard;