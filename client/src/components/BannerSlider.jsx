import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BannerSlider.css';

const BannerSlider = ({ location }) => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    if (!location) return;

    const fetchBanners = async () => {
      try {
        const res = await axios.get(
          `/api/banners?lat=${location.lat}&lon=${location.lon}`
        );
        setBanners(res.data);
      } catch (error) {
        console.error('❌ Error fetching banners:', error);
      }
    };

    fetchBanners();
  }, [location]);

  if (!banners.length) return null;

  return (
    <div className="banner-slider">
      {banners.map((banner) => (
        <img
          key={banner._id}
          src={banner.imageUrl}
          alt="Vendor Banner"
          className="banner-image"
        />
      ))}
    </div>
  );
};

export default BannerSlider;