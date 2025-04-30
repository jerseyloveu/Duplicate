import { Button, DatePicker, Input, message, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BiExport } from 'react-icons/bi';
import { FaPen, FaPlus, FaSearch } from 'react-icons/fa';
import { FiFilter } from 'react-icons/fi';
import { FaTrashAlt } from "react-icons/fa";
import { HiOutlineRefresh } from 'react-icons/hi';
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";

import '../../css/UserAdmin/Global.css';
import '../../css/UserAdmin/ManageSubjectsPage.css';

import Footer from './Footer';
import Header from './Header';

dayjs.extend(utc);
dayjs.extend(isBetween);

const { RangePicker } = DatePicker

const ManageSubjectsPage = () => {
    const navigate = useNavigate();

    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [tableFilters, setTableFilters] = useState({});
    const [sorter, setSorter] = useState({});

    // Fetch subjects
    const fetchSubjects = async (search = '') => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/subjects');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();

            const filteredData = result.data.filter(item => {
                const createdAtFormatted = dayjs(item.createdAt).isValid()
                    ? dayjs(item.createdAt).format('MMM D, YYYY h:mm A').toLowerCase()
                    : '';
                const updatedAtFormatted = dayjs(item.updatedAt).isValid()
                    ? dayjs(item.updatedAt).format('MMM D, YYYY h:mm A').toLowerCase()
                    : '';

                return (
                    item.subjectID?.toLowerCase().includes(search.toLowerCase()) ||
                    item.subjectCode?.toLowerCase().includes(search.toLowerCase()) ||
                    item.subjectName?.toLowerCase().includes(search.toLowerCase()) ||
                    item.classification?.toLowerCase().includes(search.toLowerCase()) ||
                    item.strand?.toLowerCase().includes(search.toLowerCase()) ||
                    item.term?.toLowerCase().includes(search.toLowerCase()) ||
                    item.gradeLevel?.toLowerCase().includes(search.toLowerCase()) ||
                    item.status?.toLowerCase().includes(search.toLowerCase()) ||
                    createdAtFormatted.includes(search.toLowerCase()) ||
                    updatedAtFormatted.includes(search.toLowerCase())
                );
            });

            const formattedData = filteredData.map((item, index) => ({
                ...item,
                key: item._id || index,
            }));

            setDataSource(formattedData);
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setDataSource([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects(); // Initial fetch on page load
    }, []);

    const handleExport = () => {
        const currentDate = new Date().toISOString().split('T')[0];
        const fileName = `subjects-report-${currentDate}.pdf`;

        // Get values from localStorage without parsing as JSON
        const fullName = localStorage.getItem('fullName');
        const role = localStorage.getItem('role');
        const userID = localStorage.getItem('userID');

        fetch('http://localhost:5000/api/admin/export/subjects', {
            method: 'GET',
        })
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();

                // After successful export, log the action
                const logData = {
                    userID: userID,
                    accountName: fullName,
                    role: role,
                    action: 'Export',
                    detail: `Exported subjects report: ${fileName}`
                };

                // Make API call to save the system log
                fetch('http://localhost:5000/api/admin/system-logs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(logData)
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('System log recorded:', data);
                    })
                    .catch(error => {
                        console.error('Failed to record system log:', error);
                    });
            })
            .catch(error => {
                console.error('Export failed:', error);
            });
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        fetchSubjects(value);
    };

    const handleClearFilters = () => {
        setTableFilters({});
        setSorter({});
        setSearchTerm('');
        fetchSubjects('');
    };

    const handleBack = () => navigate('/admin/manage-program');
    const handleCreate = () => navigate('/admin/manage-subjects/create');

    
    const handleDelete = async (subjectID) => {
        try {
            const confirmDelete = window.confirm('Are you sure you want to delete this subject?');
            if (!confirmDelete) return;
    
            // Step 1: Fetch subject details for logging
            const subjectRes = await fetch(`http://localhost:5000/api/admin/subjects/${subjectID}`);
            if (!subjectRes.ok) {
                return message.error('Failed to fetch subject details for logging.');
            }
    
            const { data: subject } = await subjectRes.json();
            const { subjectCode, subjectName } = subject;
    
            // Step 2: Proceed with deletion
            const response = await fetch(`http://localhost:5000/api/admin/subjects/${subjectID}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                return message.error(data.message || 'Failed to delete subject');
            }
    
            // Step 3: Log deletion to system logs
            const adminID = localStorage.getItem('userID');
            const adminName = localStorage.getItem('fullName');
            const adminRole = localStorage.getItem('role');
    
            const logDetail = `Deleted subject "${subjectName}" (Code: ${subjectCode || 'N/A'})`;
    
            const logData = {
                userID: adminID,
                accountName: adminName,
                role: adminRole,
                action: 'Delete',
                detail: logDetail,
            };
    
            await fetch('http://localhost:5000/api/admin/system-logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logData),
            });
    
            // Step 4: Refresh table and notify
            fetchSubjects();
            message.success('Subject deleted successfully!');
        } catch (error) {
            console.error('Error deleting subject:', error);
            message.error(error.message || 'Failed to delete subject. Please try again.');
        }
    };
    

    // Table column definitions
    const columns = [
        {
            title: 'Subject Order',
            width: 120,
            dataIndex: 'subjectOrder',
            key: 'subjectOrder',
            fixed: 'left',
            sorter: (a, b) => a.subjectOrder.localeCompare(b.subjectOrder),
            sortDirections: ['ascend', 'descend'],
            sortOrder: sorter.columnKey === 'subjectOrder' ? sorter.order : null,
            defaultSortOrder: 'descend',
        },
        {
            title: 'Subject No.',
            width: 120,
            dataIndex: 'subjectID',
            key: 'subjectID',
            sorter: (a, b) => a.subjectID.localeCompare(b.subjectID),
            sortDirections: ['ascend', 'descend'],
            sortOrder: sorter.columnKey === 'subjectID' ? sorter.order : null,
        },
        {
            title: 'Subject Code',
            width: 120,
            dataIndex: 'subjectCode',
            key: 'subjectCode',
            sorter: (a, b) => a.subjectCode.localeCompare(b.subjectCode),
            sortDirections: ['ascend', 'descend'],
            sortOrder: sorter.columnKey === 'subjectCode' ? sorter.order : null,
        },
        {
            title: 'Subject Name',
            width: 120,
            dataIndex: 'subjectName',
            key: 'subjectName',
            sorter: (a, b) => a.subjectName.localeCompare(b.subjectName),
            sortDirections: ['ascend', 'descend'],
            sortOrder: sorter.columnKey === 'subjectName' ? sorter.order : null,
        },
        {
            title: 'Written Work',
            width: 120,
            dataIndex: 'writtenWork',
            key: 'writtenWork',
            sorter: (a, b) => a.writtenWork.localeCompare(b.writtenWork),
            sortDirections: ['ascend', 'descend'],
            sortOrder: sorter.columnKey === 'writtenWork' ? sorter.order : null,
        },
        {
            title: 'Performance Task',
            width: 120,
            dataIndex: 'performanceTask',
            key: 'performanceTask',
            sorter: (a, b) => a.performanceTask.localeCompare(b.performanceTask),
            sortDirections: ['ascend', 'descend'],
            sortOrder: sorter.columnKey === 'performanceTask' ? sorter.order : null,
        },
        {
            title: 'Quarterly Assessment',
            width: 120,
            dataIndex: 'quarterlyAssessment',
            key: 'quarterlyAssessment',
            sorter: (a, b) => a.quarterlyAssessment.localeCompare(b.quarterlyAssessment),
            sortDirections: ['ascend', 'descend'],
            sortOrder: sorter.columnKey === 'quarterlyAssessment' ? sorter.order : null,
        },
        {
            title: 'Classification',
            width: 120,
            dataIndex: 'classification',
            key: 'classification',
            filters: [
                { text: 'CORE', value: 'CORE' },
                { text: 'APPLIED', value: 'APPLIED' },
                { text: 'STRAND', value: 'STRAND' },
                { text: 'CVF', value: 'CVF' },
            ],
            onFilter: (value, record) => record.classification.includes(value),
            filteredValue: tableFilters.classification || null,
        },
        {
            title: 'Strand',
            width: 120,
            dataIndex: 'strand',
            key: 'strand',
            filters: [
                { text: 'STEM', value: 'STEM' },
                { text: 'ABM', value: 'ABM' },
                { text: 'HUMSS', value: 'HUMSS' },
                { text: 'TVL', value: 'TVL' },
            ],
            onFilter: (value, record) => record.strand.includes(value),
            filteredValue: tableFilters.strand || null,
        },
        {
            title: 'Term',
            width: 120,
            dataIndex: 'term',
            key: 'term',
            filters: [
                { text: '1st', value: '1st' },
                { text: '2nd', value: '2nd' },
            ],
            onFilter: (value, record) => record.term.includes(value),
            filteredValue: tableFilters.term || null,
        },
        {
            title: 'Grade Level',
            width: 120,
            dataIndex: 'gradeLevel',
            key: 'gradeLevel',
            filters: [
                { text: 'Grade 11', value: 'Grade 11' },
                { text: 'Grade 12', value: 'Grade 12' },
            ],
            onFilter: (value, record) => record.gradeLevel.includes(value),
            filteredValue: tableFilters.gradeLevel || null,
        },
        {
            title: 'Status',
            width: 100,
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Active', value: 'Active' },
                { text: 'Inactive', value: 'Inactive' },
            ],
            onFilter: (value, record) => record.status.includes(value),
            filteredValue: tableFilters.status || null,
            render: (status) => (
                <Tag color={status === 'Active' ? 'green' : 'volcano'}>{status}</Tag>
            ),
        },
        {
            title: 'Created At',
            width: 180,
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => {
                const date = dayjs(text);
                return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : 'Invalid Date';
            },
            sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
            sortOrder: sorter.columnKey === 'createdAt' ? sorter.order : null,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <DateRangeFilter selectedKeys={selectedKeys} setSelectedKeys={setSelectedKeys} confirm={confirm} clearFilters={clearFilters} />
            ),
            onFilter: (value, record) => isInDateRange(value, record.createdAt),
            filteredValue: tableFilters.createdAt || null,
        },
        {
            title: 'Updated At',
            width: 180,
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (text) => {
                const date = dayjs(text);
                return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : 'Invalid Date';
            },
            sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
            sortOrder: sorter.columnKey === 'updatedAt' ? sorter.order : null,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <DateRangeFilter selectedKeys={selectedKeys} setSelectedKeys={setSelectedKeys} confirm={confirm} clearFilters={clearFilters} />
            ),
            onFilter: (value, record) => isInDateRange(value, record.updatedAt),
            filteredValue: tableFilters.updatedAt || null,
        },
        {
            title: 'Action',
            key: 'action',
            fixed: 'right',
            width: 280,
            render: (_, record) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Edit Button */}
                    <Button
                        icon={<FaPen />}
                        style={{
                            width: '150px',
                            margin: '0 auto',
                            display: 'flex',
                            justifyContent: 'flex-start'
                        }}
                        onClick={() => navigate(`/admin/manage-subjects/edit/${record.key}`)}
                    >
                        Edit
                    </Button>
        
                    <Button
                        icon={<FaTrashAlt/>}
                        danger
                        style={{
                            width: '150px',
                            margin: '0 auto',
                            display: 'flex',
                            justifyContent: 'flex-start'
                        }}
                        onClick={() => handleDelete(record.key)} 
                    >
                        Delete
                    </Button>
                </div>
            )
        }
    ];

    // Reusable date range filter component
    const DateRangeFilter = ({ selectedKeys, setSelectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
            <RangePicker
                style={{ width: 250 }}
                value={selectedKeys[0] ? [dayjs(selectedKeys[0].split('|')[0]), dayjs(selectedKeys[0].split('|')[1])] : []}
                onChange={(dates) => {
                    setSelectedKeys(dates ? [`${dates[0].toISOString()}|${dates[1].toISOString()}`] : []);
                }}
            />
            <div style={{ marginTop: 8 }}>
                <Button type="primary" onClick={confirm}>Filter</Button>
                <Button onClick={() => { clearFilters(); confirm(); }} style={{ marginLeft: 8 }}>Reset</Button>
            </div>
        </div>
    );

    // Helper to check if record is in range
    const isInDateRange = (value, dateField) => {
        const [start, end] = value.split('|');
        const recordDate = dayjs(dateField);
        return recordDate.isValid() && recordDate.isBetween(dayjs(start), dayjs(end).endOf('day'), null, '[]');
    };

    return (
        <div className="main main-container">
            <Header />
            <div className="main-content">
                <div className="page-title">
                    <div className="arrows" onClick={handleBack}>
                        <MdOutlineKeyboardArrowLeft />
                    </div>
                    <p className="heading">Manage Subjects</p>
                </div>

                {/* Table controls */}
                <div className="table-functions">
                    <div className="left-tools">
                        <Button icon={<FiFilter />} onClick={handleClearFilters}>Clear Filter</Button>
                        <Button icon={<HiOutlineRefresh />} onClick={() => fetchSubjects(searchTerm)}>Refresh</Button>
                        <Button icon={<BiExport />} onClick={handleExport}>Export</Button>
                    </div>
                    <div className="right-tools">
                        <Input
                            placeholder="Search Subject"
                            allowClear
                            style={{ width: 300 }}
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            suffix={<FaSearch style={{ color: '#aaa' }} />}
                        />
                        <Button type="ghost" className="create-btn" icon={<FaPlus />} onClick={handleCreate}>
                            Create Subject
                        </Button>
                    </div>
                </div>

                {/* Subjects table */}
                <Table
                    style={{ width: '100%', flex: 1 }} // You can use any shade you want
                    columns={columns}
                    dataSource={Array.isArray(dataSource) ? dataSource : []}
                    loading={loading}
                    scroll={{ x: true }}
                    pagination
                    bordered
                    onChange={(pagination, filters, sorter) => {
                        setTableFilters(filters);
                        setSorter(sorter);
                    }}
                />

            </div>
            <Footer />
        </div>
    )
}

export default ManageSubjectsPage
