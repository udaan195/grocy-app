import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { CartProvider } from './context/CartContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SocketProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </SocketProvider>
  </React.StrictMode>,
);
