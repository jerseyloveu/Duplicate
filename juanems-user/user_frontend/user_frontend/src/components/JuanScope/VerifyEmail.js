import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { faEnvelope, faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faClock } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import '../../css/JuanScope/Register.css';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import JuanEMSLogo from '../../images/JuanEMSlogo.png';

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, firstName, fromRegistration, studentID } = location.state || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [countdown, setCountdown] = useState(180); // 3 minutes in seconds

  // Redirect if no email or not from registration
  useEffect(() => {
    if (!email || !fromRegistration) {
      navigate('/register');
    }
  }, [email, fromRegistration, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus to next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setErrors({ otp: 'Please enter a 6-digit OTP' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      setVerificationSuccess(true);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:5000/api/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setCountdown(180); // Reset countdown
    } catch (error) {
      setErrors({ resend: error.message });
    } finally {
      setIsResending(false);
    }
  };

  if (verificationSuccess) {
    return (
      <div className="juan-register-container">
        <header className="juan-register-header">
          <div className="juan-header-left">
            <img src={SJDEFILogo} alt="SJDEFI Logo" className="juan-logo-register" />
            <div className="juan-header-text">
              <h1>JUAN SCOPE</h1>
            </div>
          </div>
        </header>

        <div className="juan-main-content" style={{ justifyContent: 'center' }}>
          <div className="juan-verification-success">
            <h2>Email Verified Successfully!</h2>
            <p>Your account has been successfully verified.</p>
            <p>We've sent your student ID and password to your email at <strong>{email}</strong>.</p>
            <p>Please check your inbox (and spam folder if you don't see it).</p>
            
            <div className="juan-student-id-box">
              <p>Your Student ID:</p>
              <h3>{studentID}</h3>
            </div>

            <button 
              className="juan-next-button" 
              onClick={() => navigate('/login')}
              style={{ marginTop: '20px' }}
            >
              Proceed to Login
            </button>
          </div>
        </div>

        <footer className="juan-register-footer">
          {/* Footer content same as your Register.js */}
        </footer>
      </div>
    );
  }

  return (
    <div className="juan-register-container">
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
      </header>

      <div className="juan-main-content" style={{ justifyContent: 'center' }}>
        <div className="juan-verification-container">
          <div className="juan-verification-header">
            <FontAwesomeIcon icon={faEnvelope} className="juan-verification-icon" />
            <h2>Verify Your Email Address</h2>
          </div>

          <p className="juan-verification-text">
            We've sent a 6-digit verification code to <strong>{email}</strong>.
            Please enter it below to verify your account.
          </p>

          <form onSubmit={handleSubmit} className="juan-otp-form">
            <div className="juan-otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`juan-otp-input ${errors.otp ? 'juan-input-error' : ''}`}
                />
              ))}
            </div>
            {errors.otp && <p className="juan-error-message">{errors.otp}</p>}

            <div className="juan-countdown">
              {countdown > 0 ? (
                <p>Code expires in: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</p>
              ) : (
                <p>Code has expired</p>
              )}
            </div>

            <button
              type="submit"
              className="juan-next-button"
              disabled={isSubmitting || countdown <= 0}
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </button>

            <button
              type="button"
              className="juan-resend-button"
              onClick={handleResendOtp}
              disabled={isResending || countdown > 0}
            >
              {isResending ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Sending...
                </>
              ) : (
                'Resend Code'
              )}
            </button>
          </form>

          {errors.submit && <p className="juan-error-message">{errors.submit}</p>}
          {errors.resend && <p className="juan-error-message">{errors.resend}</p>}

          <div className="juan-back-to-register">
            <button
              type="button"
              className="juan-cancel-button"
              onClick={() => navigate('/register')}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Registration
            </button>
          </div>
        </div>
      </div>

 {/* Footer section remains the same */}
      <footer className="juan-register-footer">
        {/* Left section - Logo and school name */}
        <div className="juan-footer-left">
          <img
            src={JuanEMSLogo}
            alt="SJDEFI Logo"
            className="juan-footer-logo"
          />
          <div className="juan-footer-text">
            <h1>JuanEMS - JUAN SCOPE</h1>
            <p className="juan-footer-motto">© 2025. San Juan De Dios Educational Foundation Inc.</p>
          </div>
        </div>

        {/* Center and right section - organized in a row */}
        <div className="juan-footer-content">
          {/* About, Terms, Privacy links */}
          <div className="juan-footer-links">
            <a href="/about" className="juan-footer-link">About</a>
            <span className="juan-footer-link-separator">|</span>
            <a href="/terms" className="juan-footer-link">Terms of Use</a>
            <span className="juan-footer-link-separator">|</span>
            <a href="/privacy" className="juan-footer-link">Privacy</a>
          </div>

          {/* Footer content remains the same */}
          <a
            href="https://www.facebook.com/SJDEFIcollege"
            target="_blank"
            rel="noopener noreferrer"
            className="juan-footer-social-link"
          >
            <FontAwesomeIcon icon={faFacebookSquare} className="juan-social-icon" />
            <div className="juan-social-text">
              <span className="juan-social-find">Find us on</span>
              <span className="juan-social-platform">Facebook</span>
            </div>
          </a>

          <div className="juan-footer-contact-container">
            <div className="juan-contact-title">
              <FontAwesomeIcon icon={faPhone} />
              <span>CONTACT US</span>
            </div>
            <div className="juan-contact-items">
              <div className="juan-contact-item">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>2772 Roxas Blvd., Pasay City, Philippines, 1300</span>
              </div>
              <div className="juan-contact-item">
                <FontAwesomeIcon icon={faPhone} />
                <span>+632 551-2763</span>
              </div>
              <div className="juan-contact-item">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>admission_office@sjdefi.edu.ph | registrarsoffice@sjdefi.edu.ph</span>
              </div>
              <div className="juan-contact-item">
                <FontAwesomeIcon icon={faClock} />
                <span>Monday to Thursday - 7:00 AM to 5:00 PM | Friday - 7:00 AM to 4:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default VerifyEmail;