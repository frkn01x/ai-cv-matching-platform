import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function AdminDashboard({ token }) {
  const [applications, setApplications] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('applications'); // applications or jobs

  useEffect(() => {
    fetchApplications();
    fetchStatistics();
    fetchJobs();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      const params = filter !== 'all' ? { status: filter.toUpperCase() } : {};
      const response = await axios.get(`${API_URL}/admin/applications`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setApplications(response.data.applications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleStatusUpdate = async (id, status, note) => {
    try {
      await axios.put(
        `${API_URL}/admin/applications/${id}/status`,
        { status, adminNote: note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchApplications();
      setSelectedApp(null);
      alert('Application status updated successfully!');
    } catch (error) {
      alert('Failed to update status: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleBackup = async () => {
    try {
      await axios.post(
        `${API_URL}/admin/backup`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Database backup completed successfully!');
    } catch (error) {
      alert('Backup failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(response.data.jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleAddJob = async (jobData) => {
    try {
      await axios.post(
        `${API_URL}/admin/jobs`,
        jobData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Job position added successfully!');
      setShowJobForm(false);
      fetchJobs();
    } catch (error) {
      alert('Failed to add job: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job position?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/admin/jobs/${jobId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Job position deleted successfully!');
      fetchJobs();
      fetchApplications();
    } catch (error) {
      alert('Failed to delete job: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <div className="header-actions">
          {activeTab === 'jobs' && (
            <button onClick={() => setShowJobForm(true)} className="add-job-button">
              + Add New Job
            </button>
          )}
          <button onClick={handleBackup} className="backup-button">
            Backup to Oracle Cloud
          </button>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </button>
        <button 
          className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Job Positions
        </button>
      </div>

      {activeTab === 'applications' && (
        <>
          {statistics && (
            <div className="statistics">
              <div className="stat-card">
                <h3>Total Applications</h3>
                <p className="stat-number">{statistics.overall.total}</p>
              </div>
              <div className="stat-card">
                <h3>Pending</h3>
                <p className="stat-number pending">{statistics.overall.pending}</p>
              </div>
              <div className="stat-card">
                <h3>Accepted</h3>
                <p className="stat-number accepted">{statistics.overall.accepted}</p>
              </div>
              <div className="stat-card">
                <h3>Rejected</h3>
                <p className="stat-number rejected">{statistics.overall.rejected}</p>
              </div>
              <div className="stat-card">
                <h3>Avg Match Score</h3>
                <p className="stat-number">{Math.round(statistics.overall.avg_match_score || 0)}%</p>
              </div>
            </div>
          )}

          <div className="filter-bar">
            <button 
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'active' : ''}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('pending')}
              className={filter === 'pending' ? 'active' : ''}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilter('accepted')}
              className={filter === 'accepted' ? 'active' : ''}
            >
              Accepted
            </button>
            <button 
              onClick={() => setFilter('rejected')}
              className={filter === 'rejected' ? 'active' : ''}
            >
              Rejected
            </button>
          </div>

          <div className="applications-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Position</th>
                  <th>Match Score</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id}>
                    <td>{app.id}</td>
                    <td>{app.full_name}</td>
                    <td>{app.phone}</td>
                    <td><strong>{app.position}</strong></td>
                    <td>
                      <span className={`score ${app.match_score >= 70 ? 'high' : app.match_score >= 50 ? 'medium' : 'low'}`}>
                        {app.match_score}%
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>{new Date(app.created_at).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="view-button"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'jobs' && (
        <div className="jobs-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Applications</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td>{job.id}</td>
                  <td><strong>{job.title}</strong></td>
                  <td>{job.application_count || 0}</td>
                  <td>
                    <span className={`status-badge ${job.active ? 'accepted' : 'rejected'}`}>
                      {job.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(job.created_at).toLocaleDateString()}</td>
                  <td>
                    <button 
                      onClick={() => handleDeleteJob(job.id)}
                      className="delete-button"
                      disabled={!job.active}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedApp && (
        <ApplicationModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdate={handleStatusUpdate}
        />
      )}

      {showJobForm && (
        <JobFormModal
          onClose={() => setShowJobForm(false)}
          onSubmit={handleAddJob}
        />
      )}
    </div>
  );
}

function JobFormModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // XSS prevention: sanitize input
    const sanitizedValue = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Input validation
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Title and description are required');
      return;
    }

    if (formData.title.length < 3 || formData.title.length > 100) {
      alert('Title must be between 3 and 100 characters');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content job-form-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        
        <h3>Add New Job Position</h3>
        
        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-group">
            <label htmlFor="title">Job Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength="100"
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Job Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Describe the job responsibilities, qualifications, and requirements..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="requirements">Additional Requirements</label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows={4}
              placeholder="List specific skills, experience, or qualifications..."
            />
          </div>

          <button type="submit" className="submit-button">
            Add Job Position
          </button>
        </form>
      </div>
    </div>
  );
}

function ApplicationModal({ application, onClose, onUpdate }) {
  const [status, setStatus] = useState(application.status);
  const [note, setNote] = useState(application.admin_note || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(application.id, status, note);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        
        <h3>Application Details</h3>
        
        <div className="application-details">
          <p><strong>Name:</strong> {application.full_name}</p>
          <p><strong>Email:</strong> {application.email}</p>
          <p><strong>Phone:</strong> {application.phone}</p>
          <p><strong>Position:</strong> {application.position}</p>
          <p><strong>Experience:</strong> {application.experience} years</p>
          <p><strong>Match Score:</strong> {application.match_score}%</p>
          <p><strong>AI Recommendation:</strong> {application.recommendation}</p>
          
          {application.cover_letter && (
            <div>
              <strong>Cover Letter:</strong>
              <p className="cover-letter">{application.cover_letter}</p>
            </div>
          )}
          
          {application.ai_analysis && (
            <div>
              <strong>AI Analysis:</strong>
              <pre className="ai-analysis">{application.ai_analysis}</pre>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="status-form">
          <div className="form-group">
            <label>Update Status:</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accept</option>
              <option value="REJECTED">Reject</option>
            </select>
          </div>

          <div className="form-group">
            <label>Admin Note:</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add a note (optional)..."
            />
          </div>

          <button type="submit" className="update-button">
            Update Status
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;
