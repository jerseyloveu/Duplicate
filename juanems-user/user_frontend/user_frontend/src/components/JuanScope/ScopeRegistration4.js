import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faExclamationCircle, faArrowLeft, faTimes, faBars, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeRegistration1.css';
import SideNavigation from './SideNavigation';

function ScopeRegistration4() {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    elementarySchoolName: '',
    elementaryLastYearAttended: '',
    elementaryGeneralAverage: '',
    elementaryRemarks: '',
    juniorHighSchoolName: '',
    juniorHighLastYearAttended: '',
    juniorHighGeneralAverage: '',
    juniorHighRemarks: '',
  });
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [nextLocation, setNextLocation] = useState(null);
  const [isElementaryOpen, setIsElementaryOpen] = useState(true);
  const [isJuniorHighOpen, setIsJuniorHighOpen] = useState(true);

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

  const handleNext = () => {
    if (isFormDirty) {
      setNextLocation('/scope-registration-5');
      setShowUnsavedModal(true);
    } else {
      navigate('/scope-registration-5');
    }
  };

  const handleBack = () => {
    if (isFormDirty) {
      setNextLocation('/scope-registration-3');
      setShowUnsavedModal(true);
    } else {
      navigate('/scope-registration-3');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleElementary = () => {
    setIsElementaryOpen(!isElementaryOpen);
  };

  const toggleJuniorHigh = () => {
    setIsJuniorHighOpen(!isJuniorHighOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // Sanitize text fields
    if (['elementarySchoolName', 'juniorHighSchoolName'].includes(name)) {
      sanitizedValue = value.slice(0, 100);
    } else if (['elementaryLastYearAttended', 'juniorHighLastYearAttended'].includes(name)) {
      sanitizedValue = value.replace(/[^0-9-]/g, '');
      const match = sanitizedValue.match(/^(\d{0,4})-?(\d{0,4})$/);
      if (match) {
        const startYear = match[1];
        const endYear = match[2];
        if (startYear && endYear) {
          sanitizedValue = `${startYear}-${endYear}`;
        } else {
          sanitizedValue = value;
        }
      }
    } else if (['elementaryGeneralAverage', 'juniorHighGeneralAverage'].includes(name)) {
      sanitizedValue = value.replace(/[^0-9.]/g, '').slice(0, 5);
    } else if (['elementaryRemarks', 'juniorHighRemarks'].includes(name)) {
      sanitizedValue = value.slice(0, 250);
    }

    setFormData({
      ...formData,
      [name]: sanitizedValue,
    });

    setTouchedFields({
      ...touchedFields,
      [name]: true,
    });

    setIsFormDirty(true);
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'elementarySchoolName':
      case 'juniorHighSchoolName':
        if (!value) return 'School Name is required';
        if (value.length < 2) return 'School Name must be at least 2 characters';
        if (value.length > 100) return 'School Name cannot exceed 100 characters';
        return null;
      case 'elementaryLastYearAttended':
      case 'juniorHighLastYearAttended':
        if (!value) return 'Last Year Attended is required';
        if (!/^\d{4}-\d{4}$/.test(value)) return 'Format must be YYYY-YYYY';
        const [startYear, endYear] = value.split('-').map(Number);
        if (endYear !== startYear + 1) return 'End year must be one year after start year';
        if (startYear < 1900 || endYear > new Date().getFullYear() + 1)
          return 'Invalid year range';
        return null;
      case 'elementaryGeneralAverage':
      case 'juniorHighGeneralAverage':
        if (!value) return 'General Average is required';
        if (!/^\d{1,3}(\.\d{1,2})?$/.test(value))
          return 'Must be a valid number (e.g., 85 or 85.5)';
        const numValue = parseFloat(value);
        if (numValue < 0 || numValue > 100) return 'Must be between 0 and 100';
        return null;
      case 'elementaryRemarks':
      case 'juniorHighRemarks':
        if (value.length > 250) return 'Remarks cannot exceed 250 characters';
        return null;
      default:
        return null;
    }
  };

  // Real-time validation
  useEffect(() => {
    const newErrors = {};

    Object.keys(touchedFields).forEach((field) => {
      if (touchedFields[field]) {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      }
    });

    setErrors(newErrors);
  }, [formData, touchedFields]);

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'elementarySchoolName',
      'elementaryLastYearAttended',
      'elementaryGeneralAverage',
      'elementaryRemarks',
      'juniorHighSchoolName',
      'juniorHighLastYearAttended',
      'juniorHighGeneralAverage',
      'juniorHighRemarks',
    ];

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouchedFields(
      requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (validateForm()) {
      alert('Educational background saved successfully!');
      setIsFormDirty(false);
    }
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

  // Mock user data for SideNavigation
  const userData = {
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    email: 'user@example.com',
    studentID: 'N/A',
    applicantID: 'N/A',
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
          <div className="registration-content">
            <h2 className="registration-title">Registration</h2>
            <div className="registration-divider"></div>
            <div className="registration-container">
              <div className="step-indicator">
                <div className="step-circles">
                  <div
                    className="step-circle completed"
                    style={{ backgroundColor: '#34A853' }}
                  >
                    1
                  </div>
                  <div
                    className="step-line"
                    style={{ backgroundColor: '#34A853' }}
                  ></div>
                  <div
                    className="step-circle completed"
                    style={{ backgroundColor: '#34A853' }}
                  >
                    2
                  </div>
                  <div
                    className="step-line"
                    style={{ backgroundColor: '#34A853' }}
                  ></div>
                  <div
                    className="step-circle completed"
                    style={{ backgroundColor: '#34A853' }}
                  >
                    3
                  </div>
                  <div
                    className="step-line"
                    style={{ backgroundColor: '#34A853' }}
                  ></div>
                  <div
                    className="step-circle active"
                    style={{ backgroundColor: '#64676C' }}
                  >
                    4
                  </div>
                  <div
                    className="step-line"
                    style={{ backgroundColor: '#D8D8D8' }}
                  ></div>
                  <div
                    className="step-circle"
                    style={{ backgroundColor: '#D8D8D8' }}
                  >
                    5
                  </div>
                  <div
                    className="step-line"
                    style={{ backgroundColor: '#D8D8D8' }}
                  ></div>
                  <div
                    className="step-circle"
                    style={{ backgroundColor: '#D8D8D8' }}
                  >
                    6
                  </div>
                </div>
                <div className="step-text">Step 4 of 6</div>
              </div>
              <div className="personal-info-section">
                <div className="personal-info-header">
                  <FontAwesomeIcon
                    icon={faGraduationCap}
                    style={{ color: '#212121' }}
                  />
                  <h3>Educational Background</h3>
                </div>
                <div className="personal-info-divider"></div>
                <div className="reminder-box">
                  <p>
                    <strong>Reminder:</strong> Fields marked with asterisk
                    (<span className="required-asterisk">*</span>) are
                    required.
                  </p>
                </div>
                <form onSubmit={handleSave}>
                  <div className="form-section">
                    <div className="collapsible-container">
                      <div
                        className="section-title collapsible-header"
                        onClick={toggleElementary}
                        style={{
                          backgroundColor: '#CFE0FF',
                          border: '1px solid #2A67D5',
                          borderRadius: '5px',
                          padding: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <h4 style={{ color: '#2A67D5', fontWeight: 'bold', margin: 0 }}>
                          Elementary Education
                        </h4>
                        <FontAwesomeIcon
                          icon={isElementaryOpen ? faChevronUp : faChevronDown}
                          style={{ color: '#2A67D5' }}
                        />
                      </div>
                      {isElementaryOpen && (
                        <div className="collapsible-content">
                          <div className="form-group horizontal">
                            <label htmlFor="elementarySchoolName">
                              School Name:<span className="required-asterisk">*</span>
                            </label>
                            <div className="input-container">
                              <input
                                type="text"
                                id="elementarySchoolName"
                                name="elementarySchoolName"
                                value={formData.elementarySchoolName}
                                onChange={handleInputChange}
                                onBlur={() =>
                                  setTouchedFields({
                                    ...touchedFields,
                                    elementarySchoolName: true,
                                  })
                                }
                                className={errors.elementarySchoolName ? 'input-error' : ''}
                                placeholder="Enter School Name"
                                maxLength={100}
                              />
                              <div className={`character-count ${formData.elementarySchoolName.length > 95 ? 'warning' : ''}`}>
                                {formData.elementarySchoolName.length}/100
                              </div>
                              {errors.elementarySchoolName && (
                                <span className="error-message">
                                  <FontAwesomeIcon icon={faExclamationCircle} /> {errors.elementarySchoolName}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="form-group horizontal">
                            <label htmlFor="elementaryLastYearAttended">
                              Last Year Attended:<span className="required-asterisk">*</span>
                            </label>
                            <div className="input-container">
                              <input
                                type="text"
                                id="elementaryLastYearAttended"
                                name="elementaryLastYearAttended"
                                value={formData.elementaryLastYearAttended}
                                onChange={handleInputChange}
                                onBlur={() =>
                                  setTouchedFields({
                                    ...touchedFields,
                                    elementaryLastYearAttended: true,
                                  })
                                }
                                className={errors.elementaryLastYearAttended ? 'input-error' : ''}
                                placeholder="YYYY-YYYY"
                                maxLength={9}
                              />
                              {errors.elementaryLastYearAttended && (
                                <span className="error-message">
                                  <FontAwesomeIcon icon={faExclamationCircle} /> {errors.elementaryLastYearAttended}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="form-group horizontal">
                            <label htmlFor="elementaryGeneralAverage">
                              General Average:<span className="required-asterisk">*</span>
                            </label>
                            <div className="input-container">
                              <input
                                type="text"
                                id="elementaryGeneralAverage"
                                name="elementaryGeneralAverage"
                                value={formData.elementaryGeneralAverage}
                                onChange={handleInputChange}
                                onBlur={() =>
                                  setTouchedFields({
                                    ...touchedFields,
                                    elementaryGeneralAverage: true,
                                  })
                                }
                                className={errors.elementaryGeneralAverage ? 'input-error' : ''}
                                placeholder="Enter General Average"
                                maxLength={5}
                              />
                              {errors.elementaryGeneralAverage && (
                                <span className="error-message">
                                  <FontAwesomeIcon icon={faExclamationCircle} /> {errors.elementaryGeneralAverage}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="form-group horizontal">
                            <label htmlFor="elementaryRemarks">
                              Remarks:
                            </label>
                            <div className="input-container">
                              <textarea
                                id="elementaryRemarks"
                                name="elementaryRemarks"
                                value={formData.elementaryRemarks}
                                onChange={handleInputChange}
                                onBlur={() =>
                                  setTouchedFields({
                                    ...touchedFields,
                                    elementaryRemarks: true,
                                  })
                                }
                                className={errors.elementaryRemarks ? 'input-error' : ''}
                                placeholder="Enter Remarks (Optional)"
                                maxLength={250}
                              />
                              <div className={`character-count ${formData.elementaryRemarks.length > 245 ? 'warning' : ''}`}>
                                {formData.elementaryRemarks.length}/250
                              </div>
                              {errors.elementaryRemarks && (
                                <span className="error-message">
                                  <FontAwesomeIcon icon={faExclamationCircle} /> {errors.elementaryRemarks}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-section">
                    <div className="collapsible-container">
                      <div
                        className="section-title collapsible-header"
                        onClick={toggleJuniorHigh}
                        style={{
                          backgroundColor: '#CFE0FF',
                          border: '1px solid #2A67D5',
                          borderRadius: '5px',
                          padding: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <h4 style={{ color: '#2A67D5', fontWeight: 'bold', margin: 0 }}>
                          Junior High Education
                        </h4>
                        <FontAwesomeIcon
                          icon={isJuniorHighOpen ? faChevronUp : faChevronDown}
                          style={{ color: '#2A67D5' }}
                        />
                      </div>
                      {isJuniorHighOpen && (
                        <div className="collapsible-content">
                          <div className="form-group horizontal">
                            <label htmlFor="juniorHighSchoolName">
                              School Name:<span className="required-asterisk">*</span>
                            </label>
                            <div className="input-container">
                              <input
                                type="text"
                                id="juniorHighSchoolName"
                                name="juniorHighSchoolName"
                                value={formData.juniorHighSchoolName}
                                onChange={handleInputChange}
                                onBlur={() =>
                                  setTouchedFields({
                                    ...touchedFields,
                                    juniorHighSchoolName: true,
                                  })
                                }
                                className={errors.juniorHighSchoolName ? 'input-error' : ''}
                                placeholder="Enter School Name"
                                maxLength={100}
                              />
                              <div className={`character-count ${formData.juniorHighSchoolName.length > 95 ? 'warning' : ''}`}>
                                {formData.juniorHighSchoolName.length}/100
                              </div>
                              {errors.juniorHighSchoolName && (
                                <span className="error-message">
                                  <FontAwesomeIcon icon={faExclamationCircle} /> {errors.juniorHighSchoolName}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="form-group horizontal">
                            <label htmlFor="juniorHighLastYearAttended">
                              Last Year Attended:<span className="required-asterisk">*</span>
                            </label>
                            <div className="input-container">
                              <input
                                type="text"
                                id="juniorHighLastYearAttended"
                                name="juniorHighLastYearAttended"
                                value={formData.juniorHighLastYearAttended}
                                onChange={handleInputChange}
                                onBlur={() =>
                                  setTouchedFields({
                                    ...touchedFields,
                                    juniorHighLastYearAttended: true,
                                  })
                                }
                                className={errors.juniorHighLastYearAttended ? 'input-error' : ''}
                                placeholder="A.Y. YYYY-YYYY"
                                maxLength={9}
                              />
                              {errors.juniorHighLastYearAttended && (
                                <span className="error-message">
                                  <FontAwesomeIcon icon={faExclamationCircle} /> {errors.juniorHighLastYearAttended}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="form-group horizontal">
                            <label htmlFor="juniorHighGeneralAverage">
                              General Average:<span className="required-asterisk">*</span>
                            </label>
                            <div className="input-container">
                              <input
                                type="text"
                                id="juniorHighGeneralAverage"
                                name="juniorHighGeneralAverage"
                                value={formData.juniorHighGeneralAverage}
                                onChange={handleInputChange}
                                onBlur={() =>
                                  setTouchedFields({
                                    ...touchedFields,
                                    juniorHighGeneralAverage: true,
                                  })
                                }
                                className={errors.juniorHighGeneralAverage ? 'input-error' : ''}
                                placeholder="Enter General Average"
                                maxLength={5}
                              />
                              {errors.juniorHighGeneralAverage && (
                                <span className="error-message">
                                  <FontAwesomeIcon icon={faExclamationCircle} /> {errors.juniorHighGeneralAverage}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="form-group horizontal">
                            <label htmlFor="juniorHighRemarks">
                              Remarks:
                            </label>
                            <div className="input-container">
                              <textarea
                                id="juniorHighRemarks"
                                name="juniorHighRemarks"
                                value={formData.juniorHighRemarks}
                                onChange={handleInputChange}
                                onBlur={() =>
                                  setTouchedFields({
                                    ...touchedFields,
                                    juniorHighRemarks: true,
                                  })
                                }
                                className={errors.juniorHighRemarks ? 'input-error' : ''}
                                placeholder="Enter Remarks (Optional)"
                                maxLength={250}
                              />
                              <div className={`character-count ${formData.juniorHighRemarks.length > 245 ? 'warning' : ''}`}>
                                {formData.juniorHighRemarks.length}/250
                              </div>
                              {errors.juniorHighRemarks && (
                                <span className="error-message">
                                  <FontAwesomeIcon icon={faExclamationCircle} /> {errors.juniorHighRemarks}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-buttons" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <button
                      type="button"
                      className="back-button"
                      onClick={handleBack}
                      style={{
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '5px' }} />
                      Back
                    </button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="save-button">
                        Save
                      </button>
                      <button type="button" className="next-button" onClick={handleNext}>
                        Next
                      </button>
                    </div>
                  </div>
                </form>
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
    </div>
  );
}

export default ScopeRegistration4;