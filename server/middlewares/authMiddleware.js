const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
let token;

if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {  
    try {  
        // हेडर से टोकन निकालें ('Bearer' शब्द हटाकर)  
        token = req.headers.authorization.split(' ')[1];  

        // टोकन को वेरिफाई करें  
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  

        // यूजर की जानकारी (बिना otp के) टोकन से निकालकर req ऑब्जेक्ट में डाल दें  
        req.user = await User.findById(decoded.id).select('-otp -otpExpires');  

        next(); // अगले फंक्शन पर जाएँ  

    } catch (error) {  
        console.error(error);  
        res.status(401).json({ message: 'Not authorized, token failed' });  
    }  
}  

if (!token) {  
    res.status(401).json({ message: 'Not authorized, no token' });  
}

};
const isVendor = (req, res, next) => {
if (req.user && req.user.role === 'vendor') {
next();
} else {
res.status(401).json({ message: 'Not authorized as a vendor' });
}
};
// ... protect और isVendor फंक्शन के बाद ...

const isAdmin = (req, res, next) => {
if (req.user && req.user.role === 'superadmin') {
next();
} else {
res.status(401).json({ message: 'Not authorized as an admin' });
}
};
const isVendorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'vendor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
};

// module.exports को अपडेट करें ताकि isAdmin भी एक्सपोर्ट हो
module.exports = { protect, isVendor, isAdmin };

