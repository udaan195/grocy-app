import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { CartProvider } from './context/CartContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// --- डीबगिंग के लिए यह अलर्ट जोड़ें ---
const apiUrl = import.meta.env.VITE_API_URL;
alert("API URL being used is: " + apiUrl);
// ------------------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SocketProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </SocketProvider>
  </React.StrictMode>,
);
