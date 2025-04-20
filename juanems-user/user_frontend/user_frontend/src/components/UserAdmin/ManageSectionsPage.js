import { Button, DatePicker, Input, Table, Tag, message } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BiExport } from 'react-icons/bi';
import { FaPen, FaPlus, FaSearch, FaTrashAlt } from 'react-icons/fa';
import { FiFilter } from 'react-icons/fi';
import { HiOutlineRefresh } from 'react-icons/hi';
import { MdOutlineKeyboardArrowLeft } from 'react-icons/md';

import '../../css/UserAdmin/Global.css';
import '../../css/UserAdmin/ManageSections.css';

import Footer from './Footer';
import Header from './Header';

dayjs.extend(utc);
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

const ManageSectionsPage = () => {
    const navigate = useNavigate();

    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [tableFilters, setTableFilters] = useState({});
    const [sorter, setSorter] = useState({});

    // Fetch sections
    const fetchSections = async (search = '') => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/sections');
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
                    item.sectionName?.toLowerCase().includes(search.toLowerCase()) ||
                    item.gradeLevel?.toLowerCase().includes(search.toLowerCase()) ||
                    item.strand?.toLowerCase().includes(search.toLowerCase()) ||
                    item.capacity?.toLowerCase().includes(search.toLowerCase()) ||
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
            console.error('Error fetching sections:', error);
            setDataSource([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSections(); // Initial fetch on page load
    }, []);


    const handleExport = () => {
        const currentDate = new Date().toISOString().split('T')[0];
        const fileName = `sections-report-${currentDate}.pdf`;

        fetch('http://localhost:5000/api/admin/export/sections', {
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
            })
            .catch(error => {
                console.error('Export failed:', error);
            });
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        fetchSections(value);
    };

    const handleClearFilters = () => {
        setTableFilters({});
        setSorter({});
        setSearchTerm('');
        fetchSections('');
    };

    const handleBack = () => navigate('/admin/manage-program');
    const handleCreate = () => navigate('/admin/manage-sections/create');

    const handleDelete = async (sectionName) => {
        try {
            // Confirm deletion
            const confirmDelete = window.confirm('Are you sure you want to delete this section?');
            if (!confirmDelete) return;

            // API call to delete the section
            const response = await fetch(`http://localhost:5000/api/admin/sections/${sectionName}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle error scenarios
                return message.error(data.message || 'Failed to delete section');
            }

            fetchSections();
            // If the deletion is successful, refresh the data or update the table
            message.success('Section deleted successfully!');
        } catch (error) {
            console.error('Error deleting section:', error);
            message.error(error.message || 'Failed to delete section. Please try again.');
        }
    };

    // Table column definitions
    const columns = [
        {
            title: 'Section Name',
            width: 120,
            dataIndex: 'sectionName',
            key: 'sectionName',
            fixed: 'left',
            sorter: (a, b) => a.sectionName.localeCompare(b.sectionName),
            sortDirections: ['ascend', 'descend'],
            sortOrder: sorter.columnKey === 'sectionName' ? sorter.order : null,
            defaultSortOrder: 'descend',
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
            title: 'Capacity.',
            width: 120,
            dataIndex: 'capacity',
            key: 'capacity',
            sorter: (a, b) => a.capacity.localeCompare(b.capacity),
            sortDirections: ['ascend', 'descend'],
            sortOrder: sorter.columnKey === 'capacity' ? sorter.order : null,
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
                        onClick={() => navigate(`/admin/manage-sections/edit/${record.key}`)}
                    >
                        Edit
                    </Button>

                    <Button
                        icon={<FaTrashAlt />}
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
                    <p className="heading">Manage Sections</p>
                </div>

                {/* Table controls */}
                <div className="table-functions">
                    <div className="left-tools">
                        <Button icon={<FiFilter />} onClick={handleClearFilters}>Clear Filter</Button>
                        <Button icon={<HiOutlineRefresh />} onClick={() => fetchSections(searchTerm)}>Refresh</Button>
                        <Button icon={<BiExport />} onClick={handleExport}>Export</Button>
                    </div>
                    <div className="right-tools">
                        <Input
                            placeholder="Search Section"
                            allowClear
                            style={{ width: 300 }}
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            suffix={<FaSearch style={{ color: '#aaa' }} />}
                        />
                        <Button type="ghost" className="create-btn" icon={<FaPlus />} onClick={handleCreate}>
                            Create Section
                        </Button>
                    </div>
                </div>

                {/* Sections table */}
                <Table
                    style={{ width: '100%', flex: 1 }} 
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

export default ManageSectionsPage
