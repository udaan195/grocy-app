import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api.js';

const LoginPage = () => {
    const [method, setMethod] = useState('password');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post('https://grocy-app-server.onrender.com/api/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            setLoading(false);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post('https://grocy-app-server.onrender.com/api/auth/send-otp', { email });
            setIsOtpSent(true);
            setError('OTP has been sent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post('https://grocy-app-server.onrender.com/api/auth/verify-otp', { email, otp });

            if (data.profileComplete === false) {
                localStorage.setItem('tempToken', data.tempToken);
                navigate('/complete-profile');
            } else {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/';
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            {loading && (
                <div style={styles.loaderOverlay}>
                    <div className="spinner"></div>
                </div>
            )}
            <div style={styles.loginBox}>
                <div style={styles.logoContainer}>
                    <span style={{fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-color)'}}>GROCY</span>
                </div>
                <h2 style={styles.title}>Login to your Account</h2>
                
                {error && <p style={{color: error === 'OTP has been sent to your email.' ? 'green' : 'red', textAlign: 'center'}}>{error}</p>}

                {method === 'password' ? (
                    <form onSubmit={handlePasswordLogin} style={styles.form}>
                        <label>Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        <label style={{marginTop: '1rem'}}>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <button type="submit" disabled={loading} style={styles.loginButton}>{loading ? 'Logging in...' : 'Login'}</button>
                        <a onClick={() => { setMethod('otp'); setError(''); }} style={styles.switchLink}>Login with OTP instead</a>
                    </form>
                ) : (
                    <form onSubmit={!isOtpSent ? handleSendOtp : handleVerifyOtp} style={styles.form}>
                        <label>Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required readOnly={isOtpSent} />
                        {isOtpSent && (
                            <>
                                <label style={{marginTop: '1rem'}}>OTP</label>
                                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit OTP" required />
                            </>
                        )}
                        <button type="submit" disabled={loading} style={styles.loginButton}>
                            {loading ? 'Processing...' : (isOtpSent ? 'Verify OTP & Login' : 'Send OTP')}
                        </button>
                        <a onClick={() => { setMethod('password'); setError(''); }} style={styles.switchLink}>Login with Password instead</a>
                    </form>
                )}

                <div style={styles.footer}>
                    <Link to="/forgot-password" style={styles.link}>Forgot Password?</Link>
                    <p>Don't have an account? <Link to="/register" style={styles.link}>Register here</Link></p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '1rem' },
    loginBox: { width: '100%', maxWidth: '400px', padding: '2rem', backgroundColor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', zIndex: 1 },
    logoContainer: { textAlign: 'center', marginBottom: '1.5rem' },
    title: { textAlign: 'center', marginBottom: '1.5rem', color: '#333' },
    form: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    loginButton: { marginTop: '1rem', padding: '0.75rem' },
    link: { color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600' },
    switchLink: { color: '#555', textDecoration: 'underline', cursor: 'pointer', textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' },
    footer: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' },
    loaderOverlay: {
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10
    }
};
export default LoginPage;