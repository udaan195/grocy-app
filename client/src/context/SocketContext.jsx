// client/src/context/SocketContext.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?._id) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // ✅ फिक्स किया गया

      const newSocket = io(API_URL, { withCredentials: true });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        newSocket.emit('joinUser', user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      newSocket.on('newNotification', (notification) => {
        console.log('🔔 New notification received:', notification);
        setNotifications(prev => [notification, ...prev]);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user?._id]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!user?._id) return;
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/${user._id}/notifications`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setNotifications(res.data || []);
      } catch (err) {
        console.error('❌ Error loading notifications', err);
      }
    };
    fetchNotifications();
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, notifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);