import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTimes, faBars } from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeRegistration1.css';
import SessionManager from '../JuanScope/SessionManager';
import SideNavigation from './SideNavigation';

function ScopeRegistration6() {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [nextLocation, setNextLocation] = useState(null);

  // Mock user data for SideNavigation
  const userData = {
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    email: 'user@example.com',
    studentID: 'N/A',
    applicantID: 'N/A',
  };

  // Update current date and time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

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

  const handleLogout = () => {
    setShowLogoutModal(false);
    navigate('/scope-login');
  };

  const handleAnnouncements = () => {
    if (isFormDirty) {
      setNextLocation('/scope-announcements');
      setShowUnsavedModal(true);
    } else {
      navigate('/scope-announcements');
    }
  };

  const handleSaveAndProceed = () => {
    setIsFormDirty(false); // Reset dirty state as we're saving
    navigate('/scope-exam-interview'); // Placeholder route
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
    <SessionManager>
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
    </SessionManager>
  );
}

export default ScopeRegistration6;