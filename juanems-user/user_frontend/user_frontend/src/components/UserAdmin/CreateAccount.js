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
import '../../css/JuanScope/Register.css';

const generateUserID = (role) => {
  // May still change depending on the client 
  const currentYear = new Date().getFullYear().toString();
  const randomID = Math.random().toString().slice(2, 8); // 6 random digits

  // Use 'STD' for students, 'EMP' for everyone else
  const roleCode = role === 'Student' ? 'STD' : 'EMP';

  return `${roleCode}-${currentYear}-${randomID}`;
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
  const [isChecked, setIsChecked] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState(null);

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
      };

      // Generate user ID if not provided
      if (!formValues.userID || !formValues.userID.trim()) {
        trimmedValues.userID = generateUserID(trimmedValues.role);
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
      navigate('/admin/manage-accounts');
    } catch (error) {
      console.error('Error creating account:', error);
      message.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
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
          initialValues={{ variant: 'outlined', status: 'Inactive' }} // <-- Add this
          labelCol={{ xs: { span: 24 }, sm: { span: 6 } }}
          wrapperCol={{ xs: { span: 24 }, sm: { span: 30 } }}
          onFinish={handleSubmit}
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
                <Input placeholder="Auto-generated ID" disabled />
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
                  <Select.Option value="Faculty">Faculty</Select.Option>
                  <Select.Option value="Admissions (Staff)">Admissions (Staff)</Select.Option>
                  <Select.Option value="Registrar (Staff)">Registrar (Staff)</Select.Option>
                  <Select.Option value="Accounting (Staff)">Accounting (Staff)</Select.Option>
                  <Select.Option value="Administration (Sub-Admin)">Administration (Sub-Admin)</Select.Option>
                  <Select.Option value="IT (Super-Admin)">IT (Super-Admin)</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Account Status"
                name="status"
                rules={[{ required: true, message: 'Please select account status!' }]}
              >
                <Select placeholder="Select account status">
                  <Select.Option value="Active">Active</Select.Option>
                  <Select.Option value="Inactive">Inactive</Select.Option>
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
                      "I hereby affirm that all information updated in this form is accurate and truthful to the best of my knowledge, and has been modified with the consent and acknowledgment of the concerned individual and/or their parent/guardian. This account update has been carried out by an authorized representative of the institution in accordance with institutional policies."
                    ) : (
                      // Message for creating a new account
                      "I hereby affirm that all information provided in this form is accurate and truthful to the best of my knowledge, and has been submitted with the consent and acknowledgment of the concerned individual and/or their parent/guardian. This account creation has been carried out by an authorized representative of the institution in accordance with institutional policies."
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
          </div>


        </Form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateAccount;
