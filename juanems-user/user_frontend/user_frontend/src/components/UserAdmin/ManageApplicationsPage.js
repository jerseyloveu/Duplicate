import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { PiStudentFill } from "react-icons/pi";
import { FaClipboardList } from "react-icons/fa";
import { MdViewTimeline } from "react-icons/md";
import { BsFillFileEarmarkCheckFill } from "react-icons/bs";
import { FaClock } from "react-icons/fa6";

import React from 'react';
import CardModule from "./CardModule";
import Footer from './Footer';
import Header from './Header';

import { useNavigate } from "react-router-dom";
import '../../css/UserAdmin/Global.css';

const ManageApplicationsPage = () => {
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
        <p className="heading">Manage Applications</p>
      </div>
      <div className='content-process'>
        <div className='card-container'>
          <CardModule
            title="Manage Student Applications"
            description="Review and process incoming applications"
            // path="/admin/manage-student-schedule"
            icon={PiStudentFill}
          />
          <CardModule
              title="Manage Exam and Interview Schedules"
              description="Schedule Coordination"
              // path="/admin/manage-faculty-schedule"
              icon={FaClock}
            />
            <CardModule
              title="Manage Exam and Interview Results"
              description="Result Processing"
              // path="/admin/manage-faculty-schedule"
              icon={BsFillFileEarmarkCheckFill}
            />
             <CardModule
              title="Manage Enrollment Period"
              description="Manage start and end of enrollment"
              // path="/admin/manage-faculty-schedule"
              icon={MdViewTimeline}
            />
          </div>
      </div>
    </div>
    <Footer />
  </div>
  )
}

export default ManageApplicationsPage
