import { AiFillSchedule } from "react-icons/ai";
import { FaLayerGroup, FaPen, FaStamp, FaUser } from "react-icons/fa";
import { FaMoneyCheckDollar, FaPersonWalkingDashedLineArrowRight } from "react-icons/fa6";
import { IoDocuments } from "react-icons/io5";
import { MdOutlineSecurity, MdTableChart } from "react-icons/md";

import React from 'react';
import '../../css/UserAdmin/DashboardPage.css';
import '../../css/UserAdmin/Global.css';
import '../../css/UserAdmin/NoticeBoardStyles.css';
import CardModule from './CardModule';
import NoticeBoard from './NoticeBoard';
import Footer from './Footer';
import Header from './Header';

const Dashboard = () => {
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });


  return (
    <div className="main main-container">
      <Header />
      <div className="main-content">
        <div className='content-announcement'>
          <div className='announcement-left'>
            <p className='heading'>Dashboard</p>
            <p className='date'>{formattedDate}</p>
          </div>
          <div className='announcement-right'>
            <NoticeBoard />
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