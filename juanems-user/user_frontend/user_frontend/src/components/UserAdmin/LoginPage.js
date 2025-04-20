import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { Button, Input } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/UserAdmin/Global.css';
import '../../css/JuanEMS/SplashScreen.css';
import '../../css/UserAdmin/LoginPage.css';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import Footer from './Footer';

const LoginPage = () => {
  const navigate = useNavigate();
  
  const handleLogin = () => {
    // TODO: Add form validation for login inputs
    navigate('/admin/dashboard');
  };

  return (
    <div className="splash-container main">
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
          <label className="input-label">Employee No.</label>
          <Input className="custom-input" addonBefore={<FaUser/>} placeholder="Enter Employee No." />
          <label className="input-label">Password</label>
          <Input className="custom-input" addonBefore={<FaLock/>} placeholder="Enter Password" />
          <Button type='ghost' className="login-btn" onClick={handleLogin}>Login</Button>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default LoginPage;