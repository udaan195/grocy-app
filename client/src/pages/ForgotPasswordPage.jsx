import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/auth/forgot-password', { email });
            alert('Password reset OTP has been sent to your email.');
            // OTP डालने वाले पेज पर भेजें
            navigate('/reset-password', { state: { email } });
        } catch (error) {
            alert(error.response.data.message);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your registered email" required />
                <button type="submit">Send OTP</button>
            </form>
        </div>
    );
};
export default ForgotPasswordPage;
