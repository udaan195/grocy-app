import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: location.state?.email || '',
        otp: '',
        password: '',
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/auth/reset-password', formData);
            alert('Password has been reset successfully. Please login with your new password.');
            navigate('/login');
        } catch (error) {
            alert(error.response.data.message);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" value={formData.email} readOnly />
                <input type="text" name="otp" onChange={handleChange} placeholder="Enter OTP from email" required />
                <input type="password" name="password" onChange={handleChange} placeholder="Enter your new password" required />
                <button type="submit">Reset Password</button>
            </form>
        </div>
    );
};
export default ResetPasswordPage;
