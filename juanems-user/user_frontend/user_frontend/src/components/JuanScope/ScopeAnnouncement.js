import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faBars, 
  faTimes, 
  faBullhorn, 
  faGraduationCap,
  faCalendarCheck,
  faSearch,
  faArrowUp,
  faArrowDown,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeAnnouncement.css';
import SessionManager from '../JuanScope/SessionManager';
import SideNavigation from './SideNavigation';
import axios from 'axios';
import debounce from 'lodash.debounce';

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

  // Announcement state
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'startDate',
    direction: 'desc'
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setCurrentPage(1);
      fetchAnnouncements(1, searchValue);
    }, 500),
    [sortConfig] // Add sortConfig as dependency to reflect current sort settings
  );

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      navigate('/scope-login');
      return;
    }
    fetchAnnouncements(currentPage);
  }, [navigate, currentPage, sortConfig]);

  useEffect(() => {
    if (searchTerm !== '') {
      debouncedSearch(searchTerm);
    }
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  const fetchAnnouncements = async (page = currentPage, searchValue = searchTerm) => {
    try {
      setLoading(true);
      console.log('Fetching announcements with params:', {
        page,
        limit: 5,
        search: searchValue,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        status: 'Active',
        audience: 'Applicants'
      });
      
      const response = await axios.get('/api/announcements', {
        params: {
          page,
          limit: 5,
          search: searchValue,
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction,
          status: 'Active',
          audience: 'Applicants'
        }
      });
      
      console.log('API Response:', response.data);
      
      // Verify received announcements match our criteria
      const validAnnouncements = response.data.announcements.filter(
        announcement => announcement.audience === 'Applicants' && announcement.status === 'Active'
      );
      
      if (validAnnouncements.length !== response.data.announcements.length) {
        console.error('Warning: Received announcements with incorrect audience or status');
        console.log('Expected only Applicants/Active, but got:', 
          response.data.announcements.map(a => `${a.audience}/${a.status}`).join(', '));
        
        // Use only the valid announcements
        setAnnouncements(validAnnouncements);
      } else {
        setAnnouncements(response.data.announcements);
      }
      
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems || response.data.announcements.length);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to load announcements. Please try again later.');
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchAnnouncements(1, '');
  };

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

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
          <SideNavigation 
            userData={userData} 
            onNavigate={closeSidebar}
            isOpen={sidebarOpen}
          />

          <main className={`scope-main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="announcement-container">
              <div className="announcement-content">
                <h2 className="announcement-title">Announcements</h2>
                <div className="announcement-divider"></div>
                
                <div className="announcement-banner">
                  Stay updated with important news, reminders, and university updates.
                </div>

                {/* Enhanced Search and Sort Controls */}
                <div className="announcement-controls">
                  <div className="announcement-search">
                    <div className="search-input-container">
                      <FontAwesomeIcon icon={faSearch} className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search announcements..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                        aria-label="Search announcements"
                      />
                      {searchTerm && (
                        <button 
                          className="search-clear-button" 
                          onClick={clearSearch}
                          aria-label="Clear search"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="sort-controls">
                    <span className="sort-label">Sort by: </span>
                    <button 
                      onClick={() => requestSort('startDate')}
                      className={`sort-button ${sortConfig.key === 'startDate' ? 'active' : ''}`}
                      aria-label="Sort by date"
                    >
                      Date
                      {sortConfig.key === 'startDate' && (
                        <FontAwesomeIcon 
                          icon={sortConfig.direction === 'asc' ? faArrowUp : faArrowDown} 
                          className="sort-icon" 
                        />
                      )}
                    </button>
                    <button 
                      onClick={() => requestSort('subject')}
                      className={`sort-button ${sortConfig.key === 'subject' ? 'active' : ''}`}
                      aria-label="Sort by title"
                    >
                      Title
                      {sortConfig.key === 'subject' && (
                        <FontAwesomeIcon 
                          icon={sortConfig.direction === 'asc' ? faArrowUp : faArrowDown} 
                          className="sort-icon" 
                        />
                      )}
                    </button>
                  </div>
                </div>

                {/* Loading and Error States */}
                {loading && (
                  <div className="announcement-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading announcements...</p>
                  </div>
                )}

                {error && (
                  <div className="announcement-error">
                    <p>{error}</p>
                    <button 
                      onClick={() => fetchAnnouncements()}
                      className="retry-button"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* Announcement List */}
                {!loading && !error && (
                  <>
                    <div className="announcement-list">
                      {announcements.length > 0 ? (
                        announcements.map(announcement => (
                          <div className="announcement-item" key={announcement._id}>
                            <div className="announcement-header">
                              <div className="announcement-uploader">
                                <div className="uploader-icon-container">
                                  <FontAwesomeIcon icon={faBullhorn} className="uploader-icon" />
                                </div>
                                <span className="uploader-name">{announcement.announcer}</span>
                              </div>
                              <h3 className="announcement-item-title">{announcement.subject}</h3>
                            </div>
                            <p className="announcement-item-content">
                              {announcement.content}
                            </p>
                            <div className="announcement-footer">
                              <span className="announcement-item-date">
                                Posted: {formatDate(announcement.startDate)}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-announcements">
                          <FontAwesomeIcon icon={faBell} className="no-data-icon" />
                          <p>No active announcements found</p>
                          {searchTerm && (
                            <button className="clear-search-button" onClick={clearSearch}>
                              Clear Search
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                  {/* Enhanced Pagination Controls */}
                  {announcements.length > 0 && totalPages > 1 && (
                    <div className="announcement-pagination">
                      <button
                        onClick={() => {
                          const newPage = Math.max(currentPage - 1, 1);
                          setCurrentPage(newPage);
                        }}
                        disabled={currentPage === 1}
                        className="pagination-button"
                        aria-label="Previous page"
                      >
                        Back
                      </button>
                      
                      <div className="pagination-info">
                        <span>{currentPage} of {totalPages}</span>
                      </div>
                      
                      <button
                        onClick={() => {
                          const newPage = Math.min(currentPage + 1, totalPages);
                          setCurrentPage(newPage);
                        }}
                        disabled={currentPage === totalPages}
                        className="pagination-button"
                        aria-label="Next page"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
        </div>
        {/* Add overlay to close sidebar when clicking outside */}
        {sidebarOpen && (
          <div className="sidebar-overlay active" onClick={toggleSidebar}></div>
        )}
      </div>
    </SessionManager>
  );
}

export default ScopeAnnouncement;