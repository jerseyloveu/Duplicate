import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope, faClock } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import '../../css/JuanScope/Register.css';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import JuanEMSLogo from '../../images/JuanEMSlogo.png';
import registrationPersonImg from '../../images/registrationperson.png';

function Register() {
  const navigate = useNavigate();

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

      <div className="juan-main-content">
        {/* Left side with gradient background and image */}
        <div className="juan-left-side">
          <div className="juan-gradient-background">
            <h2 className="juan-registration-title">Online Registration</h2>
            <img 
              src={registrationPersonImg} 
              alt="Registration" 
              className="juan-registration-image" 
            />
          </div>
        </div>
        
        {/* Right side with form content */}
        <div className="juan-right-side">
          <div className="juan-form-container">
            <h2>Create your profile</h2>
            <p>Fill out the form below to register for SJDEFI admission</p>
            
            {/* Registration form will go here */}
            <div className="juan-registration-form">
              <p>Registration form content will be placed here.</p>
              
              <button 
                onClick={() => navigate('/home')}
                className="juan-back-button"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
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

          {/* Facebook link */}
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

          {/* Contact Form section */}
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

export default Register;