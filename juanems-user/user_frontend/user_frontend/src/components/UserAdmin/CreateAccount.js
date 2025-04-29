import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { Form, Input, Select, Button, message, Switch, Tabs, Card, Checkbox, Row, Col, Divider } from 'antd';
import React, { useEffect, useState } from 'react';
import { FaUser } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { LockOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from 'react-router-dom';
import { BookOutlined, CalendarOutlined, UsergroupAddOutlined, SettingOutlined, FileTextOutlined, ScheduleOutlined, DollarOutlined, FormOutlined, FolderOpenOutlined, LineChartOutlined, TeamOutlined } from '@ant-design/icons';

import Footer from './Footer';
import Header from './Header';
import '../../css/UserAdmin/CreateAccount.css';
import '../../css/UserAdmin/Global.css';
import '../../css/JuanScope/Register.css';

// Define module structures - copied from AccessControl.js
const admissionsModules = {
  'Manage Applications': [
    'Manage Student Applications',
    'Manage Exam and Interview Schedules',
    'Manage Exam and Interview Results',
    'Manage Enrollment Period',
  ],
  'Manage Accounts': [],
  'Create Announcements': [],
};

const registrarModules = {
  'Manage Student Records': [
    'Manage Students',
    'Attendance Summary',
    'Behavior Summary',
    'Grade Summary',
    'Enrollment Summary',
    'Quarterly Ranking',
    'Yearly Ranking',
  ],
  'Manage Enrollment': [],
  'Manage Schedule': [
    'Student Schedule',
    'Faculty Schedule',
  ],
  'Manage Program': [
    'Manage Strands',
    'Manage Subjects',
    'Manage Sections',
  ],
  'Manage Queue': [],
  'Create Announcements': [],
};

const accountingModules = {
  'Manage Payments': [
    'Manage Fees',
    'Payment History',
  ],
  'Manage Queue': [],
  'Create Announcements': [],
};

const subAdminModules = {
  'Manage Accounts': [],
  'Manage Schedule': [
    'Student Schedule',
    'Faculty Schedule',
  ],
  'Manage Program': [
    'Manage Strands',
    'Manage Subjects',
    'Manage Sections',
  ],
  'Manage Student Records': [
    'Manage Students',
    'Attendance Summary',
    'Behavior Summary',
    'Grade Summary',
    'Enrollment Summary',
    'Quarterly Ranking',
    'Yearly Ranking',
  ],
  'Manage Enrollment': [],
  'Manage Payments': [
    'Manage Fees',
    'Payment History',
  ],
  'Overall System Logs': [],
  'Create Announcements': [],
};

// Define all staff modules for the super admin
const allStaffModules = {
  'Manage Applications': [
    'Manage Student Applications',
    'Manage Exam and Interview Schedules',
    'Manage Exam and Interview Results',
    'Manage Enrollment Period',
  ],
  'Manage Accounts': [],
  'Create Announcements': [],
  'Manage Enrollment': [],
  'Manage Schedule': [
    'Student Schedule',
    'Faculty Schedule',
  ],
  'Overall System Logs': [],
  'Manage Payments': [
    'Manage Fees',
    'Payment History',
  ],
  'Manage Program': [
    'Manage Strands',
    'Manage Subjects',
    'Manage Sections',
  ],
  'Manage Queue': [],
  'Manage Student Records': [
    'Manage Students',
    'Attendance Summary',
    'Behavior Summary',
    'Grade Summary',
    'Enrollment Summary',
    'Quarterly Ranking',
    'Yearly Ranking',
  ],
};

const defaultRoleModules = {
  Faculty: {
    'Class Schedule': [],
    'Class Information': [],
    'Handling of Grades': [],
    'Viewing of OTE': [],
    'Teacher Documents': [],
  },
  Student: {
    'Student Handbook': [],
    'Certificate of Registration': [],
    'Flowchart': [],
    'Online Class Registration': [],
    'Viewing of Grades': [],
    'Class Schedule': [],
    'Online Teacher\'s Evaluation': [],
    'Student Ledger': [],
    'Enrollment': [],
    'Joining Queue': [],
    'Pay Bills': [],
  },
  'Admissions (Staff)': admissionsModules,
  'Registrar (Staff)': registrarModules,
  'Accounting (Staff)': accountingModules,
  'Administration (Sub-Admin)': subAdminModules,
  'IT (Super Admin)': allStaffModules,
};

const moduleIcons = {
  'Class Schedule': <CalendarOutlined style={{ color: '#C68A00' }} />,
  'Class Information': <BookOutlined style={{ color: '#C68A00' }} />,
  'Handling of Grades': <FormOutlined style={{ color: '#C68A00' }} />,
  'Viewing of OTE': <LineChartOutlined style={{ color: '#C68A00' }} />,
  'Teacher Documents': <FileTextOutlined style={{ color: '#C68A00' }} />,
  'Manage Applications': <UsergroupAddOutlined style={{ color: '#C68A00' }} />,
  'Manage Accounts': <TeamOutlined style={{ color: '#C68A00' }} />,
  'Manage Student Records': <FolderOpenOutlined style={{ color: '#C68A00' }} />,
  'Manage Enrollment': <FormOutlined style={{ color: '#C68A00' }} />,
  'Manage Schedule': <ScheduleOutlined style={{ color: '#C68A00' }} />,
  'Manage Program': <SettingOutlined style={{ color: '#C68A00' }} />,
  'Manage Payments': <DollarOutlined style={{ color: '#C68A00' }} />,
  'Manage Queue': <ScheduleOutlined style={{ color: '#C68A00' }} />,
  'Overall System Logs': <FileTextOutlined style={{ color: '#C68A00' }} />,
  'Create Announcements': <FileTextOutlined style={{ color: '#C68A00' }} />,
  'Student Handbook': <BookOutlined style={{ color: '#C68A00' }} />,
  'Certificate of Registration': <FileTextOutlined style={{ color: '#C68A00' }} />,
  'Flowchart': <FormOutlined style={{ color: '#C68A00' }} />,
  'Online Class Registration': <FormOutlined style={{ color: '#C68A00' }} />,
  'Viewing of Grades': <FormOutlined style={{ color: '#C68A00' }} />,
  'Online Teacher\'s Evaluation': <FormOutlined style={{ color: '#C68A00' }} />,
  'Student Ledger': <DollarOutlined style={{ color: '#C68A00' }} />,
  'Enrollment': <FormOutlined style={{ color: '#C68A00' }} />,
  'Joining Queue': <ScheduleOutlined style={{ color: '#C68A00' }} />,
  'Pay Bills': <DollarOutlined style={{ color: '#C68A00' }} />,
};

// Custom Access Form component
const CustomAccessForm = ({ role, selectedModules, setSelectedModules, hasCustomAccess }) => {
  const moduleGroups = defaultRoleModules[role] || {};

  const getAllModuleKeys = () =>
    Object.entries(moduleGroups).flatMap(([parent, subs]) => [parent, ...subs]);

  // Handle custom access toggle effect - this should only reset when hasCustomAccess changes
  useEffect(() => {
    if (!hasCustomAccess) {
      // If custom access is turned off, reset to default role permissions
      setSelectedModules(getAllModuleKeys());
    }
  }, [hasCustomAccess]);

  // Remove the useEffect that fetches role data

  const handleParentToggle = (parent, submodules) => {
    const isChecked = selectedModules.includes(parent);
    const updated = new Set(selectedModules);

    if (isChecked) {
      updated.delete(parent);
      submodules.forEach((sub) => updated.delete(sub));
    } else {
      updated.add(parent);
      submodules.forEach((sub) => updated.add(sub));
    }

    setSelectedModules(Array.from(updated));
  };

  const handleSubToggle = (parent, submodules, changedSub) => {
    const updated = new Set(selectedModules);

    // Toggle the changed submodule
    if (updated.has(changedSub)) {
      updated.delete(changedSub);
    } else {
      updated.add(changedSub);
    }

    // Check if the parent should be included (if any of its submodules are checked)
    const hasCheckedSubmodules = submodules.some((sub) => updated.has(sub));

    // If any submodule is checked, ensure the parent is also checked
    if (hasCheckedSubmodules) {
      updated.add(parent);
    } else {
      // If no submodules are checked, remove the parent
      updated.delete(parent);
    }

    setSelectedModules(Array.from(updated));
  };

  const isParentIndeterminate = (parent, submodules) => {
    const hasSome = submodules.some((sub) => selectedModules.includes(sub));
    const hasAll = submodules.every((sub) => selectedModules.includes(sub));
    return hasSome && !hasAll;
  };

  return (
    <div style={{ display: hasCustomAccess ? 'block' : 'none' }}>
      <Row gutter={[16, 16]}>
        {Object.entries(moduleGroups).map(([parent, submodules]) => (
          <Col key={parent} xs={24} sm={12} md={12} lg={6}>
            <Card
              title={
                <span style={{ color: 'white' }}>
                  {moduleIcons[parent] || <SettingOutlined style={{ color: '#C68A00' }} />} {parent}
                </span>
              }
              headStyle={{ backgroundColor: '#00245A', borderBottom: '1px solid #001d4a' }}
              bodyStyle={{ paddingTop: 12 }}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                height: '100%',
              }}
            >
              <Checkbox
                indeterminate={isParentIndeterminate(parent, submodules)}
                checked={selectedModules.includes(parent)}
                onChange={() => handleParentToggle(parent, submodules)}
                style={{ marginBottom: submodules.length > 0 ? 8 : 0 }}
              >
                <strong>{parent}</strong>
              </Checkbox>

              {submodules.length > 0 && (
                <div style={{ paddingLeft: 24 }}>
                  {submodules.map((sub) => (
                    <div key={sub} style={{ marginBottom: 4 }}>
                      <Checkbox
                        checked={selectedModules.includes(sub)}
                        onChange={() => handleSubToggle(parent, submodules, sub)}
                      >
                        {sub}
                      </Checkbox>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Divider />
      <div style={{ textAlign: 'right' }}>
        <Button onClick={() => setSelectedModules(getAllModuleKeys())} style={{ marginRight: 8 }}>
          Reset to Default
        </Button>
        <Button onClick={() => setSelectedModules([])} style={{ marginRight: 8 }}>
          Clear All
        </Button>
      </div>
    </div>
  );
};

const generateUserID = async (role) => {
  try {
    const response = await fetch('/api/admin/generate-userid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }), // Pass the role to the backend
    });

    if (!response.ok) {
      throw new Error('Failed to generate userID');
    }

    const data = await response.json();
    return data.userID; // Return the generated userID
  } catch (error) {
    console.error('Error generating userID:', error);
    return null;
  }
};

const generatePassword = () => { // Simple password generation function (you can customize it as per your needs)
  return Math.random().toString(36).slice(-8); // 8-character random password
};

const handleNameBeforeInput = (e) => {
  if (!/^[A-Za-z.\s]*$/.test(e.data)) {
    e.preventDefault();
  }
};

const formatMobile = (value) => {
  if (!value) return ''; // If value is undefined or empty, return an empty string
  const digits = value.replace(/\D/g, ''); // remove non-digit characters
  const part1 = digits.slice(0, 4);
  const part2 = digits.slice(4, 7);
  const part3 = digits.slice(7, 11);
  let formatted = part1;
  if (part2) formatted += '-' + part2;
  if (part3) formatted += '-' + part3;
  return formatted;
};

const CreateAccount = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [mobileNumber, setMobileNumber] = useState('');
  const variant = Form.useWatch('variant', form);
  const status = Form.useWatch('status', form);
  const role = Form.useWatch('role', form);
  const { id } = useParams();
  const [isChecked, setIsChecked] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState(null);
  const [hasCustomAccess, setHasCustomAccess] = useState(false);
  const [selectedModules, setSelectedModules] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
    if (errors.agreement) {
      setErrors(prev => ({
        ...prev,
        agreement: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isChecked) {
      newErrors.agreement = 'You must agree to the data privacy agreement';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    // When role changes, update the selected modules to match the default role modules
    if (role && defaultRoleModules[role]) {
      const moduleGroups = defaultRoleModules[role] || {};
      const allModules = Object.entries(moduleGroups).flatMap(([parent, subs]) => [parent, ...subs]);
      setSelectedModules(allModules);
    }
  }, [role]);



  useEffect(() => {
    const fetchAccount = async () => {
      if (!id) return; // only fetch if editing

      try {
        const res = await fetch(`http://localhost:5000/api/admin/accounts/${id}`);
        const result = await res.json();

        if (!res.ok) {
          return message.error(result.message || 'Failed to load account data.');
        }

        // Extract the actual account data from the "data" object
        const data = result.data;

        // Check if mobile exists and format it
        const formattedMobile = data.mobile ? formatMobile(data.mobile) : '';

        // Set hasCustomAccess state
        setHasCustomAccess(data.hasCustomAccess || false);

        // Use setFieldsValue after form is loaded to set the values correctly
        form.setFieldsValue({
          userID: data.userID,
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          email: data.email,
          mobile: formattedMobile,
          role: data.role,
          status: data.status,
          hasCustomAccess: data.hasCustomAccess || false, // Set form value for hasCustomAccess
        });

        setMobileNumber(formattedMobile);

        // Set custom access if it exists
        if (data.hasCustomAccess && data.customModules && data.customModules.length > 0) {
          setSelectedModules(data.customModules || []);
        } else {
          // Use default role modules
          const moduleGroups = defaultRoleModules[data.role] || {};
          const allModules = Object.entries(moduleGroups).flatMap(([parent, subs]) => [parent, ...subs]);
          setSelectedModules(allModules);
        }
      } catch (error) {
        console.error('Error fetching account:', error);
        message.error('Error fetching account data.');
      }
    };

    fetchAccount();
  }, [id, form]);


  useEffect(() => {
    if (role) {
      // Turn off custom access when role changes
      setHasCustomAccess(false);
      form.setFieldsValue({ hasCustomAccess: false });

      // Update the modules to default for this role
      if (defaultRoleModules[role]) {
        const moduleGroups = defaultRoleModules[role] || {};
        const allModules = Object.entries(moduleGroups).flatMap(([parent, subs]) => [parent, ...subs]);
        setSelectedModules(allModules);
      }
    }
  }, [role, form]);

  const handleSubmit = (values) => {
    if (validateForm()) {
      setFormValues(values);
      setShowConfirmModal(true);
    }
  };

  const handleBack = () => navigate('/admin/manage-accounts');

  const confirmAccountCreation = async () => {
    if (!formValues) return;

    setIsSubmitting(true);
    try {
      // Generate a random password
      const password = generatePassword();

      // Trim string fields
      const trimmedValues = {
        ...formValues, // Use formValues instead of undefined values
        firstName: formValues.firstName?.trim() || '',
        middleName: formValues.middleName?.trim() || '',
        lastName: formValues.lastName?.trim() || '',
        email: formValues.email?.trim() || '',
        mobile: formValues.mobile?.replace(/\D/g, '') || '',
        role: formValues.role || '',
        status: formValues.status || '',
        password: password || '',
        hasCustomAccess: !!hasCustomAccess, // Ensure this is a boolean value
        customModules: hasCustomAccess ? selectedModules : [],
      };

      // Generate user ID if not provided
      if (!formValues.userID || !formValues.userID.trim()) {
        const generatedID = await generateUserID(trimmedValues.role);
        if (!generatedID) {
          throw new Error('Failed to generate user ID');
        }
        trimmedValues.userID = generatedID;
      }
      console.log('Creating account with values:', trimmedValues);

      const url = id
        ? `http://localhost:5000/api/admin/accounts/${id}`
        : 'http://localhost:5000/api/admin/create-account';

      const method = id ? 'PUT' : 'POST';

      // API call to create the account
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(trimmedValues)
      });

      const data = await response.json();

      if (!response.ok) {
        // Conflict (duplicate userID/email/mobile) or other business error
        if (response.status === 409) {
          return message.error(data.message);
        }
        // Validation errors, bad request, etc.
        if (response.status >= 400 && response.status < 500) {
          return message.warning(data.message || 'Invalid input.');
        }
        // Server error
        return message.error('Server error. Please try again later.');
      }

      message.success(id ? 'Account successfully updated!' : 'Account successfully created!');
      // navigate('/admin/verify-email', {
      //   state: {
      //     email: trimmedValues.email,
      //     firstName: trimmedValues.firstName,
      //     fromAdmin: true,
      //     studentID: data.data.studentID || '',
      //     expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
      //   }
      // });

      navigate('/admin/manage-accounts');
    } catch (error) {
      console.error('Error creating account:', error);
      message.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const items = [
    {
      key: 'basic',
      label: 'Basic Information',
      children: (
        <div className="container-columns">
          <div className="column">
            <div className="group-title">
              <FaUser className="section-icon" />
              <p className="section-title">USER INFORMATION</p>
            </div>

            <Form.Item
              label="User ID"
              name="userID"
            >
              <Input placeholder="Auto-generated ID" disabled />
            </Form.Item>
            <Form.Item
              label="First Name"
              name="firstName"
              maxLength={50}
              rules={[{ required: true, message: 'Please input first name!' }]}
            >
              <Input maxLength={50} showCount={{ maxLength: 50 }} placeholder="Enter first name" onBeforeInput={handleNameBeforeInput} />
            </Form.Item>

            <Form.Item label="Middle Name" name="middleName">
              <Input placeholder="Leave blank if not applicable" onBeforeInput={handleNameBeforeInput} />
            </Form.Item>

            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: 'Please input last name!' }]}
            >
              <Input maxLength={50} showCount={{ maxLength: 50 }} placeholder="Enter last name" onBeforeInput={handleNameBeforeInput} />
            </Form.Item>


            <Form.Item
              label="Mobile"
              name="mobile"
              validateFirst
              rules={[
                { required: true, message: 'Please input mobile number!' },
                {
                  validator: async (_, value) => {
                    if (!value) return Promise.reject('Please input mobile number!');

                    const digits = value.replace(/\D/g, '');

                    if (digits.length !== 11 || !digits.startsWith('09')) {
                      return Promise.reject('Please enter a valid Philippine mobile number\n(09XX-XXX-XXXX)');
                    }

                    // Only check availability if we're not editing (no id) or if the mobile number has changed
                    if (!id || digits !== form.getFieldValue('mobile')) {
                      try {
                        const res = await fetch('http://localhost:5000/api/admin/check-availability', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            mobile: digits,
                            excludeId: id // Pass the current account ID to exclude it from check
                          }),
                        });

                        const data = await res.json();
                        if (data.mobileInUse) {
                          return Promise.reject(data.message || 'Mobile number is already in use.');
                        }
                      } catch (error) {
                        console.error('Validation error:', error);
                        // Don't reject on network errors - let the form submit
                      }
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                placeholder="09XX-XXX-XXXX"
                value={mobileNumber}
                onChange={(e) => {
                  const formatted = formatMobile(e.target.value);
                  setMobileNumber(formatted);
                  form.setFieldsValue({ mobile: formatted });
                }}
                maxLength={13} // 11 digits + 2 dashes
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              validateFirst
              rules={[
                { required: true, message: 'Please input an email address!' },
                { type: 'email', message: 'Please enter a valid email address!' },
                {
                  validator: async (_, value) => {
                    if (!value) return Promise.resolve();

                    // Only check availability if we're not editing (no id) or if the email has changed
                    if (!id || value !== form.getFieldValue('email')) {
                      try {
                        const res = await fetch('http://localhost:5000/api/admin/check-availability', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ email: value }),
                        });

                        const data = await res.json();
                        if (data.emailInUse) {
                          return Promise.reject('Email is already in use.');
                        }
                      } catch (error) {
                        console.error('Validation error:', error);
                        // Don't reject on network errors - let the form submit
                      }
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="juandelacruz@email.com" />
            </Form.Item>
          </div>

          <div className="column">
            <div className="group-title">
              <IoSettings className="section-icon" />
              <p className="section-title">ACCOUNT SETTINGS</p>
            </div>

            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true, message: 'Please select a role!' }]}
            >
              <Select placeholder="Select a role">
                <Select.Option value="Student">Student</Select.Option>
                <Select.Option value="Faculty">Faculty</Select.Option>
                <Select.Option value="Admissions (Staff)">Admissions (Staff)</Select.Option>
                <Select.Option value="Registrar (Staff)">Registrar (Staff)</Select.Option>
                <Select.Option value="Accounting (Staff)">Accounting (Staff)</Select.Option>
                <Select.Option value="Administration (Sub-Admin)">Administration (Sub-Admin)</Select.Option>
                <Select.Option value="IT (Super Admin)">IT (Super Admin)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Account Status"
              name="status"
              rules={[{ required: true, message: 'Please select account status!' }]}
              initialValues={{ variant: 'outlined', status: 'Pending Verification' }}
            >
              <Select
                placeholder="Select account status"
                disabled={status === 'Pending Verification'}
              >
                <Select.Option value="Active">Active</Select.Option>
                <Select.Option value="Inactive">Inactive</Select.Option>
                {(!status || status === 'Pending Verification') && (
                  <Select.Option value="Pending Verification">Pending Verification</Select.Option>
                )}
              </Select>
            </Form.Item>

            <Form.Item
              label="Custom Access"
              name="hasCustomAccess"
              valuePropName="checked"
            >
              <Switch
                checked={hasCustomAccess}
                disabled={role === 'IT (Super Admin)'}
                onChange={(checked) => {
                  setHasCustomAccess(checked);
                  form.setFieldsValue({ hasCustomAccess: checked });
                }}
              />
            </Form.Item>

            <div className="buttons">
              <Button type="default" htmlType="button" onClick={handleBack}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" className={id ? '' : 'create-btn'}>
                {id ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>

          <div className="column">
            {/* Form title */}
            <h3 className="juan-form-title">Data Privacy Agreement</h3>
            <div className="juan-title-underline"></div>
            {/* Data Privacy Agreement Checkbox */}
            <div className="juan-form-group" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="agreement"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                  style={{
                    width: '16px',
                    height: '16px',
                    margin: '2px 0 0 0',
                    flexShrink: 0
                  }}
                  className={`juan-custom-checkbox ${errors.agreement ? 'juan-input-error' : ''}`}
                />
                <label
                  htmlFor="agreement"
                  style={{
                    textAlign: 'justify',
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    display: 'inline-block',
                    width: '100%',
                    fontWeight: 'normal',
                    fontSize: '13px',
                    margin: 0
                  }}
                >
                  {id ? (
                    // Message for updating an account
                    <span>
                      <strong>I hereby affirm that all information updated in this form is accurate and truthful to the best of my knowledge, and has been modified with the consent and acknowledgment of the concerned individual and/or their parent/guardian. </strong>This <strong>account update</strong> has been carried out by an authorized representative of the institution in accordance with institutional policies.
                    </span>
                  ) : (
                    // Message for creating a new account
                    <span>
                      <strong>I hereby affirm that all information provided in this form is accurate and truthful to the best of my knowledge, and has been submitted with the consent and acknowledgment of the concerned individual and/or their parent/guardian. </strong>This <strong>account creation</strong> has been carried out by an authorized representative of the institution in accordance with institutional policies.
                    </span>
                  )}
                  <br /><br />
                  In compliance with the Data Privacy Act of 2012, San Juan de Dios Educational Foundation Inc. – College will safeguard all submitted data and use it solely for official academic and administrative purposes.
                </label>
              </div>
              {errors.agreement && (
                <div className="juan-error-message" style={{ color: 'red', marginTop: '5px' }}>
                  {errors.agreement}
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'access',
      label: 'Custom Access Permissions',
      children: (
        <div className="container-columns">
          <div className="column" style={{ gridColumn: '1 / -1' }}>
            <div className="group-title">
              <LockOutlined className="section-icon" />
              <p className="section-title">CUSTOM ACCESS PERMISSIONS</p>
            </div>

            {role ? (
              <>
                <div style={{ marginBottom: 20 }}>
                  <p>
                    {hasCustomAccess
                      ? "Configure custom access permissions for this user. These settings will override the default role permissions."
                      : "This user will use default role permissions. Toggle 'Custom Access' in the Basic Information tab to customize permissions."}
                  </p>
                </div>
                <CustomAccessForm
                  role={role}
                  selectedModules={selectedModules}
                  setSelectedModules={setSelectedModules}
                  hasCustomAccess={hasCustomAccess}
                />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p>Please select a role in the Basic Information tab first.</p>
              </div>
            )}
          </div>
        </div>
      ),
    }
  ];

  return (
    <div className="main main-container">
      <Header />
      <div className="main-content">
        <div className="page-title">
          <div className="arrows" onClick={handleBack}>
            <MdOutlineKeyboardArrowLeft />
          </div>
          <p className="heading">{id ? 'Edit Account' : 'Create Account'}</p>
        </div>

        <Form
          form={form}
          variant={variant || 'outlined'}
          initialValues={{ variant: 'outlined', status: 'Pending Verification' }}
          labelCol={{ xs: { span: 24 }, sm: { span: 6 } }}
          wrapperCol={{ xs: { span: 24 }, sm: { span: 30 } }}
          onFinish={handleSubmit}
        >
          <Tabs
            items={items}
            activeKey={activeTab}
            onChange={setActiveTab}
          />

          {/* Confirmation Modal */}
          {showConfirmModal && (
            <div className="juan-modal-overlay">
              <div className="juan-confirm-modal">
                <h3>{id ? 'Confirm Update' : 'Confirm Registration'}</h3>
                <p>
                  {id
                    ? 'Are you sure all the updated information is correct? Please review before confirming these changes.'
                    : 'Are you sure all the information provided is correct? Please review before creating this account.'
                  }
                </p>
                <div className="juan-modal-buttons">
                  <button
                    className="juan-modal-cancel"
                    onClick={() => setShowConfirmModal(false)}
                    disabled={isSubmitting}
                  >
                    Review Information
                  </button>
                  <button
                    className="juan-modal-confirm"
                    onClick={confirmAccountCreation}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : id ? 'Yes, Update' : 'Yes, Submit'}
                  </button>
                </div>
                {errors.submit && (
                  <div className="juan-error-message" style={{ marginTop: '10px', textAlign: 'center' }}>
                    {errors.submit}
                  </div>
                )}
              </div>
            </div>
          )}
        </Form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateAccount;