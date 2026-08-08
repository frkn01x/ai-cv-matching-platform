import React, { useState } from 'react';
import axios from 'axios';
import './ApplicationForm.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function ApplicationForm({ job, userToken }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: ''
  });
  
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Phone: only numbers
    if (name === 'phone') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: numbersOnly }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      if (file.type !== 'application/pdf') {
        setMessage({ type: 'error', text: 'Only PDF files are allowed' });
        e.target.value = '';
        return;
      }
      
      if (file.size > 5242880) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB' });
        e.target.value = '';
        return;
      }
      
      setCvFile(file);
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cvFile) {
      setMessage({ type: 'error', text: 'Please upload your CV' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('phone', formData.phone);
    data.append('cv', cvFile);
    
    if (job) {
      data.append('jobId', job.id);
      data.append('jobTitle', job.title);
    }

    try {
      const response = await axios.post(`${API_URL}/applications/submit`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage({ 
        type: 'success', 
        text: '✅ Application submitted successfully!'
      });
      
      setFormData({
        fullName: '',
        phone: ''
      });
      setCvFile(null);
      document.getElementById('cv-file').value = '';
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Submission failed. Please try again.';
      
      // User-friendly error messages
      let displayMsg = errorMsg;
      if (errorMsg.includes('security scan') || errorMsg.includes('virus')) {
        displayMsg = '⚠️ Security Warning: Your file contains suspicious content. Please ensure you are uploading a clean PDF.';
      } else if (errorMsg.includes('Invalid file type')) {
        displayMsg = '⚠️ Invalid file format. Please upload a PDF file only.';
      } else if (errorMsg.includes('Invalid name') || errorMsg.includes('Invalid phone')) {
        displayMsg = '⚠️ Please check your name and phone number format.';
      }
      
      setMessage({ 
        type: 'error', 
        text: displayMsg
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="application-form-container">
      <h2>Submit Your CV</h2>
      {job && (
        <div className="selected-job">
          <p>📌 Applying for: <strong>{job.title}</strong></p>
        </div>
      )}
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="application-form">
        <div className="form-group">
          <label htmlFor="fullName">Full Name *</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            minLength={2}
            maxLength={100}
            pattern="[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+"
            placeholder="John Doe"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            pattern="[0-9]{10,15}"
            minLength="10"
            maxLength="15"
            placeholder="5551234567"
          />
          <small className="input-help">Enter 10-15 digits (numbers only)</small>
        </div>

        <div className="form-group">
          <label htmlFor="cv-file">Upload CV (PDF only, max 5MB) *</label>
          <input
            type="file"
            id="cv-file"
            accept=".pdf"
            onChange={handleFileChange}
            required
          />
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>

      <div className="security-notice">
        <p>🔒 Your data is protected with enterprise-grade security</p>
      </div>
    </div>
  );
}

export default ApplicationForm;
