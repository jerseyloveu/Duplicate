import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTimes, faBars } from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeRegistration1.css';
import SideNavigation from './SideNavigation';
import RegistrationSummary from './RegistrationSummary';

function ScopeRegistration6() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [nextLocation, setNextLocation] = useState(null);
  const [formData, setFormData] = useState({});

  // Update current date and time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch user data and verify session
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

        const createdAtDate = new Date(createdAt);
        if (isNaN(createdAtDate.getTime())) {
          handleLogout();
          navigate('/scope-login', { state: { accountInactive: true } });
          return;
        }

        const verificationResponse = await fetch(
          `http://localhost:5000/api/enrollee-applicants/verification-status/${userEmail}`
        );

        if (!verificationResponse.ok) {
          throw new Error('Failed to verify account status');
        }

        const verificationData = await verificationResponse.json();

        if (
          verificationData.status !== 'Active' ||
          (createdAt &&
            Math.abs(
              new Date(verificationData.createdAt).getTime() -
                new Date(createdAt).getTime()
            ) > 1000)
        ) {
          handleLogout();
          navigate('/scope-login', { state: { accountInactive: true } });
          return;
        }

        const userResponse = await fetch(
          `http://localhost:5000/api/enrollee-applicants/activity/${userEmail}?createdAt=${encodeURIComponent(
            createdAt
          )}`
        );

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();

        // Update local storage
        localStorage.setItem('applicantID', userData.applicantID);
        localStorage.setItem('firstName', userData.firstName);
        localStorage.setItem('middleName', '');
        localStorage.setItem('lastName', userData.lastName);
        localStorage.setItem('dob', userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : '');
        localStorage.setItem('nationality', userData.nationality || '');

        setUserData({
          email: userEmail,
          firstName: userData.firstName || 'User',
          middleName: '',
          lastName: userData.lastName || '',
          dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : '',
          nationality: userData.nationality || '',
          studentID: userData.studentID || 'N/A',
          applicantID: userData.applicantID || 'N/A',
        });

        // Fetch all registration data
        const registrationData = localStorage.getItem('registrationData');
        const contacts = localStorage.getItem('familyContacts');
        let parsedRegistrationData, parsedContacts;
        try {
          parsedRegistrationData = registrationData ? JSON.parse(registrationData) : {};
          parsedContacts = contacts ? JSON.parse(contacts) : [];
        } catch (parseError) {
          console.error('Error parsing localStorage data:', parseError);
          setError('Invalid registration data. Please restart the registration process.');
          setLoading(false);
          return;
        }

        setFormData({
          ...parsedRegistrationData,
          contacts: Array.isArray(parsedContacts) ? parsedContacts : [],
        });

        setLoading(false);
      } catch (err) {
        console.error('Error loading registration data:', err);
        setError('Failed to load user data. Please try again.');
        setLoading(false);
      }
    };

    fetchUserData();
    const refreshInterval = setInterval(fetchUserData, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [navigate]);

  // Periodic account status check
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

        if (
          data.status !== 'Active' ||
          new Date(data.createdAt).getTime() !== new Date(createdAt).getTime()
        ) {
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

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFormDirty]);

  const handleLogout = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const createdAt = localStorage.getItem('createdAt');

      if (!userEmail) {
        navigate('/scope-login');
        return;
      }

      const response = await fetch(
        'http://localhost:5000/api/enrollee-applicants/logout',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            createdAt: createdAt,
          }),
        }
      );

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
    if (isFormDirty) {
      setNextLocation('/scope-announcements');
      setShowUnsavedModal(true);
    } else {
      navigate('/scope-announcements');
    }
  };

  const handleSaveAndProceed = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setError('User email not found. Please log in again.');
        navigate('/scope-login');
        return;
      }

      // Validate formData
      if (!formData || Object.keys(formData).length === 0) {
        setError('Registration data is missing. Please complete all previous steps.');
        return;
      }

      if (!Array.isArray(formData.contacts)) {
        setError('Family contacts data is invalid.');
        return;
      }

      // Send request to save registration data
      const response = await fetch('http://localhost:5000/api/enrollee-applicants/save-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsFormDirty(false);
        alert(data.message);
        navigate('/scope-exam-interview');
      } else {
        setError(data.error || 'Failed to save registration data.');
      }
    } catch (err) {
      console.error('Error saving registration data:', err);
      setError('An error occurred while saving the registration data. Please try again.');
    }
  };

  const handleBack = () => {
    if (isFormDirty) {
      setNextLocation('/scope-registration-5');
      setShowUnsavedModal(true);
    } else {
      navigate('/scope-registration-5');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleModalConfirm = () => {
    setShowUnsavedModal(false);
    if (nextLocation) {
      navigate(nextLocation);
    }
  };

  const handleModalCancelNavigation = () => {
    setShowUnsavedModal(false);
    setNextLocation(null);
  };

  return (
    <div className="scope-registration-container">
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
            <FontAwesomeIcon
              icon={sidebarOpen ? faTimes : faBars}
              size="lg"
            />
          </button>
        </div>
      </header>
      <div className="scope-registration-content">
        <SideNavigation
          userData={userData}
          onNavigate={closeSidebar}
          isOpen={sidebarOpen}
        />
        <main
          className={`scope-main-content ${sidebarOpen ? 'sidebar-open' : ''}`}
        >
          {loading ? (
            <div className="scope-loading">Loading...</div>
          ) : error ? (
            <div className="scope-error">{error}</div>
          ) : (
            <div className="registration-content">
              <h2 className="registration-title">Registration</h2>
              <div className="registration-divider"></div>
              <div className="registration-container">
                <div className="step-indicator">
                  <div className="step-circles">
                    <div className="step-circle completed">1</div>
                    <div className="step-line completed"></div>
                    <div className="step-circle completed">2</div>
                    <div className="step-line completed"></div>
                    <div className="step-circle completed">3</div>
                    <div className="step-line completed"></div>
                    <div className="step-circle completed">4</div>
                    <div className="step-line completed"></div>
                    <div className="step-circle completed">5</div>
                    <div className="step-line completed"></div>
                    <div className="step-circle active">6</div>
                  </div>
                  <div className="step-text">Step 6 of 6</div>
                </div>
                <div className="personal-info-section">
                  <div className="reminder-box" style={{ backgroundColor: '#34A853' }}>
                    <p>
                      <strong>Admission: Registration Completed!</strong>
                    </p>
                  </div>
                  <div style={{ margin: '1rem 0', fontSize: '14px', color: '#333', lineHeight: '1.5' }}>
                    <p>
                      Steps 1 to 6 for Admission: Registration are complete. You can now proceed to Admission: Exam & Interview Application. Make sure to double check first your Registration information as you won't be able to add, update, or delete initial information after saving and proceeding to the next step.
                    </p>
                  </div>
                  <RegistrationSummary formData={formData} />
                  <div className="form-buttons">
                    <button
                      type="button"
                      className="back-button"
                      onClick={handleBack}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                      Back
                    </button>
                    <button
                      type="button"
                      className="save-button"
                      onClick={handleSaveAndProceed}
                    >
                      Save and Proceed to Exam & Interview Application
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      {sidebarOpen && (
        <div
          className="sidebar-overlay active"
          onClick={toggleSidebar}
        ></div>
      )}
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
      {showUnsavedModal && (
        <div className="scope-modal-overlay">
          <div className="scope-confirm-modal">
            <h3>Unsaved Changes</h3>
            <p>You have unsaved changes. Do you want to leave without saving?</p>
            <div className="scope-modal-buttons">
              <button
                className="scope-modal-cancel"
                onClick={handleModalCancelNavigation}
              >
                Stay
              </button>
              <button
                className="scope-modal-confirm"
                onClick={handleModalConfirm}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScopeRegistration6;