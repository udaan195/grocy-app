const React = require('react');
const Slider = require('react-slick');

const BannerSlider = ({ banners }) => {
    const settings = {
        dots: true,
        infinite: banners.length > 1, // अगर 1 से ज़्यादा बैनर हैं तभी स्लाइड करें
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false
    };

    // अगर कोई बैनर नहीं है, तो कुछ भी न दिखाएं
    if (!banners || banners.length === 0) {
        return null;
    }

    return (
        <div style={{ margin: '1rem 0.75rem' }}>
            <Slider {...settings}>
                {banners.map(banner => (
                    <div key={banner._id}>
                        <img 
                            src={banner.image} 
                            alt={banner.title} 
                            style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '12px' }} 
                        />
                    </div>
                ))}
            </Slider>
        </div>
    );
};

module.exports = BannerSlider;