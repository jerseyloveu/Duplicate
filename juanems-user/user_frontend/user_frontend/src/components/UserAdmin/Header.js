import React, { useState } from 'react';
import { IoMdMenu } from "react-icons/io";
import { IoSettingsOutline, IoLogOutOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import '../../css/UserAdmin/Header.css';
import '../../css/UserAdmin/Global.css';
import SJDEFILogo from '../../images/SJDEFILogo.png';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    const email = localStorage.getItem('userEmail');

    if (!email) {
      navigate('/admin/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Logout failed:', data.message);
      } else {
        console.log('Logout successful:', data.message);
      }

      // Clear user session data
      localStorage.removeItem('userEmail');

      navigate('/admin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className='header-container'>
      <div className='header-blue'>
        <div className='header-section'>
          <IoMdMenu className="menu-icon" />
          <span className="header-text">DEPARTMENT NAME</span>
        </div>
        <img
          src={SJDEFILogo}
          alt="SJDEFI Logo"
          className="juan-logo-register"
        />
        <div className='relative'>
          <div 
            className={`header-section user-profile ${isDropdownOpen ? 'active-profile' : ''}`}
            onClick={toggleDropdown}
          >
            <span className="header-text">ACCOUNT NAME</span>
            <div className='pfp' />
          </div>
          
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item">
                <IoSettingsOutline className="dropdown-icon" />
                <span>Settings</span>
              </div>
              <div className="dropdown-item" onClick={handleLogout}>
                <IoLogOutOutline className="dropdown-icon" />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className='header-yellow'></div>
    </div>
  );
};

export default Header;
