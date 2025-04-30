import React, { useState } from 'react';
import { IoMdMenu } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { IoLogOutOutline } from "react-icons/io5";
import '../../css/UserAdmin/Header.css';
import '../../css/UserAdmin/Global.css';
import SJDEFILogo from '../../images/SJDEFILogo.png';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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
              <div className="dropdown-item">
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