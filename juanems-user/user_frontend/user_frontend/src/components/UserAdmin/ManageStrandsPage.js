import { MdOutlineKeyboardArrowLeft } from "react-icons/md";

import React from 'react'
import Footer from './Footer';
import Header from './Header';

import { useNavigate } from "react-router-dom";
import '../../css/UserAdmin/Global.css';

const ManageStrandsPage = () => {
    const navigate = useNavigate();

    const handleBack = () => navigate('/admin/manage-program');

    return (
        <div className="main main-container">
            <Header />
            <div className="main-content">
                <div className="page-title">
                    <div className="arrows" onClick={handleBack}>
                        <MdOutlineKeyboardArrowLeft />
                    </div>
                    <p className="heading">Manage Strands</p>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default ManageStrandsPage
