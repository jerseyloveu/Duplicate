// ScopeDashboard.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faChartLine } from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeDashboard.css';

function ScopeDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activityData, setActivityData] = useState({
    activityStatus: 'Loading...',
    loginAttempts: 0,
    lastLogin: null,
    lastLogout: null
  });

  // Effect to check if user is logged in
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userEmail) {
      navigate('/scope-login');
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch activity data
        const activityResponse = await fetch(`http://localhost:5000/api/enrollee-applicants/activity/${userEmail}`);
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setActivityData(activityData);
        }
        
        setLoading(false);
        setUserData({
          email: userEmail,
          firstName: localStorage.getItem('firstName') || 'User',
          studentID: localStorage.getItem('studentID') || 'N/A'
        });
      } catch (err) {
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        navigate('/scope-login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/enrollee-applicants/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (response.ok) {
        // Clear local storage
        localStorage.removeItem('userEmail');
        localStorage.removeItem('firstName');
        localStorage.removeItem('studentID');
        
        // Redirect to login
        navigate('/scope-login');
      } else {
        setError('Failed to logout. Please try again.');
      }
    } catch (err) {
      setError('Error during logout process');
    }
  };

  return (
    <div className="scope-dashboard-container">
      {/* Header */}
      <header className="scope-dashboard-header">
        <div className="scope-dashboard-logo">
          <img src={SJDEFILogo} alt="SJDEFI Logo" />
          <h1>JUAN SCOPE</h1>
        </div>
        <div className="scope-dashboard-user">
          <span>
            <FontAwesomeIcon icon={faUser} /> {userData.firstName} ({userData.studentID})
          </span>
          <button 
            className="scope-dashboard-logout-btn"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="scope-dashboard-main">
        {loading ? (
          <div className="scope-dashboard-loading">Loading...</div>
        ) : error ? (
          <div className="scope-dashboard-error">{error}</div>
        ) : (
          <>
            <div className="scope-dashboard-welcome">
              <h2>Welcome, {userData.firstName}!</h2>
              <p>Student ID: {userData.studentID}</p>
            </div>

            {/* Activity Tracking Section */}
            <div className="scope-dashboard-activity-tracker">
              <h3>
                <FontAwesomeIcon icon={faChartLine} /> Activity Tracking
              </h3>
              <div className="scope-dashboard-activity-stats">
                <div className="scope-dashboard-stat-item">
                  <span className="scope-dashboard-stat-label">Current Status:</span>
                  <span className={`scope-dashboard-status-badge ${activityData.activityStatus === 'Online' ? 'online' : 'offline'}`}>
                    {activityData.activityStatus}
                  </span>
                </div>
                <div className="scope-dashboard-stat-item">
                  <span className="scope-dashboard-stat-label">Login Attempts:</span>
                  <span className="scope-dashboard-stat-value">{activityData.loginAttempts}</span>
                </div>
                <div className="scope-dashboard-stat-item">
                  <span className="scope-dashboard-stat-label">Last Login:</span>
                  <span className="scope-dashboard-stat-value">{formatDate(activityData.lastLogin)}</span>
                </div>
                <div className="scope-dashboard-stat-item">
                  <span className="scope-dashboard-stat-label">Last Logout:</span>
                  <span className="scope-dashboard-stat-value">{formatDate(activityData.lastLogout)}</span>
                </div>
              </div>
            </div>

            {/* You can add more dashboard content here */}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="scope-dashboard-footer">
        <p>&copy; 2025 San Juan De Dios Educational Foundation Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ScopeDashboard;