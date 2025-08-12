import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BannerSlider.css';

const BannerSlider = ({ location }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("📍 BannerSlider mounted. Location prop:", location);

    if (!location) {
      console.warn("⚠️ Location missing. Banners fetch skipped.");
      setLoading(false);
      return;
    }

    const fetchBanners = async () => {
      try {
        console.log(`🔄 Fetching banners for lat=${location.lat}, lon=${location.lon}`);
        const res = await axios.get(
          `/api/banners?lat=${location.lat}&lon=${location.lon}`
        );
        console.log("📢 API Response:", res.data);

        if (Array.isArray(res.data) && res.data.length > 0) {
          setBanners(res.data);
        } else {
          console.warn("⚠️ API returned empty banners array.");
        }
      } catch (error) {
        console.error('❌ Error fetching banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [location]);

  if (loading) {
    return <div>⏳ Loading banners...</div>;
  }

  if (!banners.length) {
    return <div>🚫 No banner available</div>;
  }

  return (
    <div className="banner-slider">
      {banners.map((banner) => {
        console.log("🖼 Rendering banner:", banner);
        return (
          <img
            key={banner._id || Math.random()}
            src={banner.imageUrl}
            alt="Vendor Banner"
            className="banner-image"
            onError={() => console.error(`❌ Failed to load image: ${banner.imageUrl}`)}
          />
        );
      })}
    </div>
  );
};

export default BannerSlider;