import React, { useState } from 'react';
import axios from 'axios';
import './UserRegister.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function UserRegister({ onSwitchToLogin }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Phone validation: only digits, exactly 10, no leading zero
    if (name === 'phone') {
      const sanitized = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: sanitized }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/user/register`, formData);
      setStep(2);
      setSuccess('OTP sent to your email!');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/user/verify-registration`, {
        email: formData.email,
        otp
      });
      setSuccess('Registration successful! Please login.');
      setTimeout(() => onSwitchToLogin(), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-register-container">
      <h2>Create Account</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {step === 1 && (
        <form onSubmit={handleRegister} className="register-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              minLength={2}
              maxLength={100}
            />
          </div>

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
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              pattern="[1-9][0-9]{9}"
              placeholder="5551234567"
              maxLength={10}
            />
            <small className="input-hint">📞 10 digits (start without 0, e.g., 5551234567)</small>
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
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
            />
            <div className="password-requirements">
              <small>🔒 Password must contain:</small>
              <ul>
                <li>✓ Minimum 8 characters</li>
                <li>✓ 1 uppercase letter (A-Z)</li>
                <li>✓ 1 lowercase letter (a-z)</li>
                <li>✓ 1 number (0-9)</li>
                <li>✓ 1 special character (@$!%*?&)</li>
              </ul>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>

          <p className="switch-text">
            Already have an account?{' '}
            <span onClick={onSwitchToLogin} className="link">Login</span>
          </p>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOTP} className="otp-form">
          <p className="otp-message">
            Enter the OTP sent to {formData.email}
          </p>

          <div className="form-group">
            <label htmlFor="otp">OTP Code</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              pattern="[0-9]{6}"
              placeholder="000000"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Complete'}
          </button>
        </form>
      )}
    </div>
  );
}

export default UserRegister;
