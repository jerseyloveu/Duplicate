import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, List, Skeleton, Form, message, Input, DatePicker, Select, Divider, Card, Typography, Badge, Tag, Tooltip, Radio} from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';

import { MdOutlineKeyboardArrowLeft } from 'react-icons/md';
import { FaUser, FaEye } from "react-icons/fa";
import { PlusOutlined, ClockCircleOutlined, TeamOutlined, BookOutlined } from '@ant-design/icons';

import '../../css/UserAdmin/Global.css';
import '../../css/UserAdmin/CreateAnnouncement.css';

import Footer from './Footer';
import Header from './Header';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

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
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
    }

    const fullName = localStorage.getItem('fullName') || 'Administrator';
    setUserName(fullName);
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
      <div className="load-more-container">
        <Button onClick={onLoadMore} type="default" size="middle">
          Load More
        </Button>
      </div>
    ) : null;

  const handleBack = () => navigate('/admin/dashboard');

  const handleCreateAnnouncement = () => {
    message.info('Create a new announcement');
  };

  const handlePreview = () => {
    form.validateFields().then(values => {
      setPreviewData(values);
      setShowPreview(true);
    }).catch(info => {
      message.error('Please fill in all required fields before preview');
    });
  };

  const handleClearForm = () => {
    form.resetFields();
    setShowPreview(false);
    message.success('Form cleared successfully');
  };

  const handleSubmit = (values) => {
    console.log('Submitted values:', values);
    message.success('Announcement posted successfully!');
    form.resetFields();
    setShowPreview(false);
  };

  const getAudienceColor = (audience) => {
    const colors = {
      'Applicants': 'blue',
      'Students': 'green',
      'Staffs': 'orange',
      'Faculty': 'purple',
      'Admissions': 'cyan',
      'Registrar': 'magenta',
      'Accounting': 'gold',
      'IT': 'geekblue',
      'Administration': 'red',
      'All Users': 'volcano'
    };
    return colors[audience] || 'default';
  };

  const renderAudienceTag = (audience) => {
    return <Tag color={getAudienceColor(audience)}>{audience}</Tag>;
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
          <div className='column announcement-sidebar'>
            <Card
              title="Recent Announcements"
              bordered={false}
              className='announcement-list-card'
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateAnnouncement}
                  size="small"
                >
                  New
                </Button>
              }
            >
              <div className='announcement-list-scroll'>
                <List
                  className="announcement-list"
                  loading={initLoading}
                  itemLayout="horizontal"
                  loadMore={loadMore}
                  dataSource={list}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Tooltip title="Archive">
                          <Button type="text" size="small">Archive</Button>
                        </Tooltip>
                      ]}
                      className="announcement-list-item"
                    >
                      <Skeleton avatar title={false} loading={item.loading} active>
                        <List.Item.Meta
                          avatar={<Avatar src={item.avatar} />}
                          title={
                            <div className="announcement-item-header">
                              <Text strong>{item.name}</Text>
                              <Badge status="processing" text={<Text type="secondary" style={{ fontSize: '12px' }}>Active</Text>} />
                            </div>
                          }
                          description={
                            <div className="announcement-item-content">
                              <Paragraph ellipsis={{ rows: 2 }}>
                                Ant Design, a design language for background applications, is refined by Ant UED Team
                              </Paragraph>
                              <div className="announcement-item-meta">
                                <Tag color="blue">Students</Tag>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  <ClockCircleOutlined /> Expires in 3 days
                                </Text>
                              </div>
                            </div>
                          }
                        />
                      </Skeleton>
                    </List.Item>
                  )}
                />
              </div>
            </Card>
          </div>
          
          <div className='column announcement-form-container'>
            <Card 
              bordered={false} 
              className='write-announcement-card'
              title={
                <div className="announcement-postedby">
                  <Avatar icon={<FaUser />} style={{ backgroundColor: '#1890ff' }} />
                  <div className="announcement-postedby-descrip">
                    <Text strong style={{ fontSize: '16px' }}>{userName}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Administrator</Text>
                  </div>
                </div>
              }
            >
              {!showPreview ? (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  className="announcement-form"
                >
                  <Form.Item
                    label="Subject"
                    name="subject"
                    rules={[{ required: true, message: 'Please input the subject!' }]}
                  >
                    <Input placeholder="Enter announcement subject" />
                  </Form.Item>

                  <div className="form-row">
                    <Form.Item
                      label="Target Audience"
                      name="audience"
                      rules={[{ required: true, message: 'Please select an audience!' }]}
                      className="audience-selector"
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
                        onChange={(value) => setShowPrioritySelector(value === 'Staffs' || value === 'Admissions' || value === 'Registrar' || value === 'Accounting' || value === 'IT' || value === 'Administration')}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Active Period"
                      name="dateRange"
                      rules={[{ required: true, message: 'Please enter date range!' }]}
                      className="date-range-picker"
                    >
                      <DatePicker.RangePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </div>
                  
                  {showPrioritySelector && (
                    <Form.Item
                      label="Priority Level"
                      name="priority"
                      rules={[{ required: true, message: 'Please select a priority level!' }]}
                      className="priority-selector"
                    >
                      <Radio.Group buttonStyle="solid">
                        <Radio.Button value="important" className="priority-important">
                          <Badge color="#f5222d" text="Important" />
                        </Radio.Button>
                        <Radio.Button value="urgent" className="priority-urgent">
                          <Badge color="#fa8c16" text="Urgent" />
                        </Radio.Button>
                        <Radio.Button value="info" className="priority-info">
                          <Badge color="#1890ff" text="Info" />
                        </Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  )}

                  <Form.Item
                    label="Content"
                    name="content"
                    rules={[{ required: true, message: 'Please enter content!' }]}
                  >
                    <TextArea rows={8} placeholder="Write your announcement here..." />
                  </Form.Item>

                  <div className="form-actions">
                    <Button onClick={handleClearForm}>Clear</Button>
                    <Button onClick={handlePreview} icon={<FaEye />}>Preview</Button>
                    <Button type="primary" htmlType="submit">Post Announcement</Button>
                  </div>
                </Form>
              ) : (
                <div className="announcement-preview">
                  <div className="preview-header">
                    <Title level={4}>{previewData.subject}</Title>
                    <div className="preview-meta">
                      {previewData.audience && renderAudienceTag(previewData.audience)}
                      {previewData.audience === 'Staffs' && previewData.priority && (
                        <Tag color={
                          previewData.priority === 'important' ? 'red' : 
                          previewData.priority === 'urgent' ? 'orange' : 'blue'
                        }>
                          {previewData.priority.charAt(0).toUpperCase() + previewData.priority.slice(1)}
                        </Tag>
                      )}
                      {previewData.dateRange && (
                        <Text type="secondary">
                          <ClockCircleOutlined /> {previewData.dateRange[0].format('MMM DD, YYYY')} - {previewData.dateRange[1].format('MMM DD, YYYY')}
                        </Text>
                      )}
                    </div>
                  </div>
                  <Divider />
                  <div className="preview-content">
                    <Paragraph>
                      {previewData.content}
                    </Paragraph>
                  </div>
                  <Divider />
                  <div className="preview-actions">
                    <Button onClick={() => setShowPreview(false)}>Edit</Button>
                    <Button type="primary" onClick={() => handleSubmit(previewData)}>Confirm & Post</Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateAnnouncementsPage;