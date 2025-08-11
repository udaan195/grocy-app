import React from 'react';
import './StaticPage.css'; // कॉमन CSS इम्पोर्ट करें

const AboutUsPage = () => {
    return (
        <div className="static-page-container">
            <h1>About Grocy</h1>
            
            <h2>Our Mission</h2>
            <p>Our mission is to connect you with your favorite local vendors, bringing fresh groceries and daily essentials right to your doorstep. We aim to empower local businesses while providing our customers with convenience, quality, and speed.</p>

            <h2>Our Story</h2>
            <p>Grocy started as a small idea in a big city - how can we make grocery shopping easier while supporting the small stores that are the heart of our communities? From this question, Grocy was born. We are a team of passionate individuals dedicated to creating a seamless bridge between you and your neighborhood shops.</p>

            <h2>Why Choose Us?</h2>
            <ul>
                <li><strong>Support Local:</strong> Every order you place helps a local vendor in your community.</li>
                <li><strong>Freshness Guaranteed:</strong> We ensure that you receive the freshest products directly from the store.</li>
                <li><strong>Fast & Reliable:</strong> Our hyperlocal model allows for incredibly fast and reliable delivery.</li>
            </ul>
        </div>
    );
};

export default AboutUsPage;
