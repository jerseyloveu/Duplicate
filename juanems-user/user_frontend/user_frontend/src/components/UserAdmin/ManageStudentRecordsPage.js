import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { PiStudentFill } from "react-icons/pi";
import { FaClipboardList } from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";
import { FaUserCheck } from "react-icons/fa";
import { FaRankingStar } from "react-icons/fa6";
import { IoMdDocument } from "react-icons/io";

import React from 'react';
import CardModule from "./CardModule";
import Footer from './Footer';
import Header from './Header';

import { useNavigate } from "react-router-dom";
import '../../css/UserAdmin/Global.css';


const ManageStudentRecordsPage = () => {
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
            title="Manage Students"
            description="View and update student information"
            // path="/admin/manage-student-schedule"
            icon={FaUserGroup}
          />
         
         <CardModule
            title="Attendance Summary"
            description="Track and review attendance records"
            // path="/admin/manage-faculty-schedule"
            icon={IoMdDocument}
          />
           <CardModule
            title="Behavior Summary"
            description="Monitor and summarize student behavior"
            // path="/admin/manage-faculty-schedule"
            icon={IoMdDocument}
          />
           <CardModule
            title="Grade Summary"
            description=" View compiled grades by subject"
            // path="/admin/manage-faculty-schedule"
            icon={IoMdDocument}
          />
           <CardModule
            title="Enrollment Summary"
            description="View overall enrollment statistics"
            // path="/admin/manage-faculty-schedule"
            icon={IoMdDocument}
          />
           <CardModule
            title="Quarterly Ranking"
            description="Display student ranks per quarter"
            // path="/admin/manage-faculty-schedule"
            icon={FaRankingStar}
          />
           <CardModule
            title="Yearly Ranking"
            description="Show overall student rankings per year"
            // path="/admin/manage-faculty-schedule"
            icon={FaRankingStar}
          />
        </div>
      </div>
    </div>
    <Footer />
  </div>
  )
}

export default ManageStudentRecordsPage
