import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faCompass,
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
  faSignOut
} from '@fortawesome/free-solid-svg-icons';

function SideNavigation({ userData, onNavigate }) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const formatEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;
    const maskedName = name.length > 2
      ? `${name.substring(0, 2)}${'*'.repeat(name.length - 2)}`
      : '***';
    return `${maskedName}@${domain}`;
  };

  const navigateToPage = (path) => {
    navigate(path);
    if (onNavigate) onNavigate();
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
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
        console.error('Failed to logout. Please try again.');
      }
    } catch (err) {
      console.error('Error during logout process:', err);
    } finally {
      setShowLogoutModal(false);
    }
  };

  return (
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
        onClick={handleLogoutClick}
      >
        <FontAwesomeIcon icon={faSignOut} />
        <span className="nav-text-bold">Logout</span>
      </button>

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

export default SideNavigation;