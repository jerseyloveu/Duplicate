import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faBell,
  faCompass,
  faSignOut,
  faCalendarAlt,
  faFileAlt,
  faClipboardCheck,
  faBook,
  faFileSignature,
  faMoneyBillWave,
  faChartBar,
  faCheckCircle,
  faClipboardList,
  faTicketAlt,
  faUserGraduate,
  faCalculator,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import dashboardBg from '../../images/dashboard background.png';
import '../../css/JuanScope/ScopeDashboard.css';

function ScopeDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    } finally {
      setShowLogoutModal(false);
    }
  };

  const handleAnnouncements = () => {
    navigate('/announcements');
  };

  const navigateToPage = (path) => {
    navigate(path);
    // Close sidebar if it's open when navigating
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
        <div className="hamburger-menu">
          <button 
            className="hamburger-button" 
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
          >
            <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} size="lg" />
          </button>
        </div>
      </header>

      <div className="scope-dashboard-content">
        {/* Side Navigation */}
        <aside className={`scope-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="scope-sidebar-content">
            <div className="scope-user-profile">
              <div className="scope-user-icon">
                <FontAwesomeIcon icon={faUser} size="2x" />
              </div>
              <div className="scope-user-details">
                <div className="scope-user-email">
                  {formatEmail(userData.email)}
                </div>
                <div className="scope-user-role">Applicant</div>
              </div>
              <div className="scope-divider"></div>
            </div>

            <button 
              className="enrollment-process-button"
              onClick={() => navigateToPage('/scope-dashboard')}
            >
              <FontAwesomeIcon icon={faCompass} className="enrollment-icon" />
              <span className="enrollment-text">Enrollment Process</span>
            </button>

            {/* Admission Process Section */}
            <div className="scope-nav-section">
              <div className="scope-nav-title">Admission Process</div>
              <button 
                className="scope-nav-button" 
                onClick={() => navigateToPage('/scope-registration')}
              >
                <FontAwesomeIcon icon={faFileAlt} />
                <span>1. Registration</span>
              </button>
              <button 
                className="scope-nav-button disabled-nav-item"
                disabled
              >
                <FontAwesomeIcon icon={faClipboardCheck} />
                <span>2. Exam & Interview Application</span>
              </button>
              <button 
                className="scope-nav-button disabled-nav-item"
                disabled
              >
                <FontAwesomeIcon icon={faBook} />
                <span>3. Admission Requirements</span>
              </button>
              <button 
                className="scope-nav-button disabled-nav-item"
                disabled
              >
                <FontAwesomeIcon icon={faFileSignature} />
                <span>4. Admission Exam Details</span>
              </button>
              <button 
                className="scope-nav-button disabled-nav-item"
                disabled
              >
                <FontAwesomeIcon icon={faMoneyBillWave} />
                <span>5. Exam Fee Payment</span>
              </button>
              <button 
                className="scope-nav-button disabled-nav-item"
                disabled
              >
                <FontAwesomeIcon icon={faChartBar} />
                <span>6. Exam & Interview Result</span>
              </button>
              <button 
                className="scope-nav-button disabled-nav-item"
                disabled
              >
                <FontAwesomeIcon icon={faMoneyBillWave} />
                <span>7. Reservation Payment</span>
              </button>
            </div>

            {/* Enrollment Process Section */}
            <div className="scope-nav-section">
              <div className="scope-nav-title">Enrollment Process</div>
              <button 
                className="scope-nav-button disabled-nav-item"
                disabled
              >
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>8. Admission Approval</span>
              </button>
              <button 
                className="scope-nav-button disabled-nav-item"
                disabled
              >
                <FontAwesomeIcon icon={faClipboardList} />
                <span>9. Enrollment Requirements</span>
              </button>
              <button 
                className="scope-nav-button disabled-nav-item"
                disabled
              >
                <FontAwesomeIcon icon={faTicketAlt} />
                <span>10. Voucher Application</span>
              </button>
              <button 
                className="scope-nav-button disabled-nav-item"
                disabled
              >
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>11. Enrollment Approval</span>
              </button>
              <button 
                className="scope-nav-button disabled-nav-item"
                disabled
              >
                <FontAwesomeIcon icon={faUserGraduate} />
                <span>12. Student Assessment</span>
              </button>
              <button 
                className="scope-nav-button disabled-nav-item"
                disabled
              >
                <FontAwesomeIcon icon={faMoneyBillWave} />
                <span>13. Tuition Payment</span>
              </button>
              <button 
                className="scope-nav-button disabled-nav-item"
                disabled
              >
                <FontAwesomeIcon icon={faCalculator} />
                <span>14. Officially Enrolled</span>
              </button>
            </div>

            <button
              className="scope-nav-button scope-logout-button"
              onClick={() => setShowLogoutModal(true)}
            >
              <FontAwesomeIcon icon={faSignOut} />
              <span className="nav-text-bold">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="scope-main-content">
          {loading ? (
            <div className="scope-loading">Loading...</div>
          ) : error ? (
            <div className="scope-error">{error}</div>
          ) : (
            <div className="dashboard-background-container">
              <div className="dashboard-content">
                {/* Top Bar with Date/Time and Bell Icon */}
                <div className="scope-top-section">
                  <div className="scope-date-time-container">
                    <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
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
                  </div>
                  <button
                    className="scope-announcement-button"
                    onClick={handleAnnouncements}
                  >
                    <FontAwesomeIcon icon={faBell} />
                  </button>
                </div>

                {/* User Info Row - Welcome on Left, Applicant ID on Right */}
                <div className="user-info-row">
                  {/* Welcome Section */}
                  <div className="scope-welcome-section">
                    <h1 className="welcome-heading">
                      Good day, {userData.firstName}
                      {userData.middleName && ` ${userData.middleName}`}
                      {` ${userData.lastName}`}
                    </h1>
                    <p className="scope-welcome-message">Start your application today!</p>
                  </div>

                  {/* Applicant Info Card */}
                  <div className="scope-applicant-info">
                    <div className="scope-applicant-icon">
                      <FontAwesomeIcon icon={faUser} size="2x" />
                    </div>
                    <div className="scope-id-container">
                      <div className="scope-applicant-id">{userData.applicantID}</div>
                      <div className="scope-applicant-label">Applicant Number</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="scope-modal-overlay">
          <div className="scope-confirm-modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="scope-modal-buttons">
              <button
                className="scope-modal-cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="scope-modal-confirm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScopeDashboard;