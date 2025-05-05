import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, List, Skeleton, Form, message, Input, Switch, DatePicker, Select, Divider } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';

import { MdOutlineKeyboardArrowLeft } from 'react-icons/md';
import { FaUser } from "react-icons/fa";
import { PlusOutlined } from '@ant-design/icons';

import '../../css/UserAdmin/Global.css';
import '../../css/UserAdmin/CreateAnnouncement.css';

import Footer from './Footer';
import Header from './Header';

dayjs.extend(utc);
dayjs.extend(isBetween);
const PAGE_SIZE = 3;

const CreateAnnouncementsPage = () => {
  const navigate = useNavigate();
  const [initLoading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [userName, setUserName] = useState('');
  const [form] = Form.useForm(); // Add form instance

   useEffect(() => {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/admin');
      }
  
      const fullName = localStorage.getItem('fullName') || '';
      setUserName(fullName)
    }, [navigate]);

  const fetchData = currentPage => {
    const fakeDataUrl = `https://660d2bd96ddfa2943b33731c.mockapi.io/api/users?page=${currentPage}&limit=${PAGE_SIZE}`;
    return fetch(fakeDataUrl).then(res => res.json());
  };
  
  useEffect(() => {
    fetchData(page).then(res => {
      const results = Array.isArray(res) ? res : [];
      setInitLoading(false);
      setData(results);
      setList(results);
    });
  }, []);
  
  const onLoadMore = () => {
    setLoading(true);
    setList(data.concat(Array.from({ length: PAGE_SIZE }).map(() => ({ loading: true }))));
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage).then(res => {
      const results = Array.isArray(res) ? res : [];
      const newData = data.concat(results);
      setData(newData);
      setList(newData);
      setLoading(false);
      window.dispatchEvent(new Event('resize'));
    });
  };
  
  const loadMore =
    !initLoading && !loading ? (
      <div
        style={{
          textAlign: 'center',
          marginTop: 12,
          height: 32,
          lineHeight: '32px',
        }}
      >
        <Button onClick={onLoadMore}>loading more</Button>
      </div>
    ) : null;

  const handleBack = () => navigate('/admin/dashboard');

  const handleCreateAnnouncement = () => {
    // You can add functionality here to create a new announcement
    // For example, reset the form or show a modal
    message.info('Create a new announcement');
  };

  // Function to clear all form fields
  const handleClearForm = () => {
    form.resetFields();
    message.success('Form cleared successfully');
  };

  return (
    <div className="main main-container">
      <Header />
      <div className="main-content">
        <div className="page-title">
          <div className="arrows" onClick={handleBack}>
            <MdOutlineKeyboardArrowLeft />
          </div>
          <p className="heading">Create Announcements</p>
        </div>
        <div className='container-columns'>
          <div className='column' style={{ flex: 1 }}>
            <div className='announcement-list' style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{
                flex: 1,
                overflow: 'auto',
                maxHeight: '500px',
                marginBottom: '16px',
                border: '1px solid #f0f0f0',
                borderRadius: '4px'
              }}>
                <List
                  className="demo-loadmore-list"
                  loading={initLoading}
                  itemLayout="horizontal"
                  loadMore={loadMore}
                  dataSource={list}
                  renderItem={item => (
                    <List.Item
                      actions={[<a key="list-loadmore-archive">Archive</a>]}
                    >
                      <Skeleton avatar title={false} loading={item.loading} active>
                        <List.Item.Meta
                          avatar={<Avatar src={item.avatar} />}
                          title={<a href="https://ant.design">{item.name}</a>}
                          description={
                            <div style={{
                              maxHeight: '40px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              Ant Design, a design language for background applications, is refined by Ant UED Team
                            </div>
                          }
                        />
                      </Skeleton>
                    </List.Item>
                  )}
                />
              </div>
              {/* Create Announcement Button */}
              <div style={{ marginBottom: '20px' }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateAnnouncement}
                  style={{ width: '100%' }}
                >
                  Create Announcement
                </Button>
              </div>
            </div>
          </div>
          <div className='column' style={{ flex: 3 }}>
            <div className='write-announcement'>
              <Form
                form={form} // Assign the form instance
                layout="vertical"
                onFinish={(values) => {
                  console.log('Submitted values:', values);
                  message.success('Announcement posted successfully!');
                  form.resetFields(); // Clear form after submission
                }}
              >
                <div className="write-announcement-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="announcement-postedby">
                    <div className="announcement-postedby-pfp">
                      <FaUser style={{ fontSize: '1.5rem', color: '#95a5a6' }} />
                    </div>
                    <div className="announcement-postedby-descrip">
                      <p className="announcement-postedby-name">{userName}</p>
                    </div>
                  </div>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <Form.Item
                  label="Subject"
                  name="subject"
                  rules={[{ required: true, message: 'Please input the subject!' }]}
                >
                  <Input placeholder="Enter announcement subject" />
                </Form.Item>

                <Form.Item
                  label="Audience"
                  name="audience"
                  style={{width: "30%"}}
                  rules={[{ required: true, message: 'Please select an audience!' }]}
                >
                  <Select
                    placeholder="Select the target audience"
                    options={[
                      { value: 'Applicants', label: 'Applicants' },
                      { value: 'Students', label: 'Students' },
                      { value: 'Staffs', label: 'Staffs' },
                      { value: 'Faculty', label: 'Faculty' },
                      { value: 'Admissions', label: 'Admissions Dept.' },
                      { value: 'Registrar', label: 'Registrar Dept.' },
                      { value: 'Accounting', label: 'Accounting Dept.' },
                      { value: 'IT', label: 'IT Dept.' },
                      { value: 'Administration', label: 'Administration Dept.' },
                      { value: 'All Users', label: 'All Users' },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Content"
                  name="content"
                  rules={[{ required: true, message: 'Please enter content!' }]}
                >
                  <Input.TextArea rows={5} placeholder="Write your announcement here..." />
                </Form.Item>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <Form.Item
                    label="Date Range"
                    name="dateRange"
                    rules={[{ required: true, message: 'Please enter date range!' }]}
                    style={{ marginBottom: 0, width: '60%' }}
                  >
                    <DatePicker.RangePicker style={{ width: '100%' }} />
                  </Form.Item>

                  <div className='buttons-container'>
                    <Button onClick={handleClearForm}>Clear</Button>
                    <Button type="primary" htmlType="submit">
                      Post Announcement
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default CreateAnnouncementsPage;