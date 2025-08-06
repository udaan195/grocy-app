const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Cloudinary को अपने अकाउंट क्रेडेंशियल्स के साथ कॉन्फ़िगर करें
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary पर स्टोरेज सेटिंग्स
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'grocy-app-products', // Cloudinary में इस नाम का फोल्डर बन जाएगा
        allowed_formats: ['jpeg', 'png', 'jpg'] // सिर्फ इन फॉर्मेट्स को अनुमति दें
    }
});

// multer को स्टोरेज इंजन के साथ इनिशियलाइज़ करें
const upload = multer({ storage: storage });

module.exports = upload;
