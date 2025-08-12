import React, { useState, useEffect } from 'react';  
import axios from '../api.js';  
import ProductCard from '../components/ProductCard.jsx';  
import CategoryScroller from '../components/CategoryScroller.jsx';  
import Loader from '../components/Loader.jsx';  
import BannerSlider from '../components/BannerSlider.jsx';  
  
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
    const [banners, setBanners] = useState([]);  
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
            const encodedCategory = encodeURIComponent(selectedCategory);  
            try {  
                const { lat, lon } = userLocation;  
  
                const [productsRes, bannersRes] = await Promise.all([  
                    axios.get(`https://grocy-app-server.onrender.com/api/products?lat=${lat}&lon=${lon}&category=${encodedCategory}&search=${searchTerm}`),  
                    axios.get(`https://grocy-app-server.onrender.com/api/banners?lat=${lat}&lon=${lon}`)  
                ]);  
  
                setProducts(productsRes.data);  
                setBanners(bannersRes.data);  
  
                // 🐞 Debugging banners  
                console.log("📢 Banner API Response:", bannersRes.data);  
                console.log("📢 Banner count:", bannersRes.data.length);  
  
            } catch (err) {  
                console.error("❌ Banner/Products fetch error:", err);  
                setError('इस क्षेत्र के प्रोडक्ट्स लाने में विफल रहे।');  
            } finally {  
                setLoading(false);  
            }  
        };  
  
        const debounceTimeout = setTimeout(fetchData, 300);  
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
            {/* ✅ Debug banner rendering condition */}  
            {console.log("📢 Banner render check → Loading:", loading, "| Banner Count:", banners.length)}  
            {!loading && banners.length > 0 && <BannerSlider banners={banners} />}  
  
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