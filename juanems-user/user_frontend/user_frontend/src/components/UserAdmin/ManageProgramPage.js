import { FaUserGroup } from "react-icons/fa6";
import { MdBook, MdOutlineKeyboardArrowLeft, MdStars } from "react-icons/md";

import React from 'react';
import CardModule from "./CardModule";
import Footer from './Footer';
import Header from './Header';

import { useNavigate } from "react-router-dom";
import '../../css/UserAdmin/Global.css';

const ManageProgramPage = () => {
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
          <p className="heading">Manage Program</p>
        </div>
        <div className='content-process'>
          <div className='card-container'>
            <CardModule
              title="Manage Strands"
              description="Create and update academic strands"
              path="/admin/manage-strands"
              icon={MdStars}
            />
            <CardModule
              title="Manage Subjects"
              description="Assign and manage offered subjects"
              path="/admin/manage-subjects"
              icon={MdBook}
            />
            <CardModule
              title="Manage Sections"
              description="Set up and organize class sections"
              path="/admin/manage-sections"
              icon={FaUserGroup}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ManageProgramPage
