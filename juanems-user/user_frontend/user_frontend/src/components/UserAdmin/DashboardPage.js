import { AiFillSchedule } from "react-icons/ai";
import { FaLayerGroup, FaPen, FaStamp, FaUser } from "react-icons/fa";
import { FaMoneyCheckDollar, FaPersonWalkingDashedLineArrowRight } from "react-icons/fa6";
import { IoDocuments } from "react-icons/io5";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight, MdOutlineSecurity, MdTableChart } from "react-icons/md";

import React from 'react';
import '../../css/UserAdmin/DashboardPage.css';
import '../../css/UserAdmin/Global.css';
import CardModule from './CardModule';
import Footer from './Footer';
import Header from './Header';

const Dashboard = () => {
  return (
    <div className="main main-container">
      <Header />
      <div className="main-content">
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
                  <MdOutlineKeyboardArrowLeft />
                  <MdOutlineKeyboardArrowRight />
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
              path="/admin/manage-applications"
              icon={IoDocuments}
            />
            <CardModule
              title="Manage Accounts"
              description="Manage JuanIS Student Accounts"
              path="/admin/manage-accounts"
              icon={FaUser}
            />
            <CardModule
              title="Manage Student Records"
              description="View and update student academic records"
              path="/admin/manage-student-records"
              icon={FaLayerGroup}
            />
            <CardModule
              title="Manage Enrollment"
              description="Oversee and process student enrollment statuses"
              path="/admin/manage-enrollment"
              icon={FaStamp}
            />
            <CardModule
              title="Manage Schedule"
              description="Set and adjust class schedules and timetables"
              path="/admin/manage-schedule"
              icon={AiFillSchedule}
            />
            <CardModule
              title="Manage Program"
              description="Configure degree programs and course structures"
              path="/admin/manage-program"
              icon={MdTableChart}
            />
            <CardModule
              title="Manage Payments"
              description="Control and update payment system"
              path="/admin/manage-payments"
              icon={FaMoneyCheckDollar}
            />
            <CardModule
              title="Manage Queue"
              description="Control and update queuing system"
              path="/admin/manage-queue"
              icon={FaPersonWalkingDashedLineArrowRight}
            />
            <CardModule
              title="Overall System Logs"
              description="Monitor logins, account updates, and system changes."
              path="/admin/manage-overall-system-logs"
              icon={MdOutlineSecurity}
            />
            <CardModule
              title="Create Announcements"
              description="Post important updates for students and staff"
              path="/admin/create-announcements"
              icon={FaPen}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
