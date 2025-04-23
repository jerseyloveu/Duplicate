import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { PiStudentFill } from "react-icons/pi";
import { FaClipboardList } from "react-icons/fa";

import React from 'react';
import CardModule from "./CardModule";
import Footer from './Footer';
import Header from './Header';

import { useNavigate } from "react-router-dom";
import '../../css/UserAdmin/Global.css';

const ManageSchedulePage = () => {
  const navigate = useNavigate();

  const handleBack = () => navigate('/admin/dashboard');

  return (
    <div className="main main-container">
      <Header />
      <div className="main-content">
        <div className="page-title">
          <div className="arrows" onClick={handleBack}>
            <MdOutlineKeyboardArrowLeft />
          </div>
          <p className="heading">Manage Schedule</p>
        </div>
        <div className='content-process'>
          <div className='card-container'>
            <CardModule
              title="Student Schedule"
              description="View and manage class schedules for students"
              path="/admin/manage-student-schedule"
              icon={PiStudentFill}
            />
            <CardModule
              title="Faculty Schedule"
              description="Access and update teaching schedules for faculty"
              path="/admin/manage-faculty-schedule"
              icon={FaClipboardList}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ManageSchedulePage
