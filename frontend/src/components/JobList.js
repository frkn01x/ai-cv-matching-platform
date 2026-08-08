import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './JobList.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function JobList({ userToken, onApply, onLogin }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_URL}/applications/jobs`);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (job) => {
    if (!userToken) {
      alert('Please login or register to apply!');
      onLogin();
      return;
    }
    setSelectedJob(job);
    onApply(job);
  };

  if (loading) {
    return <div className="loading">Loading jobs...</div>;
  }

  return (
    <div className="job-list-container">
      <h2>🎯 Available Positions</h2>
      
      {jobs.length === 0 ? (
        <div className="no-jobs">
          <p>No job openings at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <h3>{job.title}</h3>
                <span className="job-badge">{job.active ? '✓ Active' : 'Closed'}</span>
              </div>
              
              <p className="job-description">{job.description}</p>
              
              {job.requirements && (
                <div className="job-requirements">
                  <strong>Requirements:</strong>
                  <p>{job.requirements}</p>
                </div>
              )}
              
              <button 
                className="apply-button"
                onClick={() => handleApplyClick(job)}
                disabled={!job.active}
              >
                {job.active ? '📝 Apply Now' : 'Position Closed'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobList;
