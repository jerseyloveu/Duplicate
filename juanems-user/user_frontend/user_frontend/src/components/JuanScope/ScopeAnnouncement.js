import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faBars, 
  faTimes, 
  faBullhorn, 
  faGraduationCap,
  faCalendarCheck
} from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeAnnouncement.css';
import SessionManager from '../JuanScope/SessionManager';
import SideNavigation from './SideNavigation';

function ScopeAnnouncement() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState({
    email: localStorage.getItem('userEmail') || '',
    firstName: localStorage.getItem('firstName') || 'User',
    middleName: localStorage.getItem('middleName') || '',
    lastName: localStorage.getItem('lastName') || '',
    applicantID: localStorage.getItem('applicantID') || 'N/A'
  });

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      navigate('/scope-login');
      return;
    }
  }, [navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleBackToDashboard = () => {
    navigate('/scope-dashboard');
  };

  // Sample announcement data - in a real application, this would come from an API
  const announcements = [
    {
      id: 1,
      uploader: "Admin",
      title: "Online Payment System Now Available",
      content: "We are excited to introduce our new Online Payment System, allowing students to pay tuition and fees quickly and securely through the student portal. No more waiting in line—simply log in.",
      date: "April 28, 2025, 10:30 AM"
    },
    {
      id: 2,
      uploader: "Registrar",
      title: "Enrollment Period Extended",
      content: "The enrollment period for the first semester has been extended until June 30, 2023. Please complete your enrollment requirements before the deadline.",
      date: "April 25, 2025, 2:15 PM"
    },
    {
      id: 3,
      uploader: "Student Affairs",
      title: "University Foundation Week Schedule",
      content: "The annual University Foundation Week will be held from May 10-15, 2025. Various activities have been organized including sports competitions, academic contests, and cultural performances. Check the schedule for more details.",
      date: "April 22, 2025, 9:45 AM"
    }
  ];

  return (
    <SessionManager>
      <div className="scope-dashboard-container">
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
          <div className="hamburger-menu">
            <button 
              className="hamburger-button" 
              onClick={toggleSidebar}
              aria-label="Toggle navigation menu"
            >
              <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} size="lg" />
            </button>
          </div>
        </header>
        <div className="scope-dashboard-content">
          <aside className={`scope-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <SideNavigation 
              userData={userData} 
              onNavigate={closeSidebar}
            />
          </aside>

          <main className="scope-main-content">
            <div className="announcement-container">
              <div className="announcement-content">
                <h2 className="announcement-title">Announcements</h2>
                <div className="announcement-divider"></div>
                
                <div className="announcement-banner">
                  Stay updated with important news, reminders, and university updates.
                </div>
                
                <div className="announcement-list">
                  {announcements.map(announcement => (
                    <div className="announcement-item" key={announcement.id}>
                      <div className="announcement-header">
                        <div className="announcement-uploader">
                          <FontAwesomeIcon icon={faBullhorn} className="uploader-icon" />
                          <span className="uploader-name">{announcement.uploader}</span>
                        </div>
                        <h3 className="announcement-item-title">{announcement.title}</h3>
                      </div>
                      <p className="announcement-item-content">
                        {announcement.content}
                      </p>
                      <p className="announcement-item-date">{announcement.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={toggleSidebar}></div>
        )}
      </div>
    </SessionManager>
  );
}

export default ScopeAnnouncement;