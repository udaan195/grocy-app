import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                {/* सेक्शन 1: ऐप के बारे में */}
                <div className="footer-section">
                    <h4>GROCY</h4>
                    <p>Your one-stop shop for fresh groceries, delivered right to your doorstep.</p>
                </div>

                {/* सेक्शन 2: क्विक लिंक्स */}
                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                        <li><Link to="/faq">FAQ</Link></li>
                    </ul>
                </div>

                {/* सेक्शन 3: कैटेगरी */}
                <div className="footer-section">
                    <h4>Categories</h4>
                    <ul>
                        <li><Link to="/category/vegetables">Vegetables</Link></li>
                        <li><Link to="/category/fruits">Fruits</Link></li>
                        <li><Link to="/category/dairy">Dairy & Bakery</Link></li>
                    </ul>
                </div>

                {/* सेक्शन 4: सोशल मीडिया */}
                <div className="footer-section">
                    <h4>Follow Us</h4>
                    <div className="social-links">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                    </div>
                </div>
            </div>
            <div className="copyright">
                &copy; {new Date().getFullYear()} Grocy App. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
