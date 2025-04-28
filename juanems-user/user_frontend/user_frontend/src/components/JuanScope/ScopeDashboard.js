// ScopeDashboard.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faBell,
  faCompass,
  faSignOut
} from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeDashboard.css';

function ScopeDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const createdAt = localStorage.getItem('createdAt');
    const firstName = localStorage.getItem('firstName');
    const middleName = localStorage.getItem('middleName');
    const lastName = localStorage.getItem('lastName');
    const applicantID = localStorage.getItem('applicantID');

    if (!userEmail) {
      navigate('/scope-login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);

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

        // Check if the stored account is still the most recent active one
        if (verificationData.status !== 'Active' ||
          (createdAt && Math.abs(new Date(verificationData.createdAt).getTime() - new Date(createdAt).getTime()) > 1000)) {
          handleLogout();
          navigate('/scope-login', { state: { accountInactive: true } });
          return;
        }

        // Fetch user data including applicantID
        const userResponse = await fetch(
          `http://localhost:5000/api/enrollee-applicants/activity/${userEmail}?createdAt=${encodeURIComponent(createdAt)}`
        );

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();

        // Update localStorage with all user data if not already set
        if (userData.applicantID && !localStorage.getItem('applicantID')) {
          localStorage.setItem('applicantID', userData.applicantID);
        }
        if (userData.firstName && !localStorage.getItem('firstName')) {
          localStorage.setItem('firstName', userData.firstName);
        }
        if (userData.lastName && !localStorage.getItem('lastName')) {
          localStorage.setItem('lastName', userData.lastName);
        }

        setUserData({
          email: userEmail,
          firstName: localStorage.getItem('firstName') || userData.firstName || 'User',
          middleName: localStorage.getItem('middleName') || '',
          lastName: localStorage.getItem('lastName') || userData.lastName || '',
          studentID: localStorage.getItem('studentID') || userData.studentID || 'N/A',
          applicantID: localStorage.getItem('applicantID') || userData.applicantID || 'N/A',
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

        if (data.status !== 'Active' ||
          new Date(data.createdAt).getTime() !== new Date(createdAt).getTime()) {
          handleLogout();
          navigate('/scope-login', { state: { accountInactive: true } });
        }
      } catch (err) {
        console.error('Error checking account status:', err);
      }
    };

    const interval = setInterval(checkAccountStatus, 60 * 1000);
    checkAccountStatus();
    return () => clearInterval(interval);
  }, [navigate]);

  const formatEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;
    const maskedName = name.length > 2
      ? `${name.substring(0, 2)}${'*'.repeat(name.length - 2)}`
      : '***';
    return `${maskedName}@${domain}`;
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
          createdAt: createdAt
        }),
      });

      if (response.ok) {
        localStorage.clear();
        navigate('/scope-login');
      } else {
        setError('Failed to logout. Please try again.');
      }
    } catch (err) {
      setError('Error during logout process');
    }
  };

  const handleAnnouncements = () => {
    navigate('/announcements');
  };

  return (
    <div className="scope-dashboard-container">
      {/* Header */}
      <header className="juan-register-header">
        <div className="juan-header-left">
          <img
            src={SJDEFILogo}
            alt="SJDEFI Logo"
            className="juan-logo-register"
          />
          <div className="juan-header-text">
            <h1>JUAN SCOPE</h1>
          </div>
        </div>
      </header>


      <div className="scope-dashboard-content">
        {/* Side Navigation */}
        <aside className="scope-sidebar">
          <div className="scope-user-profile">
            <div className="scope-user-icon">
              <FontAwesomeIcon icon={faUser} size="2x" />
            </div>
            <div className="scope-user-email">
              {formatEmail(userData.email)}
            </div>
            <div className="scope-user-role">Applicant</div>
            <div className="scope-divider"></div>
          </div>

          <button className="scope-nav-button">
            <FontAwesomeIcon icon={faCompass} />
            <span>Enrollment Process</span>
          </button>

          <button
            className="scope-nav-button scope-logout-button"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faSignOut} />
            <span>Logout</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="scope-main-content">
          {loading ? (
            <div className="scope-loading">Loading...</div>
          ) : error ? (
            <div className="scope-error">{error}</div>
          ) : (
            <>
              {/* Top Bar with Date/Time and Bell Icon */}
              <div className="scope-top-bar">
                <div className="scope-date-time">
                  {currentDateTime.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  {', '}
                  {currentDateTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <button
                  className="scope-announcement-button"
                  onClick={handleAnnouncements}
                >
                  <FontAwesomeIcon icon={faBell} />
                </button>
              </div>

              {/* Welcome Section */}
              <div className="scope-welcome-section">
                <h1>
                  Good day, {userData.firstName}
                  {userData.middleName && ` ${userData.middleName}`}
                  {` ${userData.lastName}`}
                </h1>
                <p className="scope-welcome-message">Start your application today!</p>
              </div>

              {/* Applicant Info Card */}
              <div className="scope-applicant-card">
                <div className="scope-applicant-icon">
                  <FontAwesomeIcon icon={faUser} size="3x" />
                </div>
                <div className="scope-applicant-info">
                  <div className="scope-applicant-id">{userData.applicantID}</div>
                  <div className="scope-applicant-label">Applicant Number</div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default ScopeDashboard;