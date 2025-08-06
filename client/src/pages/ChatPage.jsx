import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api.js';
import { useSocket } from '../context/SocketContext.jsx';
import './ChatPage.css';
import Loader from '../components/Loader.jsx';

const ChatPage = () => {
  const { orderId } = useParams();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  const prebuiltMessages = {
    requestLocation: "Can you please share your live location?",
    onMyWay: "I am on my way.",
    arrived: "I have arrived."
  };

  // ✅ Load Order & Messages
  useEffect(() => {
    if (!socket) return;

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [messagesRes, orderRes] = await Promise.all([
          axios.get(`/api/messages/${orderId}`, config),
          axios.get(`/api/orders/${orderId}`, config)
        ]);

        setMessages(messagesRes.data);
        setOrder(orderRes.data);

        console.log("✅ Chat and Order Loaded:", messagesRes.data.length, orderRes.data.orderStatus);

      } catch (error) {
        console.error("❌ Failed to fetch chat/order", error);
        alert("Something went wrong while loading chat");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    socket.emit('joinOrderRoom', orderId);
    console.log('📡 Joined chat room:', orderId);

    const messageListener = (msg) => {
      console.log('📨 Message received:', msg);
      setMessages(prev => [...prev, msg]);
    };

    socket.on('receiveMessage', messageListener);

    return () => {
      if (socket) {
        socket.emit('leaveOrderRoom', orderId);
        console.log('🚪 Left chat room:', orderId);
        socket.off('receiveMessage', messageListener);
      }
    };
  }, [socket, orderId]);

  // ✅ Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendTextMessage = (textToSend) => {
    if (!textToSend.trim() || !socket) return;

    const msgPayload = {
      orderId,
      sender: { id: user.id, name: user.name, role: user.role },
      messageText: textToSend
    };

    console.log("📤 Sending message to server:", msgPayload);

    socket.emit('sendMessage', msgPayload);
    setNewMessage('');
  };

  const handleLocationResponse = (accept) => {
    if (accept) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          socket.emit('sendLocation', {
            orderId,
            sender: { id: user.id, name: user.name, role: user.role },
            coords: { latitude, longitude }
          });
        },
        (error) => {
          alert("Location permission denied.");
          handleSendTextMessage("Sorry, I couldn't share my location.");
        }
      );
    } else {
      handleSendTextMessage("Sorry, I cannot share my location.");
    }
  };

  if (loading || !order) return <Loader />;

  const isChatActive = order.orderStatus === 'Processing' || order.orderStatus === 'Shipped';
  const lastMessage = messages[messages.length - 1];

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h2>Order #{orderId.slice(-6)}</h2>
        <p>Status: <b>{order.orderStatus}</b></p>
      </div>

      <div className="messages-container">
{messages.map((msg) => {
  const isSentByMe = msg.sender?.id === user.id || msg.sender?._id === user.id;

  return (
    <div key={msg._id} className={`message-bubble ${isSentByMe ? 'sent' : 'received'}`}>
      {msg.isLocation || /^https:\/\/www\.google\.com\/maps\?q=/.test(msg.message) ? (
        <a
          href={msg.message}
          target="_blank"
          rel="noopener noreferrer"
          className="location-link"
        >
          📍 View Location on Map
        </a>
      ) : (
        <p>{msg.message}</p>
      )}
    </div>
  );
})}

        {/* ✅ Location Response Prompt for Customer */}
        {user.role === 'customer' &&
          lastMessage?.message === prebuiltMessages.requestLocation && (
            <div className="response-buttons">
              <button onClick={() => handleLocationResponse(true)} className="yes-btn">
                Yes, Share Location
              </button>
              <button onClick={() => handleLocationResponse(false)} className="no-btn">
                No
              </button>
            </div>
          )}

        <div ref={messagesEndRef} />
      </div>

      {/* ✅ Chat Footer */}
      {isChatActive ? (
        <div className="chat-footer">
          {user.role === 'vendor' && (
            <div className="prebuilt-buttons">
              <button onClick={() => handleSendTextMessage(prebuiltMessages.requestLocation)}>
                Request Location
              </button>
              <button onClick={() => handleSendTextMessage(prebuiltMessages.onMyWay)}>
                On my way
              </button>
              <button onClick={() => handleSendTextMessage(prebuiltMessages.arrived)}>
                Arrived
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendTextMessage(newMessage);
            }}
            className="message-form"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      ) : (
        <p className="chat-closed-text">This chat has been closed.</p>
      )}
    </div>
  );
};

export default ChatPage;