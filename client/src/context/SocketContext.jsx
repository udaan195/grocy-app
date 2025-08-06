import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user && user.id) {
            // baseURL को VITE_API_URL से लें
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const newSocket = io(API_URL);
            setSocket(newSocket);

            newSocket.on('connect', () => {
                newSocket.emit('addUser', user.id);
            });

            newSocket.on('receiveNotification', (notification) => {
                setNotifications(prev => [{ ...notification, timestamp: new Date() }, ...prev]);
            });

            return () => newSocket.disconnect();
        }
    }, [user?.id]);

    return (
        <SocketContext.Provider value={{ socket, notifications, setNotifications }}>
            {children}
        </SocketContext.Provider>
    );
};
