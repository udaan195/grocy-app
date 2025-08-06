import React, { useState } from 'react';
import axios from '../api.js';

const CompleteProfilePage = () => {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // OTP वेरिफिकेशन से मिला अस्थायी टोकन
            const tempToken = localStorage.getItem('tempToken');
            const config = { headers: { Authorization: `Bearer ${tempToken}` } };

            const { data } = await axios.put('http://localhost:5000/api/users/complete-profile', { name, phoneNumber }, config);

            // नया परमानेंट टोकन और यूजर जानकारी सेव करें
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.removeItem('tempToken'); // अस्थायी टोकन हटा दें
            window.location.href = '/'; // होम पेज पर भेजें

        } catch (error) {
            alert('Failed to update profile.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2>Complete Your Profile</h2>
            <p>We need a little more information to get you started.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required />
                <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Phone Number" />
                <button type="submit">Save and Continue</button>
            </form>
        </div>
    );
};
export default CompleteProfilePage;
