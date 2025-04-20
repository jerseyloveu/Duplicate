import React from 'react';
import '../../css/UserAdmin/Header.css';
import '../../css/UserAdmin/Global.css';
import '../../css/JuanScope/Register.css';
import { IoMdMenu } from "react-icons/io";
import SJDEFILogo from '../../images/SJDEFILogo.png';

const Header = () => {
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
        <div className='header-section'>
          <span className="header-text">ACCOUNT NAME</span>
          <img className='pfp' alt="Profile" />
        </div>
      </div>
      <div className='header-yellow'></div>
    </div>
  );
};

export default Header;
