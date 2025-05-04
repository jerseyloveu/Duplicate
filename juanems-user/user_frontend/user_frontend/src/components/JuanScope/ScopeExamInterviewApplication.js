import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faBars, faTimes, faArrowLeft, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeRegistration1.css';
import SideNavigation from './SideNavigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function ScopeExamInterviewApplication() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [registrationStatus, setRegistrationStatus] = useState('Incomplete');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [nextLocation, setNextLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [errors, setErrors] = useState({});
  const [availableDates, setAvailableDates] = useState([]);
  const [showDateConfirmModal, setShowDateConfirmModal] = useState(false);
  const [isDateSaved, setIsDateSaved] = useState(false);

  // Update current date and time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch user data, verify session, and fetch available exam dates
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const createdAt = localStorage.getItem('createdAt');

    if (!userEmail) {
      navigate('/scope-login');
      return;
    }

    const fetchData = async () => {
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

        const applicantResponse = await fetch(
          `http://localhost:5000/api/enrollee-applicants/personal-details/${userEmail}`
        );
        if (!applicantResponse.ok) {
          throw new Error('Failed to fetch applicant details');
        }
        const applicantData = await applicantResponse.json();

        localStorage.setItem('applicantID', applicantData.applicantID || userData.applicantID);
        localStorage.setItem('firstName', applicantData.firstName || userData.firstName);
        localStorage.setItem('middleName', applicantData.middleName || '');
        localStorage.setItem('lastName', applicantData.lastName || userData.lastName);
        localStorage.setItem('dob', applicantData.dob ? new Date(applicantData.dob).toISOString().split('T')[0] : '');
        localStorage.setItem('nationality', applicantData.nationality || '');

        setUserData({
          email: userEmail,
          firstName: applicantData.firstName || userData.firstName || 'User',
          middleName: applicantData.middleName || '',
          lastName: applicantData.lastName || userData.lastName || '',
          dob: applicantData.dob ? new Date(applicantData.dob).toISOString().split('T')[0] : '',
          nationality: applicantData.nationality || '',
          studentID: applicantData.studentID || userData.studentID || 'N/A',
          applicantID: applicantData.applicantID || userData.applicantID || 'N/A',
        });

        setRegistrationStatus(applicantData.registrationStatus || 'Incomplete');

        if (applicantData.registrationStatus !== 'Complete') {
          navigate('/scope-registration-6');
          return;
        }

        // Fetch previously selected exam date and status
        const examResponse = await fetch(
          `http://localhost:5000/api/enrollee-applicants/exam-interview/${userEmail}`
        );
        if (examResponse.ok) {
          const examData = await examResponse.json();
          if (examData.selectedDate) {
            setSelectedDate(new Date(examData.selectedDate));
            setIsDateSaved(examData.preferredExamAndInterviewApplicationStatus === 'Complete');
          }
        }

        // Fetch available exam dates
        const datesResponse = await fetch('http://localhost:5000/api/dropdown/exam-dates');
        if (!datesResponse.ok) {
          throw new Error('Failed to fetch available exam dates');
        }
        const datesData = await datesResponse.json();
        const parsedDates = datesData.map(item => new Date(item.date));
        setAvailableDates(parsedDates);

        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load user data or exam dates. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
    const refreshInterval = setInterval(fetchData, 5 * 60 * 1000);
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

  const handleDateChange = (date) => {
    if (!isDateSaved) {
      setSelectedDate(date);
      setIsFormDirty(true);
      setErrors((prev) => ({ ...prev, selectedDate: null }));
      setShowDateConfirmModal(true);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedDate) {
      newErrors.selectedDate = 'Selected Date is required';
    } else if (!availableDates.some(d => 
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    )) {
      newErrors.selectedDate = 'Selected date is not available';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmDate = () => {
    setShowDateConfirmModal(false);
    setIsFormDirty(true);
  };

  const handleCancelDate = () => {
    setSelectedDate(null);
    setShowDateConfirmModal(false);
    setIsFormDirty(false);
    setErrors((prev) => ({ ...prev, selectedDate: null }));
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setError('User email not found. Please log in again.');
        navigate('/scope-login');
        return;
      }

      const response = await fetch(
        'http://localhost:5000/api/enrollee-applicants/save-exam-interview',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            selectedDate: selectedDate.toISOString(),
            preferredExamAndInterviewApplicationStatus: 'Complete',
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIsFormDirty(false);
        setIsDateSaved(true);
        alert(data.message || 'Exam and Interview date saved successfully.');
        navigate('/scope-exam-interview-result');
      } else {
        setError(data.error || 'Failed to save exam and interview date.');
      }
    } catch (err) {
      console.error('Error saving exam and interview date:', err);
      setError('An error occurred while saving the exam and interview date. Please try again.');
    }
  };

  const handleBack = () => {
    if (isFormDirty) {
      setNextLocation('/scope-registration-6');
      setShowUnsavedModal(true);
    } else {
      navigate('/scope-registration-6');
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

  const handleModalCancel = () => {
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
          registrationStatus={registrationStatus}
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
              <h2 className="registration-title">Exam & Interview Application</h2>
              <div className="registration-divider"></div>
              <div className="registration-container">
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '1.5rem' }}>
                  Select your preferred available date for the exam and interview. Once confirmed, you'll be notified of the scheduled date and time in the Exam & Interview Result.
                </div>
                {isDateSaved && (
                  <div style={{ margin: '1rem 0', color: '#333', fontSize: '14px', backgroundColor: '#e0f7fa', padding: '1rem', borderRadius: '5px' }}>
                    <p>
                      Your exam and interview date has been saved and cannot be changed. Please proceed to view the{' '}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/scope-admission-requirements');
                        }}
                        style={{ color: '#007BFF', textDecoration: 'underline' }}
                      >
                        Admission Requirements
                      </a>.
                    </p>
                  </div>
                )}
                <div className="personal-info-section">
                  <div className="personal-info-header">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      style={{ color: '#212121' }}
                    />
                    <h3>Preferred Exam and Interview Date</h3>
                  </div>
                  <div className="personal-info-divider"></div>
                  <div className="reminder-box">
                    <p>
                      <strong>Reminder:</strong> Please select an available date. Fields marked with asterisk (<span className="required-asterisk">*</span>) are required. Once saved, the date cannot be changed.
                    </p>
                  </div>
                  <form>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="selectedDate">
                          Selected Date:<span className="required-asterisk">*</span>
                        </label>
                        <input
                          type="text"
                          id="selectedDate"
                          name="selectedDate"
                          value={selectedDate ? selectedDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }) : ''}
                          readOnly
                          className="disabled-input"
                        />
                        {errors.selectedDate && (
                          <span className="error-message">
                            <FontAwesomeIcon icon={faCalendarAlt} /> {errors.selectedDate}
                          </span>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Calendar:</label>
                        <div className="modern-datepicker-wrapper">
                          <ModernDatePickerAdapter 
                            selectedDate={selectedDate}
                            onDateChange={handleDateChange}
                            availableDates={availableDates}
                            disabled={isDateSaved}
                          />
                        </div>
                      </div>
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
                        className="next-button"
                        onClick={handleNext}
                        disabled={isDateSaved}
                        style={{
                          backgroundColor: isDateSaved ? '#d3d3d3' : '#34A853',
                          cursor: isDateSaved ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </form>
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
                onClick={handleModalCancel}
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
      {showDateConfirmModal && (
        <div className="scope-modal-overlay">
          <div className="scope-confirm-modal">
            <h3>Confirm Date Selection</h3>
            <p>
              You have selected{' '}
              <strong>
                {selectedDate?.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </strong>
              . This date cannot be changed once saved. Are you sure?
            </p>
            <div className="scope-modal-buttons">
              <button
                className="scope-modal-cancel"
                onClick={handleCancelDate}
              >
                Cancel
              </button>
              <button
                className="scope-modal-confirm"
                onClick={handleConfirmDate}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModernDatePickerAdapter({ selectedDate, onDateChange, availableDates, disabled }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [dateError, setDateError] = useState(null);

  const handleDateSelection = (date) => {
    if (disabled) return;

    if (date < today) {
      setDateError('The selected date has already passed. Please choose another available date.');
      return;
    }
    
    const isAvailable = availableDates.some(d => 
      d.getDate() === date.getDate() &&
      d.getMonth() === date.getMonth() &&
      d.getFullYear() === date.getFullYear()
    );
    
    if (!isAvailable) {
      setDateError('Selected date is not available. Please choose from the available dates.');
      return;
    }
    
    setDateError(null);
    onDateChange(date);
  };

  return (
    <div className="modern-datepicker">
      {dateError && (
        <div className="date-error-message">
          <FontAwesomeIcon icon={faExclamationCircle} />
          {dateError}
        </div>
      )}
      <DatePicker
        selected={selectedDate}
        onChange={handleDateSelection}
        minDate={today}
        maxDate={availableDates.length > 0 
          ? new Date(Math.max(...availableDates))
          : new Date(new Date().setMonth(new Date().getMonth() + 3))}
        includeDates={availableDates}
        inline
        calendarClassName="modern-calendar"
        disabled={disabled}
        dayClassName={(date) => {
          const isAvailable = availableDates.some(
            (d) => d.getDate() === date.getDate() &&
                   d.getMonth() === date.getMonth() &&
                   d.getFullYear() === date.getFullYear()
          );
          const isSelected = selectedDate &&
                            date.getDate() === selectedDate.getDate() &&
                            date.getMonth() === selectedDate.getMonth() &&
                            date.getFullYear() === selectedDate.getFullYear();
          const isPast = date < today;
          
          return isSelected ? 'selected-date' :
                 isAvailable ? 'available-date' :
                 isPast ? 'passed-date' :
                 'unavailable-date';
        }}
      />
    </div>
  );
}

export default ScopeExamInterviewApplication;