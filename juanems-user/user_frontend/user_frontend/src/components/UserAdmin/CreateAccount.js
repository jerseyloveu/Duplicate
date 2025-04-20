import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { Form, Input, Select, Button, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { FaUser } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { useNavigate, useParams } from 'react-router-dom';

import Footer from './Footer';
import Header from './Header';
import '../../css/UserAdmin/CreateAccount.css';
import '../../css/UserAdmin/Global.css';

const generateUserID = (role, department) => {
  const currentYear = new Date().getFullYear().toString();
  const randomID = Math.random().toString().slice(2, 8); // 6 random digits

  if (role === 'Student') {
    return `${currentYear}-${randomID}`;
  } else if (role === 'Staff') {
    const departmentCode = {
      'Faculty': 'FCT',
      'Admissions': 'ADM',
      'Registrar': 'REG',
      'Accounting': 'ACC',
      'IT': 'IT',
    }[department] || 'STAFF';
    return `${departmentCode}-${currentYear}-${randomID}`;
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
  const role = Form.useWatch('role', form);
  const { id } = useParams();

  useEffect(() => {
    const fetchAccount = async () => {
      if (!id) return; // only fetch if editing
  
      try {
        const res = await fetch(`http://localhost:5000/api/admin/accounts/${id}`);
        const result = await res.json();
  
        if (!res.ok) {
          return message.error(result.message || 'Failed to load account data.');
        }
  
        // Log the fetched data to the console
        console.log('Fetched account data:', result);
  
        // Extract the actual account data from the "data" object
        const data = result.data;
  
        // Check if mobile exists and format it
        const formattedMobile = data.mobile ? formatMobile(data.mobile) : '';
  
        // Use setFieldsValue after form is loaded to set the values correctly
        form.setFieldsValue({
          userID: data.userID,  // Manually set userID here to ensure it populates
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          email: data.email,
          mobile: formattedMobile,
          role: data.role,
          department: data.department,
          status: data.status,
        });
  
        setMobileNumber(formattedMobile); // Update state for mobile number as well
      } catch (error) {
        console.error('Error fetching account:', error);
        message.error('Error fetching account data.');
      }
    };
  
    fetchAccount();
  }, [id, form]); // Depend on 'id' and 'form' to reload when necessary  
  

  const handleBack = () => navigate('/admin/manage-accounts');

  const handleSubmit = async (values) => {
    try {
      // Generate a random password
      const password = generatePassword();

      // Trim string fields
      const trimmedValues = {
        ...values,
        firstName: values.firstName.trim(),
        middleName: values.middleName?.trim() || '',
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        mobile: values.mobile.replace(/\D/g, ''),
        role: values.role,
        department: values.department,
        status: values.status,
        password,
      };

      // Generate user ID if not provided
      if (!values.userID || !values.userID.trim()) {
        trimmedValues.userID = generateUserID(trimmedValues.role, trimmedValues.department);
      }

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

      message.success('Account successfully created!');
      navigate('/admin/manage-accounts');
    } catch (error) {
      console.error('Error creating account:', error);
      message.error(error.message || 'Failed to create account. Please try again.');
    }
  };

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
          initialValues={{ variant: 'outlined', status: 'Deactivated' }} // <-- Add this
          labelCol={{ xs: { span: 24 }, sm: { span: 6 } }}
          wrapperCol={{ xs: { span: 24 }, sm: { span: 30 } }}
          onFinish={handleSubmit}
          onValuesChange={(changedValues) => {
            if (changedValues.role) {
              form.setFieldsValue({ department: undefined }); // Clears department on role change
            }
          }}
        >
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
                <Input placeholder="Leave blank to auto-generate ID" />
              </Form.Item>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true, message: 'Please input first name!' }]}
              >
                <Input placeholder="Enter first name" onBeforeInput={handleNameBeforeInput} />
              </Form.Item>

              <Form.Item label="Middle Name" name="middleName">
                <Input placeholder="Leave blank if not applicable" onBeforeInput={handleNameBeforeInput} />
              </Form.Item>

              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true, message: 'Please input last name!' }]}
              >
                <Input placeholder="Enter last name" onBeforeInput={handleNameBeforeInput} />
              </Form.Item>

              <Form.Item
                label="Mobile"
                name="mobile"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.reject('Please input mobile number!');
                      }
                      const digits = value.replace(/\D/g, '');
                      if (digits.length !== 11) {
                        return Promise.reject('Number must be 11 digits');
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
                rules={[
                  { required: true, message: 'Please input an email address!' },
                  { type: 'email', message: 'Please enter a valid email address!' },
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
                  <Select.Option value="Staff">Staff</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Department"
                name="department"
                rules={[{ required: true, message: 'Please select a department!' }]}
              >
                <Select
                  placeholder="Select a department"
                  disabled={!role}  // Disable until role is selected
                >
                  {role === 'Student' ? (
                    <Select.Option value="SHS">SHS</Select.Option> // Only show SHS for student
                  ) : (
                    <>
                      <Select.Option value="Faculty">Faculty</Select.Option>
                      <Select.Option value="Admissions">Admissions</Select.Option>
                      <Select.Option value="Registrar">Registrar</Select.Option>
                      <Select.Option value="Accounting">Accounting</Select.Option>
                      <Select.Option value="IT">IT</Select.Option>
                    </>
                  )}
                </Select>
              </Form.Item>

              <Form.Item
                label="Account Status"
                name="status"
                rules={[{ required: true, message: 'Please select account status!' }]}
              >
                <Select placeholder="Select account status">
                  <Select.Option value="Activated">Activated</Select.Option>
                  <Select.Option value="Deactivated">Deactivated</Select.Option>
                </Select>
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
            </div>
          </div>
        </Form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateAccount;
