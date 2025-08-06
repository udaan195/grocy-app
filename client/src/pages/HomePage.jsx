import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard.jsx';
import CategoryScroller from '../components/CategoryScroller.jsx';
import Loader from '../components/Loader.jsx';
import BannerSlider from '../components/BannerSlider.jsx'; // ✅ New import

const NoServiceMessage = () => {
    const messageStyle = {
        textAlign: 'center',
        padding: '50px 20px',
        maxWidth: '600px',
        margin: '50px auto',
        backgroundColor: '#ffffff',
        border: '1px solid #eee',
        borderRadius: '10px'
    };
    return (
        <div style={messageStyle}>
            <h2 style={{ color: 'var(--secondary-color, #f57f17)' }}>अभी हम आपके क्षेत्र में नहीं पहुँचे हैं</h2>
            <p style={{ color: '#555', fontSize: '16px' }}>
                लेकिन चिंता न करें! हमारी टीम जल्द ही यहाँ सेवाएँ शुरू करने के लिए पूरी कोशिश कर रही है।
            </p>
        </div>
    );
};

const HomePage = ({ searchTerm }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        setLoading(true);
        const handleLocationError = () => {
            setError('आस-पास के प्रोडक्ट्स देखने के लिए लोकेशन की अनुमति देना ज़रूरी है।');
            setLoading(false);
        };

        const locationOptions = {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 0
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({
                        lat: latitude,
                        lon: longitude
                    });
                },
                handleLocationError,
                locationOptions
            );
        } else {
            setError('यह ब्राउज़र जियोलोकेशन को सपोर्ट नहीं करता है।');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!userLocation) return;

        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const { lat, lon } = userLocation;

                const productsRes = await axios.get(
                    `http://localhost:5000/api/products?lat=${lat}&lon=${lon}&radius=10&category=${selectedCategory}&search=${searchTerm}`
                );

                setProducts(productsRes.data);
            } catch (err) {
                setError('इस क्षेत्र के प्रोडक्ट्स लाने में विफल रहे।');
            } finally {
                setLoading(false);
            }
        };

        const debounceTimeout = setTimeout(fetchData, 500);
        return () => clearTimeout(debounceTimeout);
    }, [userLocation, selectedCategory, searchTerm]);

    const pageStyle = { paddingBottom: '1rem' };
    const mainContentStyle = { padding: '0 0.75rem' };
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        marginTop: '1.5rem'
    };

    const renderContent = () => {
        if (loading) return <Loader />;
        if (error) return <p style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</p>;
        if (products.length > 0) {
            return (
                <div style={gridStyle}>
                    {products.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            );
        }
        return <NoServiceMessage />;
    };

    return (
        <div style={pageStyle}>
            {/* ✅ Banner Slider visible only if userLocation is available */}
            <BannerSlider userLocation={userLocation} />

            <div style={{ position: 'sticky', top: '70px', zIndex: 998, backgroundColor: '#eef2f5', paddingBottom: '1px' }}>
                <CategoryScroller
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />
                
            </div>

            <div style={mainContentStyle}>
                <h1 style={{ textAlign: 'center', margin: '1.5rem 0 0 0', fontSize: '1.5rem' }}>
                    {searchTerm
                        ? `Searching for "${searchTerm}"`
                        : selectedCategory === 'All'
                        ? 'आपके आस-पास के प्रोडक्ट्स'
                        : selectedCategory}
                </h1>

                {renderContent()}
            </div>
        </div>
    );
};

export default HomePage;