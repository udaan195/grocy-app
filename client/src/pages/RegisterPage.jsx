import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader.jsx'; // <-- Import Loader

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phoneNumber: '', password: '' });
    const [loading, setLoading] = useState(false); // <-- Loader state
    const navigate = useNavigate();

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Show loader
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/register', formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/');
        } catch (error) {
            alert(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false); // Hide loader
        }
    };

    if (loading) return <Loader />; // <-- Show loader during request

    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" name="name" onChange={handleChange} placeholder="Full Name" required />
                <input type="email" name="email" onChange={handleChange} placeholder="Email Address" required />
                <input type="tel" name="phoneNumber" onChange={handleChange} placeholder="Phone Number" required />
                <input type="password" name="password" onChange={handleChange} placeholder="Password" required />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default RegisterPage;