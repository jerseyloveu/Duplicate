// ScopeLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '../../css/JuanScope/ScopeLogin.css';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import JuanEMSLogo from '../../images/JuanEMSlogo.png';
import ScopeImage from '../../images/scope.png';

function ScopeLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation will be added later
    console.log('Login submitted', { email, password });
    // For now, just navigate to home
    navigate('/home');
  };

  const handleForgotPassword = () => {
    // Forgot password functionality will be added later
    console.log('Forgot password clicked');
  };

  const handleGoToHome = () => {
    navigate('/home');
  };

  return (
    <div className="scope-login-container">
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
    </div>
  );
}

export default ScopeLogin;