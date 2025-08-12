import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BannerSlider.css';

const BannerSlider = ({ location }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true); // 🔹 Loading state
  const [error, setError] = useState(null); // 🔹 Error state

  useEffect(() => {
    console.log("📍 BannerSlider mounted. Location:", location);

    if (!location || !location.lat || !location.lon) {
      console.warn("⚠ Location not available yet. Skipping banner fetch.");
      setLoading(false);
      return;
    }

    const fetchBanners = async () => {
      try {
        console.log(`🌐 Fetching banners for lat=${location.lat}, lon=${location.lon}`);
        const res = await axios.get(`/api/banners?lat=${location.lat}&lon=${location.lon}`);

        console.log("✅ API Response:", res.data);

        if (Array.isArray(res.data) && res.data.length > 0) {
          setBanners(res.data);
          console.log(`🎯 Loaded ${res.data.length} banners`);
        } else {
          console.warn("⚠ No banners received from API.");
        }
      } catch (err) {
        console.error("❌ Error fetching banners:", err);
        setError(err.message || "Failed to fetch banners");
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [location]);

  if (loading) {
    return <p style={{ textAlign: "center" }}>⏳ Loading banners...</p>;
  }

  if (error) {
    return <p style={{ textAlign: "center", color: "red" }}>⚠ {error}</p>;
  }

  if (!banners.length) {
    return <p style={{ textAlign: "center" }}>ℹ No banners available.</p>;
  }

  return (
    <div className="banner-slider">
      {banners.map((banner) => (
        <img
          key={banner._id || banner.imageUrl}
          src={banner.imageUrl}
          alt="Vendor Banner"
          className="banner-image"
        />
      ))}
    </div>
  );
};

export default BannerSlider;