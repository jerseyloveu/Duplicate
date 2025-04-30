import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdMenu } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { IoLogOutOutline } from "react-icons/io5";
import '../../css/UserAdmin/Header.css';
import '../../css/UserAdmin/Global.css';
import SJDEFILogo from '../../images/SJDEFILogo.png';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [department, setDepartment] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
    }

    const fullName = localStorage.getItem('fullName') || '';
    const userRole = localStorage.getItem('role') || 'ROLE';
    setUserName(fullName);

    // Remove anything in parentheses from department name
    const userDepartment = userRole.replace(/\s*\([^)]*\)\s*/g, '').toUpperCase();
    setDepartment(userDepartment);
  }, [navigate]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('fullName');
    localStorage.removeItem('department');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('token');
    
    // Redirect to login page
    navigate('/admin');
  };

  return (
    <div className='header-container'>
      <div className='header-blue'>
        <div className='header-section'>
          <IoMdMenu className="menu-icon" />
          <span className="header-text">{department}</span>
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
            <span className="header-text">{userName}</span>
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