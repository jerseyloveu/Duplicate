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

import Footer from './Footer';
import Header from './Header';

dayjs.extend(utc);
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

const ManageStrandsPage = () => {
    const navigate = useNavigate();

    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [tableFilters, setTableFilters] = useState({});
    const [sorter, setSorter] = useState({});

    const fetchStrands = async (search = '') => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/strands');
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
                    item.strandCode.toLowerCase().includes(search.toLowerCase()) ||
                    item.strandName.toLowerCase().includes(search.toLowerCase()) ||
                    item.status.toLowerCase().includes(search.toLowerCase()) ||
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
            console.error('Error fetching strands:', error);
            setDataSource([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStrands(); // Initial fetch on page load
    }, []);

    const handleSearch = (value) => {
        setSearchTerm(value);
        fetchStrands(value);
    };

    const handleClearFilters = () => {
        setTableFilters({});
        setSorter({});
        setSearchTerm('');
        fetchStrands('');
    };


    const handleExport = () => {
        // Get the current date in YYYY-MM-DD format
        const currentDate = new Date().toISOString().split('T')[0];
        const fileName = `strands-report-${currentDate}.pdf`;

        // Get values from localStorage without parsing as JSON
        const fullName = localStorage.getItem('fullName');
        const role = localStorage.getItem('role');
        const userID = localStorage.getItem('userID');

        fetch('http://localhost:5000/api/admin/export/strands', {
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
                    detail: `Exported strands report: ${fileName}`
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

    const handleDelete = async (_id) => {
        try {
            // Confirm deletion
            const confirmDelete = window.confirm('Are you sure you want to delete this strand?');
            if (!confirmDelete) return;

            // Fetch strand details first for logging
            const strandRes = await fetch(`http://localhost:5000/api/admin/strands/${_id}`);
            if (!strandRes.ok) {
                return message.error('Failed to fetch strand details for logging.');
            }

            const { data: strand } = await strandRes.json();
            const { strandCode, strandName } = strand;

            // Proceed with deletion
            const response = await fetch(`http://localhost:5000/api/admin/strands/${_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return message.error(data.message || 'Failed to delete strand');
            }

            // Log the deletion
            const adminID = localStorage.getItem('userID');
            const adminName = localStorage.getItem('fullName');
            const adminRole = localStorage.getItem('role');

            const logData = {
                userID: adminID,
                accountName: adminName,
                role: adminRole,
                action: 'Delete',
                detail: `Deleted strand [${strandCode}] - ${strandName}`,
            };

            await fetch('http://localhost:5000/api/admin/system-logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logData)
            });

            // Refresh and notify
            fetchStrands();
            message.success('Strand deleted successfully!');
        } catch (error) {
            console.error('Error deleting strand:', error);
            message.error(error.message || 'Failed to delete strand. Please try again.');
        }
    };

    const handleBack = () => navigate('/admin/manage-program');
    const handleCreate = () => navigate('/admin/manage-strands/create');

    // Table column definitions
    const columns = [
        {
            title: 'Strand Code',
            width: 200,
            dataIndex: 'strandCode',
            key: 'strandCode',
            sorter: (a, b) => a.strandCode.localeCompare(b.strandCode),
            sortDirections: ['ascend', 'descend'],
            sortOrder: sorter.columnKey === 'strandCode' ? sorter.order : null,
        },
        {
            title: 'Strand Name',
            width: 200,
            dataIndex: 'strandName',
            key: 'strandName',
            sorter: (a, b) => a.strandName.localeCompare(b.strandName),
            sortDirections: ['ascend', 'descend'],
            sortOrder: sorter.columnKey === 'strandName' ? sorter.order : null,
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
                    <Button
                        icon={<FaPen />}
                        style={{ width: '150px', margin: '0 auto', display: 'flex', justifyContent: 'flex-start' }}
                        onClick={() => navigate(`/admin/manage-strands/edit/${record.key}`)}
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
                    <p className="heading">Manage Strands</p>
                </div>

                {/* Table controls */}
                <div className="table-functions">
                    <div className="left-tools">
                        <Button icon={<FiFilter />} onClick={handleClearFilters}>Clear Filter</Button>
                        <Button icon={<HiOutlineRefresh />} onClick={() => fetchStrands(searchTerm)}>Refresh</Button>
                        <Button icon={<BiExport />} onClick={handleExport}>Export</Button>
                    </div>
                    <div className="right-tools">
                        <Input
                            placeholder="Search Strand"
                            allowClear
                            style={{ width: 300 }}
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            suffix={<FaSearch style={{ color: '#aaa' }} />}
                        />
                        <Button type="ghost" className="create-btn" icon={<FaPlus />} onClick={handleCreate}>
                            Create Strand
                        </Button>
                    </div>
                </div>


                {/* Strands table */}
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

export default ManageStrandsPage
