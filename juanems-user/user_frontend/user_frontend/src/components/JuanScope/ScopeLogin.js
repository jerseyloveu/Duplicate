// ScopeLogin.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '../../css/JuanScope/ScopeLogin.css';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import JuanEMSLogo from '../../images/JuanEMSlogo.png';
import ScopeImage from '../../images/scope.png';
import PasswordNotification from '../JuanScope/PasswordNotification';

function ScopeLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [lastResetRequest, setLastResetRequest] = useState(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  useEffect(() => {
    if (location.state?.fromPasswordReset) {
      setLoginError(''); // Clear any errors
      alert('Password reset successful. Please check your email for the new password.');
    }

    // Show message if redirected due to inactive account
    if (location.state?.accountInactive) {
      setLoginError('Your session was invalidated. Please login again.');
    }
  }, [location.state]);

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkAccountStatus = async (email) => {
    if (!email) return;

    try {
      const response = await fetch(`http://localhost:5000/api/enrollee-applicants/verification-status/${email}`);
      const data = await response.json();

      if (response.ok) {
        if (data.status === 'Pending Verification') {
          // Navigate to verify-email immediately with all required data
          navigate('/verify-email', {
            state: {
              email: email,
              firstName: data.firstName, // Include firstName from response
              fromRegistration: false,
              fromLogin: true
            }
          });
        }
      }
    } catch (error) {
      console.error('Error checking account status:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/enrollee-applicants/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error types more specifically
        if (data.errorType === 'pending_verification') {
          navigate('/verify-email', {
            state: {
              email: data.email,
              firstName: data.firstName,
              fromRegistration: false,
              fromLogin: true
            }
          });
          return;
        }
        if (data.errorType === 'account_inactive') {
          setLoginError('Your account is inactive. Please contact support.');
          return;
        }
        throw new Error(data.message || 'Login failed');
      }

      // In ScopeLogin.js handleSubmit function
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('firstName', data.firstName);
      localStorage.setItem('studentID', data.studentID);
      localStorage.setItem('applicantID', data.applicantID); // Add this line
      localStorage.setItem('lastLogin', data.lastLogin);
      localStorage.setItem('lastLogout', data.lastLogout);
      localStorage.setItem('createdAt', data.createdAt);
      localStorage.setItem('activityStatus', data.activityStatus);
      localStorage.setItem('loginAttempts', data.loginAttempts.toString());
      // Successful login - navigate to dashboard
      navigate('/scope-dashboard');

    } catch (err) {
      console.error('Login error:', err);
      setLoginError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrors({ email: 'Email is required to reset password' });
      return;
    }

    // Check if user can request another reset (once per day)
    const now = new Date();
    if (lastResetRequest && (now - new Date(lastResetRequest) < 24 * 60 * 60 * 1000)) {
      setLoginError('You can only request a password reset once per day. Please try again later.');
      return;
    }

    setShowResetConfirmation(true);
  };

  const handleConfirmedForgotPassword = async () => {
    setShowResetConfirmation(false);
    setLoginError('');

    try {
      const response = await fetch('http://localhost:5000/api/enrollee-applicants/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initiate password reset');
      }

      // Navigate to verify-email with password reset context
      navigate('/verify-email', {
        state: {
          email,
          isPasswordReset: true, // Flag to indicate this is for password reset
          fromLogin: true
        }
      });

    } catch (err) {
      setLoginError(err.message || 'Failed to process password reset request');
    }
  };

  const handleGoToHome = () => {
    navigate('/home');
  };

  return (
    <div className="scope-login-container">
      <PasswordNotification />
      {/* Left side with image and gradient overlay */}
      <div className="scope-login-left-side">
        <div className="scope-login-image-background">
          {/* Image with gradient overlay */}
          <div className="scope-login-image-overlay"></div>
          {/* Logo and text */}
          <div className="scope-login-left-content">
            <div className="scope-login-top-logo">
              <img src={SJDEFILogo} alt="SJDEFI Logo" className="scope-login-sjdefi-logo" />
              <div className="scope-login-top-text">
                <h1>SAN JUAN DE DIOS EDUCATIONAL FOUNDATION, INC.</h1>
                <p className="scope-login-motto">Where faith and reason are expressed in Charity.</p>
              </div>
            </div>
            <div className="scope-login-center-logo">
              <img src={JuanEMSLogo} alt="JuanEMS Logo" className="scope-login-ems-logo" />
              <h2 className="scope-login-ems-title">JuanEMS</h2>
              <p className="scope-login-ems-subtitle">Juan Enrollment Management System</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side with form */}
      <div className="scope-login-right-side">
        <div className="scope-login-form-container">
          {/* JUANSCOPE title with image */}
          <div className="scope-login-scope-title">
            <h1>JUANSC<img src={ScopeImage} alt="O" className="scope-login-scope-image" />PE</h1>
            <p className="scope-login-scope-subtitle">Online Admission Application</p>
          </div>

          {/* Login form */}
          <div className="scope-login-login-form">
            <h2 className="scope-login-form-title">Enroll Now!</h2>
            {loginError && <div className="scope-login-error-message">{loginError}</div>}
            <form onSubmit={handleSubmit}>
              {/* Email field */}
              <div className="scope-login-form-group">
                <div className="scope-login-input-label">
                  <FontAwesomeIcon icon={faEnvelope} className="scope-login-input-icon" />
                  <label>Email</label>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={(e) => checkAccountStatus(e.target.value)}
                  placeholder="Enter your email"
                  className="scope-login-input-field"
                />
                {errors.email && <span className="scope-login-error-message">{errors.email}</span>}
              </div>

              {/* Password field */}
              <div className="scope-login-form-group">
                <div className="scope-login-input-label">
                  <FontAwesomeIcon icon={faLock} className="scope-login-input-icon" />
                  <label>Password</label>
                </div>
                <div className="scope-login-password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="scope-login-input-field"
                  />
                  <button
                    type="button"
                    className="scope-login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {errors.password && <span className="scope-login-error-message">{errors.password}</span>}
              </div>

              {/* Links for forgotten password and home */}
              <div className="scope-login-links-container">
                <button
                  type="button"
                  className="scope-login-go-home-btn"
                  onClick={handleGoToHome}
                >
                  Go back to Home
                </button>
                <button
                  type="button"
                  className="scope-login-forgot-password-btn"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login button */}
              <button type="submit" className="scope-login-login-button">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>

      {showResetConfirmation && (
        <div className="scope-login-modal">
          <div className="scope-login-modal-content">
            <h3>Confirm Password Reset</h3>
            <p>Are you sure you want to reset your password? A verification code will be sent to your email.</p>
            <div className="scope-login-modal-buttons">
              <button
                onClick={() => setShowResetConfirmation(false)}
                className="scope-login-modal-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedForgotPassword}
                className="scope-login-modal-confirm"
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

export default ScopeLogin;