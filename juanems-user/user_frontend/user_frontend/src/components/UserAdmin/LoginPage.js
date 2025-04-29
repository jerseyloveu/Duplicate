import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { Button, Input } from 'antd';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../css/UserAdmin/Global.css';
import '../../css/JuanEMS/SplashScreen.css';
import '../../css/UserAdmin/LoginPage.css';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import Footer from './Footer';

const LoginPage = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!validateForm()) {
      return;
    }

    try {
      // First check account status as part of the login flow
      const statusResponse = await fetch(`http://localhost:5000/api/admin/verification-status/${email.trim()}`);
      const statusData = await statusResponse.json();

      if (statusResponse.ok && statusData.status === 'Pending Verification') {
        navigate('/admin/verify-email', {
          state: {
            email: email.trim(),
            firstName: statusData.firstName,
            fromRegistration: false,
            fromLogin: true
          }
        });
        return;
      }

      // Continue with regular login process
      const response = await fetch('http://localhost:5000/api/admin/login', {
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
          navigate('/admin/verify-email', {
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
      // localStorage.setItem('studentID', data.studentID);
      // localStorage.setItem('applicantID', data.applicantID); // Add this line
      localStorage.setItem('lastLogin', data.lastLogin);
      localStorage.setItem('lastLogout', data.lastLogout);
      localStorage.setItem('createdAt', data.createdAt);
      localStorage.setItem('activityStatus', data.activityStatus);
      localStorage.setItem('loginAttempts', data.loginAttempts.toString());
      // Successful login - navigate to dashboard
      navigate('/admin/dashboard');

    } catch (err) {
      console.error('Login error:', err);
      setLoginError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="splash-screen-container main">
      <div className="login-container">
        <div className="left-box">
          <img
            src={SJDEFILogo} alt="SJDEFI Logo" className="admin-logo"
          />
          <div className="header-text">
            <h1>SAN JUAN DE DIOS EDUCATIONAL FOUNDATION, INC.</h1>
            <p className="motto">Where faith and reason are expressed in Charity.</p>
          </div>
          <h1 className='login-title'>Admin Online Portal</h1>
        </div>

        <div className="right-box">
          <h1 className='login-title'>Sign In</h1>
          <label className="input-label">Email</label>
          <Input 
            className="custom-input" 
            addonBefore={<FaUser/>} 
            placeholder="Enter Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // Removed the onBlur handler that was causing the issue
          />
          <label className="input-label">Password</label>
          <Input 
            className="custom-input" 
            addonBefore={<FaLock/>} 
            placeholder="Enter Password" 
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {loginError && <div className="error-message">{loginError}</div>}
          <Button type='ghost' className="login-btn" onClick={handleSubmit}>Login</Button>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default LoginPage;