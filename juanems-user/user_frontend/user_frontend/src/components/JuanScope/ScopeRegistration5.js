import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faArrowLeft, faTimes, faBars, faChevronDown, faChevronUp, faEdit, faTrash, faCheckCircle, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FaPlus } from 'react-icons/fa';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeRegistration1.css';
import SideNavigation from './SideNavigation';
import FamilyRecordModal from './FamilyRecordModal';

function ScopeRegistration5() {
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
  const [contacts, setContacts] = useState([
    {
      id: 1,
      relationship: 'Parent',
      firstName: 'John',
      middleName: 'A',
      lastName: 'Doe',
      occupation: 'Engineer',
      country: 'philippines',
      province: 'Metro Manila',
      city: 'Quezon City',
      houseNo: '123 Main St',
      postalCode: '1100',
      mobileNo: '09123456789',
      telephoneNo: '',
      emailAddress: 'john.doe@example.com',
      isEmergencyContact: true,
      isOpen: true,
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [modalFormData, setModalFormData] = useState({
    relationship: '',
    firstName: '',
    middleName: '',
    lastName: '',
    occupation: '',
    sameAsApplicant: false,
    country: 'philippines',
    province: '',
    city: '',
    houseNo: '',
    postalCode: '',
    mobileNo: '',
    telephoneNo: '',
    emailAddress: '',
    isEmergencyContact: 'no',
  });
  const [modalErrors, setModalErrors] = useState({});
  const [modalTouchedFields, setModalTouchedFields] = useState({});

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

  const handleNext = () => {
    if (!contacts.some(contact => contact.isEmergencyContact)) {
      alert('At least one family record should be set as contact for emergency.');
      return;
    }
    if (isFormDirty) {
      setNextLocation('/scope-registration-6');
      setShowUnsavedModal(true);
    } else {
      navigate('/scope-registration-6');
    }
  };

  const handleBack = () => {
    if (isFormDirty) {
      setNextLocation('/scope-registration-4');
      setShowUnsavedModal(true);
    } else {
      navigate('/scope-registration-4');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleContact = (id) => {
    setContacts(contacts.map(contact =>
      contact.id === id ? { ...contact, isOpen: !contact.isOpen } : contact
    ));
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setModalFormData({
      relationship: '',
      firstName: '',
      middleName: '',
      lastName: '',
      occupation: '',
      sameAsApplicant: false,
      country: 'philippines',
      province: '',
      city: '',
      houseNo: '',
      postalCode: '',
      mobileNo: '',
      telephoneNo: '',
      emailAddress: '',
      isEmergencyContact: 'no',
    });
    setModalErrors({});
    setModalTouchedFields({});
    setShowModal(true);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setModalFormData({
      relationship: contact.relationship,
      firstName: contact.firstName,
      middleName: contact.middleName,
      lastName: contact.lastName,
      occupation: contact.occupation,
      sameAsApplicant: false,
      country: contact.country,
      province: contact.province,
      city: contact.city,
      houseNo: contact.houseNo,
      postalCode: contact.postalCode,
      mobileNo: contact.mobileNo,
      telephoneNo: contact.telephoneNo,
      emailAddress: contact.emailAddress,
      isEmergencyContact: contact.isEmergencyContact ? 'yes' : 'no',
    });
    setModalErrors({});
    setModalTouchedFields({});
    setShowModal(true);
  };

  const handleDeleteContact = (id) => {
    if (id === 1) return; // Prevent deletion of Contact 1
    setContacts(contacts.filter(contact => contact.id !== id));
    setIsFormDirty(true);
  };

  const handleModalSave = (newContact) => {
    if (editingContact) {
      setContacts(contacts.map(contact =>
        contact.id === editingContact.id ? newContact : contact
      ));
    } else {
      setContacts([...contacts, newContact]);
    }
    setShowModal(false);
    setIsFormDirty(true);
  };

  const handleModalReset = () => {
    setModalFormData({
      relationship: '',
      firstName: '',
      middleName: '',
      lastName: '',
      occupation: '',
      sameAsApplicant: false,
      country: 'philippines',
      province: '',
      city: '',
      houseNo: '',
      postalCode: '',
      mobileNo: '',
      telephoneNo: '',
      emailAddress: '',
      isEmergencyContact: 'no',
    });
    setModalErrors({});
    setModalTouchedFields({});
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
                    <div className="step-circle active">5</div>
                    <div className="step-line"></div>
                    <div className="step-circle">6</div>
                  </div>
                  <div className="step-text">Step 5 of 6</div>
                </div>
                <div className="personal-info-section">
                  <div className="personal-info-header">
                    <FontAwesomeIcon icon={faHome} />
                    <h3>Family Background</h3>
                  </div>
                  <div className="personal-info-divider"></div>
                  <div className="reminder-box">
                    <p>
                      <strong>Reminder:</strong> At least one family record should be set as contact for emergency.
                    </p>
                  </div>
                  <div className="form-section">
                    {contacts.map(contact => (
                      <div className="collapsible-container" key={contact.id}>
                        <div
                          className="section-title collapsible-header"
                          onClick={() => toggleContact(contact.id)}
                        >
                          <h4 style={{ color: '#2A67D5', fontWeight: 'bold', margin: 0 }}>Contact {contact.id}</h4>
                          <FontAwesomeIcon
                            icon={contact.isOpen ? faChevronUp : faChevronDown}
                          />
                        </div>
                        {contact.isOpen && (
                          <div className="collapsible-content">
                            <div className="contact-details">
                              <FontAwesomeIcon icon={faUsers} />
                              <div>
                                <p><strong>Name:</strong> {contact.firstName} {contact.middleName} {contact.lastName}</p>
                                <p><strong>Relationship:</strong> {contact.relationship}</p>
                                <p><strong>Address:</strong> {contact.houseNo}, {contact.city}, {contact.province}, {contact.country}</p>
                                <p><strong>Mobile Number:</strong> {contact.mobileNo}</p>
                                {contact.isEmergencyContact && (
                                  <div className="emergency-contact">
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                    <span>Contact on emergency</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="contact-actions">
                              <button onClick={() => handleEditContact(contact)}>
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              {contact.id !== 1 && (
                                <button onClick={() => handleDeleteContact(contact.id)}>
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      className="add-contact-button"
                      onClick={handleAddContact}
                      aria-label="Add new contact"
                    >
                      <FaPlus />
                    </button>
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
                    <div>
                      <button
                        type="button"
                        className="next-button"
                        onClick={handleNext}
                      >
                        Next
                      </button>
                    </div>
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
      {showModal && (
        <FamilyRecordModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleModalSave}
          onReset={handleModalReset}
          formData={modalFormData}
          setFormData={setModalFormData}
          errors={modalErrors}
          setErrors={setModalErrors}
          touchedFields={modalTouchedFields}
          setTouchedFields={setModalTouchedFields}
          editingContact={editingContact}
          setIsFormDirty={setIsFormDirty}
        />
      )}
    </div>
  );
}

export default ScopeRegistration5;