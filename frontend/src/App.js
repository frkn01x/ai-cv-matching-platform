import React, { useState, useEffect } from 'react';
import './App.css';
import JobList from './components/JobList';
import ApplicationForm from './components/ApplicationForm';
import UserRegister from './components/UserRegister';
import UserLogin from './components/UserLogin';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [view, setView] = useState('jobs');
  const [adminToken, setAdminToken] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('userToken');
    const savedUser = localStorage.getItem('currentUser');
    const savedView = localStorage.getItem('currentView');

    if (savedToken && savedUser) {
      const user = JSON.parse(savedUser);
      setUserToken(savedToken);
      setCurrentUser(user);
      
      if (user.role === 'admin' || user.role === 'super_admin') {
        setAdminToken(savedToken);
        setView(savedView || 'dashboard');
      } else {
        setView(savedView || 'jobs');
      }
    }
  }, []);

  const handleUserLogin = (token, user) => {
    setUserToken(token);
    setCurrentUser(user);
    
    // Save to localStorage
    localStorage.setItem('userToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Role-based routing: admin -> dashboard, user -> jobs
    if (user.role === 'admin' || user.role === 'super_admin') {
      setAdminToken(token);
      setView('dashboard');
      localStorage.setItem('currentView', 'dashboard');
    } else {
      setView('jobs');
      localStorage.setItem('currentView', 'jobs');
    }
  };

  const handleJobApply = (job) => {
    setSelectedJob(job);
    setView('apply');
    localStorage.setItem('currentView', 'apply');
  };

  const handleLogout = () => {
    setAdminToken(null);
    setUserToken(null);
    setCurrentUser(null);
    setView('jobs');
    
    // Clear localStorage
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentView');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Career Portal</h1>
        <nav className="nav">
          <button 
            onClick={() => setView('jobs')}
            className={view === 'jobs' ? 'active' : ''}
          >
            Jobs
          </button>
          
          {!userToken && !adminToken && (
            <>
              <button 
                onClick={() => setView('login')}
                className={view === 'login' ? 'active' : ''}
              >
                Login
              </button>
              <button 
                onClick={() => setView('register')}
                className={view === 'register' ? 'active' : ''}
              >
                Register
              </button>
            </>
          )}
          
          {(userToken || adminToken) && (
            <>
              <span className="user-info">Welcome, {currentUser?.full_name}</span>
              {currentUser?.role === 'admin' && (
                <button 
                  onClick={() => setView('dashboard')}
                  className={view === 'dashboard' ? 'active' : ''}
                >
                  Dashboard
                </button>
              )}
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </nav>
      </header>
      
      <main className="App-main">
        {view === 'jobs' && <JobList userToken={userToken} onApply={handleJobApply} onLogin={() => setView('login')} />}
        {view === 'apply' && <ApplicationForm job={selectedJob} userToken={userToken} />}
        {view === 'register' && <UserRegister onSwitchToLogin={() => setView('login')} />}
        {view === 'login' && <UserLogin onLogin={handleUserLogin} onSwitchToRegister={() => setView('register')} />}
        {view === 'dashboard' && adminToken && <AdminDashboard token={adminToken} />}
      </main>
    </div>
  );
}

export default App;
