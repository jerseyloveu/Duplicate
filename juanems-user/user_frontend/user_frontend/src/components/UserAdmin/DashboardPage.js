// Dashboard.js
import React from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import '../../css/UserAdmin/DashboardPage.css';
import '../../css/UserAdmin/Global.css';
import Footer from './Footer';
import Header from './Header';
import CardModule from './CardModule';

const Dashboard = () => {
  return (
    <div className="main dashboard-container">
      <Header />
      <div className="dashboard-content">
        <div className='content-announcement'>
          <div className='announcement-left'>
            <p className='heading'>Dashboard</p>
            <p className='date'>Friday, February 11, 2025</p>
          </div>
          <div className='announcement-right'>
            <div className='noticeboard'>
              <div className='noticeboard-header'>
                <p className='subheading'>Notice Board</p>
                <div className='arrows'>
                  <LeftOutlined />
                  <RightOutlined />
                </div>
              </div>
              <div className='divider' />
              <p className='subheading'>Enrollment Period Extended to March 20, 2025</p>
              <p className='message'>Ensure all pending applications are thoroughly reviewed before the new deadline. This includes verifying submitted documents, checking for missing requirements, and updating applicant statuses accordingly. Admissions staff should prioritize applications that are nearing completion to avoid delays in processing.</p>
              <div className='postedby'>
                <div className='postedby-pfp'>
                  <img className='pfp' alt="Profile" />
                </div>
                <div className='postedby-descrip'>
                  <p className='postedby-name'>John Doe</p>
                  <p>January 24, 2025 10:25 am</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className='section-title'>PROCESS MANAGEMENT</p>
        <div className='content-process'>
          <div className='card-container'>
            <CardModule
              title="Manage Applications"
              description="Review, process, and track student applications"
              isActive={true}
            />
            <CardModule
              title="Manage Accounts"
              description="Manage JuanIS Student Accounts"
            />
            <CardModule
              title="Manage Student Accounts"
              description="Manage JuanIS Student Accounts"
            />
            <CardModule
              title="Manage Student Records"
              description="View and update student academic records"
              isInvisible={false}
            />
            <CardModule
              title="Manage Enrollment"
              description="Oversee and process student enrollment statuses"
              isInvisible={false}
            />
            <CardModule
              title="Manage Schedule"
              description="Set and adjust class schedules and timetables"
              isInvisible={false}
            />
            <CardModule
              title="Manage Program"
              description="Configure degree programs and course structures"
              isInvisible={false}
            />
            <CardModule
              title="Manage Payments"
              description="Control and update queuing system"
              isInvisible={false}
            />
            <CardModule
              title="Manage Queue"
              description="Control and update queuing system"
              isInvisible={false}
            />
            <CardModule
              title="Overall System Logs"
              description="Monitor logins, account updates, and system changes."
              isInvisible={false}
            />
            <CardModule
              title="Create Announcements"
              description="Post important updates for students and staff"
              isInvisible={false}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
