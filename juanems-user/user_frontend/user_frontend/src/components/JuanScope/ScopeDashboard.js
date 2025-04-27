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

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const createdAt = localStorage.getItem('createdAt');

    if (!userEmail) {
      navigate('/scope-login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);

        // ⬇️ ADD DATE VALIDATION HERE, BEFORE MAKING API REQUESTS ⬇️
        const createdAtDate = new Date(createdAt);
        if (isNaN(createdAtDate.getTime())) {
          console.error("Invalid date stored in localStorage");
          handleLogout();
          navigate('/scope-login', { state: { accountInactive: true } });
          return;
        }

        // First verify we're using the most recent active account
        const verificationResponse = await fetch(
          `http://localhost:5000/api/enrollee-applicants/verification-status/${userEmail}`
        );

        if (!verificationResponse.ok) {
          throw new Error('Failed to verify account status');
        }

        const verificationData = await verificationResponse.json();

        // ⬇️ ADD CONSOLE LOGS HERE ⬇️
        console.log("Stored timestamp:", createdAt);
        console.log("Server timestamp:", verificationData.createdAt);

        // Check if the stored account is still the most recent active one
        if (verificationData.status !== 'Active' ||
          (createdAt && Math.abs(new Date(verificationData.createdAt).getTime() - new Date(createdAt).getTime()) > 1000)) {
          // If it's not the same account, log out
          handleLogout();
          navigate('/scope-login', { state: { accountInactive: true } });
          return;
        }
        // Fetch activity data with the creation timestamp parameter to ensure we get the right account
        const activityResponse = await fetch(
          `http://localhost:5000/api/enrollee-applicants/activity/${userEmail}?createdAt=${encodeURIComponent(createdAt)}`
        );

        if (!activityResponse.ok) {
          throw new Error('Failed to fetch activity data');
        }

        const activityData = await activityResponse.json();

        setActivityData({
          activityStatus: activityData.activityStatus || 'Offline',
          loginAttempts: activityData.loginAttempts || 0,
          lastLogin: activityData.lastLogin || null,
          lastLogout: activityData.lastLogout || null
        });

        setUserData({
          email: userEmail,
          firstName: localStorage.getItem('firstName') || 'User',
          studentID: localStorage.getItem('studentID') || 'N/A'
        });

        setLoading(false);

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load user data. Please try again.');
        setLoading(false);
      }
    };

    fetchUserData();

    // Set up periodic refresh
    const refreshInterval = setInterval(fetchUserData, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [navigate]);

  // Monitor account status periodically
  useEffect(() => {
    const checkAccountStatus = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        const createdAt = localStorage.getItem('createdAt');

        if (!userEmail || !createdAt) return;

        const response = await fetch(
          `http://localhost:5000/api/enrollee-applicants/verification-status/${userEmail}`
        );

        if (!response.ok) {
          throw new Error('Failed to verify account status');
        }

        const data = await response.json();

        // Verify this is still the most recent active account
        if (data.status !== 'Active' ||
          new Date(data.createdAt).getTime() !== new Date(createdAt).getTime()) {
          handleLogout();
          navigate('/scope-login', { state: { accountInactive: true } });
        }
      } catch (err) {
        console.error('Error checking account status:', err);
      }
    };

    // Check periodically (every minute)
    const interval = setInterval(checkAccountStatus, 60 * 1000);
    checkAccountStatus(); // Run immediately

    return () => clearInterval(interval);
  }, [navigate]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleLogout = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const createdAt = localStorage.getItem('createdAt');

      if (!userEmail) {
        navigate('/scope-login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/enrollee-applicants/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          createdAt: createdAt // Pass the ISO string directly
        }),
      });

      if (response.ok) {
        // Clear local storage
        localStorage.removeItem('userEmail');
        localStorage.removeItem('firstName');
        localStorage.removeItem('studentID');
        localStorage.removeItem('lastLogin');
        localStorage.removeItem('lastLogout');
        localStorage.removeItem('createdAt');
        localStorage.removeItem('activityStatus');
        localStorage.removeItem('loginAttempts');

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