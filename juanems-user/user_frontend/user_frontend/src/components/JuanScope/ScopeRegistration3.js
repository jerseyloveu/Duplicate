import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressCard, faExclamationCircle, faArrowLeft, faTimes, faBars } from '@fortawesome/free-solid-svg-icons';
import { FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeRegistration1.css';
import SideNavigation from './SideNavigation';

function ScopeRegistration3() {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    presentProvince: '',
    presentCity: '',
    presentHouseNo: '',
    presentBarangay: '',
    presentPostalCode: '',
    permanentProvince: '',
    permanentCity: '',
    permanentHouseNo: '',
    permanentBarangay: '',
    permanentPostalCode: '',
    mobileNo: '09123456789', // Placeholder for disabled field
    telephoneNo: '',
    emailAddress: 'user@example.com', // Placeholder for disabled field
  });
  const [sameAsPresent, setSameAsPresent] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [nextLocation, setNextLocation] = useState(null);

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
      setNextLocation('/scope-registration-4');
      setShowUnsavedModal(true);
    } else {
      navigate('/scope-registration-4');
    }
  };

  const handleBack = () => {
    if (isFormDirty) {
      setNextLocation('/scope-registration-2');
      setShowUnsavedModal(true);
    } else {
      navigate('/scope-registration-2');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // Sanitize text fields
    if (['presentProvince', 'presentCity', 'presentBarangay', 'permanentProvince', 'permanentCity', 'permanentBarangay'].includes(name)) {
      sanitizedValue = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
      sanitizedValue = sanitizedValue.charAt(0).toUpperCase() + sanitizedValue.slice(1);
    } else if (['presentHouseNo', 'permanentHouseNo'].includes(name)) {
      sanitizedValue = value.slice(0, 100);
    } else if (['presentPostalCode', 'permanentPostalCode'].includes(name)) {
      sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 4);
    } else if (name === 'telephoneNo') {
      sanitizedValue = value.replace(/[^0-9-]/g, '').slice(0, 12);
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

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setSameAsPresent(checked);
    if (checked) {
      setFormData({
        ...formData,
        permanentProvince: formData.presentProvince,
        permanentCity: formData.presentCity,
        permanentHouseNo: formData.presentHouseNo,
        permanentBarangay: formData.presentBarangay,
        permanentPostalCode: formData.presentPostalCode,
      });
      setTouchedFields({
        ...touchedFields,
        permanentProvince: true,
        permanentCity: true,
        permanentHouseNo: true,
        permanentBarangay: true,
        permanentPostalCode: true,
      });
    }
    setIsFormDirty(true);
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'presentProvince':
      case 'permanentProvince':
        if (!value) return 'Province is required';
        if (value.length < 2) return 'Province must be at least 2 characters';
        if (value.length > 50) return 'Province cannot exceed 50 characters';
        return null;
      case 'presentCity':
      case 'permanentCity':
        if (!value) return 'City/Municipality is required';
        if (value.length < 2) return 'City/Municipality must be at least 2 characters';
        if (value.length > 50) return 'City/Municipality cannot exceed 50 characters';
        return null;
      case 'presentHouseNo':
      case 'permanentHouseNo':
        if (!value) return 'House No. & Street is required';
        if (value.length > 100) return 'House No. & Street cannot exceed 100 characters';
        return null;
      case 'presentBarangay':
      case 'permanentBarangay':
        if (!value) return 'Barangay is required';
        if (value.length < 2) return 'Barangay must be at least 2 characters';
        if (value.length > 50) return 'Barangay cannot exceed 50 characters';
        return null;
      case 'presentPostalCode':
      case 'permanentPostalCode':
        if (!value) return 'Postal Code is required';
        if (!/^\d{4}$/.test(value)) return 'Postal Code must be exactly 4 digits';
        return null;
      case 'telephoneNo':
        if (value && !/^\d{7,12}$/.test(value.replace(/-/g, ''))) return 'Invalid Telephone No.';
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
      'presentProvince',
      'presentCity',
      'presentHouseNo',
      'presentBarangay',
      'presentPostalCode',
      'permanentProvince',
      'permanentCity',
      'permanentHouseNo',
      'permanentBarangay',
      'permanentPostalCode',
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
      alert('Contact details saved successfully!');
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
                    className="step-circle active"
                    style={{ backgroundColor: '#64676C' }}
                  >
                    3
                  </div>
                  <div
                    className="step-line"
                    style={{ backgroundColor: '#D8D8D8' }}
                  ></div>
                  <div
                    className="step-circle"
                    style={{ backgroundColor: '#D8D8D8' }}
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
                <div className="step-text">Step 3 of 6</div>
              </div>
              <div className="personal-info-section">
                <div className="personal-info-header">
                  <FontAwesomeIcon
                    icon={faAddressCard}
                    style={{ color: '#212121' }}
                  />
                  <h3>Contact Details</h3>
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
                    <div className="section-title" style={{ display: 'flex', alignItems: 'center' }}>
                      <FaMapMarkerAlt style={{ marginRight: '8px', color: '#212121' }} />
                      <h4>Present Address</h4>
                    </div>
                    <div className="personal-info-divider"></div>
                    <div className="form-address-container">
                      <div className="form-group full-width">
                        <label htmlFor="presentHouseNo">
                          House No. & Street:<span className="required-asterisk">*</span>
                        </label>
                        <input
                          type="text"
                          id="presentHouseNo"
                          name="presentHouseNo"
                          value={formData.presentHouseNo}
                          onChange={handleInputChange}
                          onBlur={() =>
                            setTouchedFields({
                              ...touchedFields,
                              presentHouseNo: true,
                            })
                          }
                          className={errors.presentHouseNo ? 'input-error' : ''}
                          placeholder="Enter House No. & Street"
                          maxLength={100}
                        />
                        <div className={`character-count ${formData.presentHouseNo.length > 95 ? 'warning' : ''}`}>
                          {formData.presentHouseNo.length}/100
                        </div>
                        {errors.presentHouseNo && (
                          <span className="error-message">
                            <FontAwesomeIcon icon={faExclamationCircle} /> {errors.presentHouseNo}
                          </span>
                        )}
                      </div>
                      <div className="form-grid address-grid">
                        <div className="form-group">
                          <label htmlFor="presentProvince">
                            Province:<span className="required-asterisk">*</span>
                          </label>
                          <input
                            type="text"
                            id="presentProvince"
                            name="presentProvince"
                            value={formData.presentProvince}
                            onChange={handleInputChange}
                            onBlur={() =>
                              setTouchedFields({
                                ...touchedFields,
                                presentProvince: true,
                              })
                            }
                            className={errors.presentProvince ? 'input-error' : ''}
                            placeholder="Enter Province"
                            maxLength={50}
                          />
                          <div className={`character-count ${formData.presentProvince.length > 45 ? 'warning' : ''}`}>
                            {formData.presentProvince.length}/50
                          </div>
                          {errors.presentProvince && (
                            <span className="error-message">
                              <FontAwesomeIcon icon={faExclamationCircle} /> {errors.presentProvince}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor="presentCity">
                            City/Municipality:<span className="required-asterisk">*</span>
                          </label>
                          <input
                            type="text"
                            id="presentCity"
                            name="presentCity"
                            value={formData.presentCity}
                            onChange={handleInputChange}
                            onBlur={() =>
                              setTouchedFields({
                                ...touchedFields,
                                presentCity: true,
                              })
                            }
                            className={errors.presentCity ? 'input-error' : ''}
                            placeholder="Enter City/Municipality"
                            maxLength={50}
                          />
                          <div className={`character-count ${formData.presentCity.length > 45 ? 'warning' : ''}`}>
                            {formData.presentCity.length}/50
                          </div>
                          {errors.presentCity && (
                            <span className="error-message">
                              <FontAwesomeIcon icon={faExclamationCircle} /> {errors.presentCity}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor="presentBarangay">
                            Barangay:<span className="required-asterisk">*</span>
                          </label>
                          <input
                            type="text"
                            id="presentBarangay"
                            name="presentBarangay"
                            value={formData.presentBarangay}
                            onChange={handleInputChange}
                            onBlur={() =>
                              setTouchedFields({
                                ...touchedFields,
                                presentBarangay: true,
                              })
                            }
                            className={errors.presentBarangay ? 'input-error' : ''}
                            placeholder="Enter Barangay"
                            maxLength={50}
                          />
                          <div className={`character-count ${formData.presentBarangay.length > 45 ? 'warning' : ''}`}>
                            {formData.presentBarangay.length}/50
                          </div>
                          {errors.presentBarangay && (
                            <span className="error-message">
                              <FontAwesomeIcon icon={faExclamationCircle} /> {errors.presentBarangay}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor="presentPostalCode">
                            Postal Code:<span className="required-asterisk">*</span>
                          </label>
                          <input
                            type="text"
                            id="presentPostalCode"
                            name="presentPostalCode"
                            value={formData.presentPostalCode}
                            onChange={handleInputChange}
                            onBlur={() =>
                              setTouchedFields({
                                ...touchedFields,
                                presentPostalCode: true,
                              })
                            }
                            className={errors.presentPostalCode ? 'input-error' : ''}
                            placeholder="Enter 4-digit Postal Code"
                            maxLength={4}
                          />
                          <div className={`character-count ${formData.presentPostalCode.length > 3 ? 'warning' : ''}`}>
                            {formData.presentPostalCode.length}/4
                          </div>
                          {errors.presentPostalCode && (
                            <span className="error-message">
                              <FontAwesomeIcon icon={faExclamationCircle} /> {errors.presentPostalCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="form-section">
                    <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FaMapMarkerAlt style={{ marginRight: '8px', color: '#212121' }} />
                        <h4>Permanent Address</h4>
                      </div>
                      <div className="checkbox-container">
                        <input
                          type="checkbox"
                          id="sameAsPresent"
                          checked={sameAsPresent}
                          onChange={handleCheckboxChange}
                        />
                        <label htmlFor="sameAsPresent">Same with present address</label>
                      </div>
                    </div>
                    <div className="personal-info-divider"></div>
                    <div className="form-address-container">
                      <div className="form-group full-width">
                        <label htmlFor="permanentHouseNo">
                          House No. & Street:<span className="required-asterisk">*</span>
                        </label>
                        <input
                          type="text"
                          id="permanentHouseNo"
                          name="permanentHouseNo"
                          value={formData.permanentHouseNo}
                          onChange={handleInputChange}
                          onBlur={() =>
                            setTouchedFields({
                              ...touchedFields,
                              permanentHouseNo: true,
                            })
                          }
                          className={errors.permanentHouseNo ? 'input-error' : ''}
                          placeholder="Enter House No. & Street"
                          maxLength={100}
                          disabled={sameAsPresent}
                        />
                        <div className={`character-count ${formData.permanentHouseNo.length > 95 ? 'warning' : ''}`}>
                          {formData.permanentHouseNo.length}/100
                        </div>
                        {errors.permanentHouseNo && (
                          <span className="error-message">
                            <FontAwesomeIcon icon={faExclamationCircle} /> {errors.permanentHouseNo}
                          </span>
                        )}
                      </div>
                      <div className="form-grid address-grid">
                        <div className="form-group">
                          <label htmlFor="permanentProvince">
                            Province:<span className="required-asterisk">*</span>
                          </label>
                          <input
                            type="text"
                            id="permanentProvince"
                            name="permanentProvince"
                            value={formData.permanentProvince}
                            onChange={handleInputChange}
                            onBlur={() =>
                              setTouchedFields({
                                ...touchedFields,
                                permanentProvince: true,
                              })
                            }
                            className={errors.permanentProvince ? 'input-error' : ''}
                            placeholder="Enter Province"
                            maxLength={50}
                            disabled={sameAsPresent}
                          />
                          <div className={`character-count ${formData.permanentProvince.length > 45 ? 'warning' : ''}`}>
                            {formData.permanentProvince.length}/50
                          </div>
                          {errors.permanentProvince && (
                            <span className="error-message">
                              <FontAwesomeIcon icon={faExclamationCircle} /> {errors.permanentProvince}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor="permanentCity">
                            City/Municipality:<span className="required-asterisk">*</span>
                          </label>
                          <input
                            type="text"
                            id="permanentCity"
                            name="permanentCity"
                            value={formData.permanentCity}
                            onChange={handleInputChange}
                            onBlur={() =>
                              setTouchedFields({
                                ...touchedFields,
                                permanentCity: true,
                              })
                            }
                            className={errors.permanentCity ? 'input-error' : ''}
                            placeholder="Enter City/Municipality"
                            maxLength={50}
                            disabled={sameAsPresent}
                          />
                          <div className={`character-count ${formData.permanentCity.length > 45 ? 'warning' : ''}`}>
                            {formData.permanentCity.length}/50
                          </div>
                          {errors.permanentCity && (
                            <span className="error-message">
                              <FontAwesomeIcon icon={faExclamationCircle} /> {errors.permanentCity}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor="permanentBarangay">
                            Barangay:<span className="required-asterisk">*</span>
                          </label>
                          <input
                            type="text"
                            id="permanentBarangay"
                            name="permanentBarangay"
                            value={formData.permanentBarangay}
                            onChange={handleInputChange}
                            onBlur={() =>
                              setTouchedFields({
                                ...touchedFields,
                                permanentBarangay: true,
                              })
                            }
                            className={errors.permanentBarangay ? 'input-error' : ''}
                            placeholder="Enter Barangay"
                            maxLength={50}
                            disabled={sameAsPresent}
                          />
                          <div className={`character-count ${formData.permanentBarangay.length > 45 ? 'warning' : ''}`}>
                            {formData.permanentBarangay.length}/50
                          </div>
                          {errors.permanentBarangay && (
                            <span className="error-message">
                              <FontAwesomeIcon icon={faExclamationCircle} /> {errors.permanentBarangay}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor="permanentPostalCode">
                            Postal Code:<span className="required-asterisk">*</span>
                          </label>
                          <input
                            type="text"
                            id="permanentPostalCode"
                            name="permanentPostalCode"
                            value={formData.permanentPostalCode}
                            onChange={handleInputChange}
                            onBlur={() =>
                              setTouchedFields({
                                ...touchedFields,
                                permanentPostalCode: true,
                              })
                            }
                            className={errors.permanentPostalCode ? 'input-error' : ''}
                            placeholder="Enter 4-digit Postal Code"
                            maxLength={4}
                            disabled={sameAsPresent}
                          />
                          <div className={`character-count ${formData.permanentPostalCode.length > 3 ? 'warning' : ''}`}>
                            {formData.permanentPostalCode.length}/4
                          </div>
                          {errors.permanentPostalCode && (
                            <span className="error-message">
                              <FontAwesomeIcon icon={faExclamationCircle} /> {errors.permanentPostalCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="form-section">
                    <div className="section-title" style={{ display: 'flex', alignItems: 'center' }}>
                      <FaPhone style={{ marginRight: '8px', color: '#212121' }} />
                      <h4>Contacts</h4>
                    </div>
                    <div className="personal-info-divider"></div>
                    <div className="section-divider"></div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="mobileNo">
                          Mobile No.:<span className="required-asterisk">*</span>
                        </label>
                        <input
                          type="text"
                          id="mobileNo"
                          name="mobileNo"
                          value={formData.mobileNo}
                          disabled
                          className="disabled-input"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="telephoneNo">
                          Telephone No.:
                        </label>
                        <input
                          type="text"
                          id="telephoneNo"
                          name="telephoneNo"
                          value={formData.telephoneNo}
                          onChange={handleInputChange}
                          onBlur={() =>
                            setTouchedFields({
                              ...touchedFields,
                              telephoneNo: true,
                            })
                          }
                          className={errors.telephoneNo ? 'input-error' : ''}
                          placeholder="Enter Telephone No."
                          maxLength={12}
                        />
                        {errors.telephoneNo && (
                          <span className="error-message">
                            <FontAwesomeIcon icon={faExclamationCircle} /> {errors.telephoneNo}
                          </span>
                        )}
                      </div>
                      <div className="form-group">
                        <label htmlFor="emailAddress">
                          Email Address:<span className="required-asterisk">*</span>
                        </label>
                        <input
                          type="email"
                          id="emailAddress"
                          name="emailAddress"
                          value={formData.emailAddress}
                          disabled
                          className="disabled-input"
                        />
                      </div>
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

export default ScopeRegistration3;