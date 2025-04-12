import React from 'react';
import { FaRegSmileWink } from 'react-icons/fa';
import '../css/HomePage.css';
import SJDEFILogo from '../images/SJDEFILogo.png';

function HomePage() {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="homepage-header">
        <div className="header-left">
          <img 
            src={SJDEFILogo} 
            alt="SJDEFI Logo" 
            className="logo" 
          />
          <div className="header-text">
            <h1>SAN JUAN DE DIOS EDUCATIONAL FOUNDATION, INC.</h1>
            <p className="motto">Where faith and reason are expressed in Charity.</p>
          </div>
        </div>
        <div className="header-right">
          <p>
            Welcome to <strong>JuanEMS</strong>{' '}
            <FaRegSmileWink className="icon" />
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="homepage-main">
        <h2>Welcome to the Home Page!</h2>
        <p>This is where your content will go.</p>
      </main>
    </div>
  );
}

export default HomePage;