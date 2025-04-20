import { Button, Input } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { BiExport } from 'react-icons/bi';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { FiFilter } from 'react-icons/fi';
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { HiOutlineRefresh } from 'react-icons/hi';

import '../../css/UserAdmin/Global.css';

import Footer from './Footer';
import Header from './Header';

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

                {/* Table controls */}
                <div className="table-functions">
                    <div className="left-tools">
                        <Button icon={<FiFilter />}>Clear Filter</Button>
                        <Button icon={<HiOutlineRefresh />}>Refresh</Button>
                        <Button icon={<BiExport />}>Export</Button>
                    </div>
                    <div className="right-tools">
                        <Input
                            placeholder="Search Strand"
                            allowClear
                            style={{ width: 300 }}
                            // value={searchTerm}
                            // onChange={(e) => handleSearch(e.target.value)}
                            suffix={<FaSearch style={{ color: '#aaa' }} />}
                        />
                        <Button type="ghost" className="create-btn" icon={<FaPlus />} >
                            Create Account
                        </Button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default ManageStrandsPage
