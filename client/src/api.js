import axios from 'axios';

// एक नया axios इंस्टेंस बनाएँ
const API = axios.create({
    // अगर VITE_API_URL मौजूद है (Vercel पर), तो उसे इस्तेमाल करें,
    // वरना डेवलपमेंट के लिए localhost का इस्तेमाल करें
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

export default API;
