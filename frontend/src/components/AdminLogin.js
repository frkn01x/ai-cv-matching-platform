import React, { useState } from 'react';
import axios from 'axios';
import './AdminLogin.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function AdminLogin({ onLogin }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      setStep(2);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, {
        email: formData.email,
        otp: formData.otp
      });

      onLogin(response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <h2>Admin Login</h2>
      
      {error && <div className="error-message">{error}</div>}

      {step === 1 && (
        <form onSubmit={handleLoginSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={8}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleOTPSubmit} className="otp-form">
          <p className="otp-message">
            An OTP has been sent to your email. Please enter it below.
          </p>

          <div className="form-group">
            <label htmlFor="otp">OTP Code</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={formData.otp}
              onChange={handleInputChange}
              required
              maxLength={6}
              pattern="[0-9]{6}"
              placeholder="000000"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button 
            type="button" 
            onClick={() => setStep(1)}
            className="back-button"
          >
            Back to Login
          </button>
        </form>
      )}
    </div>
  );
}

export default AdminLogin;
