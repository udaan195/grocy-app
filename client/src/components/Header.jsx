import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import './Header.css';
import {
    FaBell,
    FaSearch,
    FaShoppingCart,
    FaUserCircle,
    FaArrowLeft
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const Header = ({ searchTerm, setSearchTerm }) => {
    const { socket, notifications = [] } = useSocket();  // ✅ default empty array
    const { cartItems = [] } = useCart();                // ✅ default empty array
    const [user, setUser] = useState(null);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notificationModalOpen, setNotificationModalOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const navigate = useNavigate();
    const headerRef = useRef(null);

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user')));

        const handleClickOutside = (event) => {
            if (headerRef.current && !headerRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setProfileDropdownOpen(false);
        navigate('/login');
    };

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <header className="header" ref={headerRef}>
                {isSearchOpen ? (
                    <div className="search-overlay">
                        <FaArrowLeft size={20} onClick={() => setIsSearchOpen(false)} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                ) : (
                    <>
                        <Link to="/" className="logo">GROCY</Link>
                        <div className="nav-icons">
                            <FaSearch size={20} onClick={() => setIsSearchOpen(true)} />

                            <div className="icon-wrapper" onClick={() => setNotificationModalOpen(prev => !prev)}>
                                <FaBell size={20} />
                                {notifications.length > 0 && (
                                    <span className="count-badge">{notifications.length}</span>
                                )}
                            </div>

                            <Link to="/cart" className="icon-wrapper">
                                <FaShoppingCart size={22} />
                                {totalItems > 0 && (
                                    <span className="count-badge">{totalItems}</span>
                                )}
                            </Link>

                            <div className="icon-wrapper" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
                                <FaUserCircle size={22} />
                                {profileDropdownOpen && (
                                    <ul className="profile-dropdown">
                                        {user ? (
                                            <>
                                                <li><Link to="/profile">Profile</Link></li>
                                                {user.role === 'customer' && <li><Link to="/my-orders">My Orders</Link></li>}
                                                {user.role === 'vendor' && <li><Link to="/vendor/dashboard">Dashboard</Link></li>}
                                                {user.role === 'superadmin' && <li><Link to="/admin/dashboard">Admin</Link></li>}
                                                <li className="logout-btn" onClick={handleLogout}>Logout</li>
                                            </>
                                        ) : (
                                            <>
                                                <li><Link to="/login">Login</Link></li>
                                                <li><Link to="/register">Register</Link></li>
                                            </>
                                        )}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </header>

            {/* ✅ Notification Modal */}
            {notificationModalOpen && (
                <div className="notification-overlay" onClick={() => setNotificationModalOpen(false)}>
                    <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Notifications</h3>
 {notifications.length === 0 ? (
  <p className="no-notification">No new notifications</p>
) : (
  <ul className="notification-list">
    {notifications.map((n, i) => (
      <li key={n._id || i} className="notification-item">
        <p>{n.message}</p>
        <small>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</small>
        {n.link && (
          <button onClick={() => {
            navigate(n.link);
            setNotificationModalOpen(false);
          }}>View</button>
        )}
      </li>
    ))}
  </ul>
)}
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;