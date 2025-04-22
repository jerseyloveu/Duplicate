import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope, faClock, faExclamationCircle, faTimes, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import Select from 'react-select';
import Fuse from 'fuse.js';
import '../../css/JuanScope/Register.css';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import JuanEMSLogo from '../../images/JuanEMSlogo.png';
import registrationPersonImg from '../../images/registrationperson.png';

// List of countries for the dropdown
const countries = [
  { value: 'afghanistan', label: 'Afghanistan' },
  { value: 'albania', label: 'Albania' },
  { value: 'algeria', label: 'Algeria' },
  { value: 'andorra', label: 'Andorra' },
  { value: 'angola', label: 'Angola' },
  { value: 'antigua-and-barbuda', label: 'Antigua and Barbuda' },
  { value: 'argentina', label: 'Argentina' },
  { value: 'armenia', label: 'Armenia' },
  { value: 'australia', label: 'Australia' },
  { value: 'austria', label: 'Austria' },
  { value: 'azerbaijan', label: 'Azerbaijan' },
  { value: 'bahamas', label: 'Bahamas' },
  { value: 'bahrain', label: 'Bahrain' },
  { value: 'bangladesh', label: 'Bangladesh' },
  { value: 'barbados', label: 'Barbados' },
  { value: 'belarus', label: 'Belarus' },
  { value: 'belgium', label: 'Belgium' },
  { value: 'belize', label: 'Belize' },
  { value: 'benin', label: 'Benin' },
  { value: 'bhutan', label: 'Bhutan' },
  { value: 'bolivia', label: 'Bolivia' },
  { value: 'bosnia-and-herzegovina', label: 'Bosnia and Herzegovina' },
  { value: 'botswana', label: 'Botswana' },
  { value: 'brazil', label: 'Brazil' },
  { value: 'brunei', label: 'Brunei' },
  { value: 'bulgaria', label: 'Bulgaria' },
  { value: 'burkina-faso', label: 'Burkina Faso' },
  { value: 'burundi', label: 'Burundi' },
  { value: 'cambodia', label: 'Cambodia' },
  { value: 'cameroon', label: 'Cameroon' },
  { value: 'canada', label: 'Canada' },
  { value: 'cape-verde', label: 'Cape Verde' },
  { value: 'central-african-republic', label: 'Central African Republic' },
  { value: 'chad', label: 'Chad' },
  { value: 'chile', label: 'Chile' },
  { value: 'china', label: 'China' },
  { value: 'colombia', label: 'Colombia' },
  { value: 'comoros', label: 'Comoros' },
  { value: 'congo', label: 'Congo' },
  { value: 'costa-rica', label: 'Costa Rica' },
  { value: 'croatia', label: 'Croatia' },
  { value: 'cuba', label: 'Cuba' },
  { value: 'cyprus', label: 'Cyprus' },
  { value: 'czech-republic', label: 'Czech Republic' },
  { value: 'denmark', label: 'Denmark' },
  { value: 'djibouti', label: 'Djibouti' },
  { value: 'dominica', label: 'Dominica' },
  { value: 'dominican-republic', label: 'Dominican Republic' },
  { value: 'east-timor', label: 'East Timor' },
  { value: 'ecuador', label: 'Ecuador' },
  { value: 'egypt', label: 'Egypt' },
  { value: 'el-salvador', label: 'El Salvador' },
  { value: 'equatorial-guinea', label: 'Equatorial Guinea' },
  { value: 'eritrea', label: 'Eritrea' },
  { value: 'estonia', label: 'Estonia' },
  { value: 'ethiopia', label: 'Ethiopia' },
  { value: 'fiji', label: 'Fiji' },
  { value: 'finland', label: 'Finland' },
  { value: 'france', label: 'France' },
  { value: 'gabon', label: 'Gabon' },
  { value: 'gambia', label: 'Gambia' },
  { value: 'georgia', label: 'Georgia' },
  { value: 'germany', label: 'Germany' },
  { value: 'ghana', label: 'Ghana' },
  { value: 'greece', label: 'Greece' },
  { value: 'grenada', label: 'Grenada' },
  { value: 'guatemala', label: 'Guatemala' },
  { value: 'guinea', label: 'Guinea' },
  { value: 'guinea-bissau', label: 'Guinea-Bissau' },
  { value: 'guyana', label: 'Guyana' },
  { value: 'haiti', label: 'Haiti' },
  { value: 'honduras', label: 'Honduras' },
  { value: 'hungary', label: 'Hungary' },
  { value: 'iceland', label: 'Iceland' },
  { value: 'india', label: 'India' },
  { value: 'indonesia', label: 'Indonesia' },
  { value: 'iran', label: 'Iran' },
  { value: 'iraq', label: 'Iraq' },
  { value: 'ireland', label: 'Ireland' },
  { value: 'israel', label: 'Israel' },
  { value: 'italy', label: 'Italy' },
  { value: 'ivory-coast', label: 'Ivory Coast' },
  { value: 'jamaica', label: 'Jamaica' },
  { value: 'japan', label: 'Japan' },
  { value: 'jordan', label: 'Jordan' },
  { value: 'kazakhstan', label: 'Kazakhstan' },
  { value: 'kenya', label: 'Kenya' },
  { value: 'kiribati', label: 'Kiribati' },
  { value: 'korea-north', label: 'Korea, North' },
  { value: 'korea-south', label: 'Korea, South' },
  { value: 'kosovo', label: 'Kosovo' },
  { value: 'kuwait', label: 'Kuwait' },
  { value: 'kyrgyzstan', label: 'Kyrgyzstan' },
  { value: 'laos', label: 'Laos' },
  { value: 'latvia', label: 'Latvia' },
  { value: 'lebanon', label: 'Lebanon' },
  { value: 'lesotho', label: 'Lesotho' },
  { value: 'liberia', label: 'Liberia' },
  { value: 'libya', label: 'Libya' },
  { value: 'liechtenstein', label: 'Liechtenstein' },
  { value: 'lithuania', label: 'Lithuania' },
  { value: 'luxembourg', label: 'Luxembourg' },
  { value: 'macedonia', label: 'Macedonia' },
  { value: 'madagascar', label: 'Madagascar' },
  { value: 'malawi', label: 'Malawi' },
  { value: 'malaysia', label: 'Malaysia' },
  { value: 'maldives', label: 'Maldives' },
  { value: 'mali', label: 'Mali' },
  { value: 'malta', label: 'Malta' },
  { value: 'marshall-islands', label: 'Marshall Islands' },
  { value: 'mauritania', label: 'Mauritania' },
  { value: 'mauritius', label: 'Mauritius' },
  { value: 'mexico', label: 'Mexico' },
  { value: 'micronesia', label: 'Micronesia' },
  { value: 'moldova', label: 'Moldova' },
  { value: 'monaco', label: 'Monaco' },
  { value: 'mongolia', label: 'Mongolia' },
  { value: 'montenegro', label: 'Montenegro' },
  { value: 'morocco', label: 'Morocco' },
  { value: 'mozambique', label: 'Mozambique' },
  { value: 'myanmar', label: 'Myanmar' },
  { value: 'namibia', label: 'Namibia' },
  { value: 'nauru', label: 'Nauru' },
  { value: 'nepal', label: 'Nepal' },
  { value: 'netherlands', label: 'Netherlands' },
  { value: 'new-zealand', label: 'New Zealand' },
  { value: 'nicaragua', label: 'Nicaragua' },
  { value: 'niger', label: 'Niger' },
  { value: 'nigeria', label: 'Nigeria' },
  { value: 'norway', label: 'Norway' },
  { value: 'oman', label: 'Oman' },
  { value: 'pakistan', label: 'Pakistan' },
  { value: 'palau', label: 'Palau' },
  { value: 'palestine', label: 'Palestine' },
  { value: 'panama', label: 'Panama' },
  { value: 'papua-new-guinea', label: 'Papua New Guinea' },
  { value: 'paraguay', label: 'Paraguay' },
  { value: 'peru', label: 'Peru' },
  { value: 'philippines', label: 'Philippines' },
  { value: 'poland', label: 'Poland' },
  { value: 'portugal', label: 'Portugal' },
  { value: 'qatar', label: 'Qatar' },
  { value: 'romania', label: 'Romania' },
  { value: 'russia', label: 'Russia' },
  { value: 'rwanda', label: 'Rwanda' },
  { value: 'saint-kitts-and-nevis', label: 'Saint Kitts and Nevis' },
  { value: 'saint-lucia', label: 'Saint Lucia' },
  { value: 'saint-vincent-and-the-grenadines', label: 'Saint Vincent and the Grenadines' },
  { value: 'samoa', label: 'Samoa' },
  { value: 'san-marino', label: 'San Marino' },
  { value: 'sao-tome-and-principe', label: 'Sao Tome and Principe' },
  { value: 'saudi-arabia', label: 'Saudi Arabia' },
  { value: 'senegal', label: 'Senegal' },
  { value: 'serbia', label: 'Serbia' },
  { value: 'seychelles', label: 'Seychelles' },
  { value: 'sierra-leone', label: 'Sierra Leone' },
  { value: 'singapore', label: 'Singapore' },
  { value: 'slovakia', label: 'Slovakia' },
  { value: 'slovenia', label: 'Slovenia' },
  { value: 'solomon-islands', label: 'Solomon Islands' },
  { value: 'somalia', label: 'Somalia' },
  { value: 'south-africa', label: 'South Africa' },
  { value: 'south-sudan', label: 'South Sudan' },
  { value: 'spain', label: 'Spain' },
  { value: 'sri-lanka', label: 'Sri Lanka' },
  { value: 'sudan', label: 'Sudan' },
  { value: 'suriname', label: 'Suriname' },
  { value: 'swaziland', label: 'Swaziland' },
  { value: 'sweden', label: 'Sweden' },
  { value: 'switzerland', label: 'Switzerland' },
  { value: 'syria', label: 'Syria' },
  { value: 'taiwan', label: 'Taiwan' },
  { value: 'tajikistan', label: 'Tajikistan' },
  { value: 'tanzania', label: 'Tanzania' },
  { value: 'thailand', label: 'Thailand' },
  { value: 'togo', label: 'Togo' },
  { value: 'tonga', label: 'Tonga' },
  { value: 'trinidad-and-tobago', label: 'Trinidad and Tobago' },
  { value: 'tunisia', label: 'Tunisia' },
  { value: 'turkey', label: 'Turkey' },
  { value: 'turkmenistan', label: 'Turkmenistan' },
  { value: 'tuvalu', label: 'Tuvalu' },
  { value: 'uganda', label: 'Uganda' },
  { value: 'ukraine', label: 'Ukraine' },
  { value: 'united-arab-emirates', label: 'United Arab Emirates' },
  { value: 'united-kingdom', label: 'United Kingdom' },
  { value: 'united-states', label: 'United States' },
  { value: 'uruguay', label: 'Uruguay' },
  { value: 'uzbekistan', label: 'Uzbekistan' },
  { value: 'vanuatu', label: 'Vanuatu' },
  { value: 'vatican-city', label: 'Vatican City' },
  { value: 'venezuela', label: 'Venezuela' },
  { value: 'vietnam', label: 'Vietnam' },
  { value: 'yemen', label: 'Yemen' },
  { value: 'zambia', label: 'Zambia' },
  { value: 'zimbabwe', label: 'Zimbabwe' },
];

// Custom styles for react-select
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    height: '34px',
    minHeight: '34px',
    borderColor: state.isFocused ? '#00245A' : (state.selectProps.error ? '#880D0C' : '#ccc'),
    boxShadow: state.isFocused ? '0 0 0 1px #00245A' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#00245A' : '#aaa',
    }
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 8px',
    height: '34px',
  }),
  input: (provided) => ({
    ...provided,
    margin: '0',
    padding: '0',
    fontSize: '13px',
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: '34px',
  }),
  placeholder: (provided) => ({
    ...provided,
    fontSize: '13px',
  }),
  singleValue: (provided) => ({
    ...provided,
    fontSize: '13px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#00245A' : (state.isFocused ? '#f0f0f0' : null),
    fontSize: '13px',
    padding: '6px 12px',
  }),
};

// Fuse.js configuration for fuzzy search
const fuseOptions = {
  keys: ['label', 'value'],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
};

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Update the useState initialization to properly handle nationality
  const [formData, setFormData] = useState(() => {
    const defaultData = {
      firstName: '',
      middleName: '',
      lastName: '',
      dob: '',
      email: '',
      mobile: '',
      nationality: '',
      // Include Register2.js fields with empty defaults
      academicYear: '',
      academicTerm: '',
      applyingFor: '',
      academicStrand: ''
    };
    return location.state?.formData || defaultData;
  });


  const [errors, setErrors] = useState({});
  const [nationalityOptions, setNationalityOptions] = useState(countries);

  // Initialize Fuse.js with memoization for performance
  const fuse = useMemo(() => new Fuse(countries, fuseOptions), []);

  // Get current date for max date restriction
  const today = new Date().toISOString().split('T')[0];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/<[^>]*>?/gm, '');

    let processedValue = sanitizedValue;
    if (['firstName', 'middleName', 'lastName'].includes(name)) {
      processedValue = sanitizedValue.charAt(0).toUpperCase() + sanitizedValue.slice(1);
    }

    if (name === 'mobile') {
      processedValue = formatPhilippinePhone(sanitizedValue);
    }

    setFormData({
      ...formData,
      [name]: processedValue
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const formatPhilippinePhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) {
      return digits.startsWith('0') ? digits : '0' + digits;
    } else if (digits.length <= 7) {
      return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    } else {
      return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
    }
  };

  // Handle country select from dropdown
  const handleCountrySelect = (selectedOption) => {
    setFormData({
      ...formData,
      nationality: selectedOption ? selectedOption.label : ''
    });
    if (errors.nationality) {
      setErrors({
        ...errors,
        nationality: null
      });
    }
  };

  const checkEmailUniqueness = async (email) => {
    try {
      const response = await fetch(`http://localhost:5000/api/enrollee-applicants/check-email/${encodeURIComponent(email)}`);

      if (response.status === 409) {
        return false; // Email exists
      }

      if (!response.ok) {
        throw new Error('Error checking email uniqueness');
      }

      return true; // Email is unique
    } catch (error) {
      console.error('Email check error:', error);
      throw error;
    }
  };

  // Update the nationality Select component to show the selected value
  const selectedNationality = useMemo(() => {
    return countries.find(country => country.label === formData.nationality);
  }, [formData.nationality]);

  // Handle input change in nationality field for fuzzy search
  const handleNationalityInputChange = (inputValue) => {
    if (!inputValue) {
      setNationalityOptions(countries);
      return;
    }

    const results = fuse.search(inputValue);
    const formattedResults = results.map(result => result.item);
    setNationalityOptions(formattedResults.length > 0 ? formattedResults : countries);
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^09\d{2}-\d{3}-\d{4}$/;

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!phoneRegex.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid Philippine mobile number (09XX-XXX-XXXX)';
    }
    if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update handleSubmit to pass all form data
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Check if email is unique
      const isEmailUnique = await checkEmailUniqueness(formData.email);

      if (!isEmailUnique) {
        setErrors({
          ...errors,
          email: 'This email is already registered. Please use a different email.'
        });
        return;
      }

      // If email is unique, proceed to next step
      navigate('/register2', { state: { formData } });
    } catch (error) {
      console.error('Error during submission:', error);
      setErrors({
        ...errors,
        submit: 'An error occurred while checking email. Please try again.'
      });
    }
  };

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    navigate('/home');
  };

  return (
    <div className="juan-register-container">
      {/* Header */}
      <header className="juan-register-header">
        <div className="juan-header-left">
          <img
            src={SJDEFILogo}
            alt="SJDEFI Logo"
            className="juan-logo-register"
          />
          <div className="juan-header-text">
            <h1>JUAN SCOPE</h1>
          </div>
        </div>
      </header>

      <div className="juan-main-content">
        {/* Left side with gradient background and image */}
        <div className="juan-left-side">
          <div className="juan-gradient-background">
            <h2 className="juan-registration-title">Online Registration</h2>
            <img
              src={registrationPersonImg}
              alt="Registration"
              className="juan-registration-image"
            />
          </div>
        </div>

        {/* Right side with form content */}
        <div className="juan-right-side">
          <div className="juan-form-container">
            {/* Registration form */}
            <div className="juan-registration-form">
              {/* Reminder box */}
              <div className="juan-reminder-box">
                <p>
                  <strong>Reminder:</strong> Please provide your correct and complete information.
                  Fields marked with asterisk (<span className="juan-required-asterisk">*</span>) are required.
                </p>
              </div>

              {/* Step indicator */}
              <div className="juan-step-indicator">
                <div className="juan-step-circles">
                  <div className="juan-step-circle active">1</div>
                  <div className="juan-step-line"></div>
                  <div className="juan-step-circle">2</div>
                  <div className="juan-step-line"></div>
                  <div className="juan-step-circle">3</div>
                </div>
                <div className="juan-step-text">Step 1 of 3</div>
              </div>

              {/* Form title */}
              <h3 className="juan-form-title">Basic Information</h3>
              <div className="juan-title-underline"></div>

              {/* Note */}
              <div className="juan-form-note">
                <FontAwesomeIcon icon={faExclamationCircle} className="juan-note-icon" />
                <p>
                  Note: Please write your names based on your PSA/NSO-copy of birth certificate.
                  For married females who wanted to use their married name, write your names based
                  on your marriage certificate.
                </p>
              </div>

              {/* Form fields */}
              <form onSubmit={handleSubmit}>
                <div className="juan-form-grid">
                  {/* First Name */}
                  <div className="juan-form-group">
                    <label htmlFor="firstName">
                      First Name:<span className="juan-required-asterisk">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={errors.firstName ? 'juan-input-error' : ''}
                    />
                    {errors.firstName && <span className="juan-error-message">{errors.firstName}</span>}
                  </div>

                  {/* Middle Name */}
                  <div className="juan-form-group">
                    <label htmlFor="middleName">Middle Name:</label>
                    <input
                      type="text"
                      id="middleName"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleInputChange}
                      placeholder="Leave blank if not applicable"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="juan-form-group">
                    <label htmlFor="lastName">
                      Last Name:<span className="juan-required-asterisk">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={errors.lastName ? 'juan-input-error' : ''}
                    />
                    {errors.lastName && <span className="juan-error-message">{errors.lastName}</span>}
                  </div>

                  {/* Date of Birth */}
                  <div className="juan-form-group">
                    <label htmlFor="dob">
                      Date of Birth:<span className="juan-required-asterisk">*</span>
                    </label>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      max={today}
                      className={errors.dob ? 'juan-input-error' : ''}
                    />
                    {errors.dob && <span className="juan-error-message">{errors.dob}</span>}
                  </div>

                  {/* Email */}
                  <div className="juan-form-group">
                    <label htmlFor="email">
                      Email Address:<span className="juan-required-asterisk">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'juan-input-error' : ''}
                      placeholder="juandelacruz@email.com"
                    />
                    {errors.email && (
                      <span className="juan-error-message">
                        {errors.email}
                      </span>
                    )}
                    {!errors.email && formData.email && (
                      <span className="juan-email-checking">
                      </span>
                    )}
                  </div>

                  {/* Mobile */}
                  <div className="juan-form-group">
                    <label htmlFor="mobile">
                      Mobile Number:<span className="juan-required-asterisk">*</span>
                    </label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className={errors.mobile ? 'juan-input-error' : ''}
                      placeholder="09XX-XXX-XXXX"
                    />
                    {errors.mobile && <span className="juan-error-message">{errors.mobile}</span>}
                  </div>

                  <div className="juan-form-group">
                    <label htmlFor="nationality">
                      Nationality:<span className="juan-required-asterisk">*</span>
                    </label>
                    <Select
                      id="nationality"
                      placeholder="Select Country"
                      isClearable
                      onChange={handleCountrySelect}
                      onInputChange={handleNationalityInputChange}
                      options={nationalityOptions}
                      value={selectedNationality}
                      styles={customSelectStyles}
                      className="juan-select-wrapper"
                      classNamePrefix="juan-select"
                      error={errors.nationality ? true : false}
                    />
                    {errors.nationality && <span className="juan-error-message">{errors.nationality}</span>}
                  </div>
                </div>

                <div className="juan-form-buttons">
                  <button
                    type="button"
                    className="juan-cancel-button"
                    onClick={handleCancel}
                  >
                    <FontAwesomeIcon icon={faTimes} /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="juan-next-button"
                  >
                    <FontAwesomeIcon icon={faCheck} /> Next
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel confirmation modal */}
      {showCancelConfirm && (
        <div className="juan-modal-overlay">
          <div className="juan-confirm-modal">
            <h3>Confirm Cancellation</h3>
            <p>Are you sure you want to cancel registration? All entered data will be lost.</p>
            <div className="juan-modal-buttons">
              <button
                className="juan-modal-cancel"
                onClick={() => setShowCancelConfirm(false)}
              >
                Continue Registration
              </button>
              <button
                className="juan-modal-confirm"
                onClick={confirmCancel}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="juan-register-footer">
        {/* Left section - Logo and school name */}
        <div className="juan-footer-left">
          <img
            src={JuanEMSLogo}
            alt="SJDEFI Logo"
            className="juan-footer-logo"
          />
          <div className="juan-footer-text">
            <h1>JuanEMS - JUAN SCOPE</h1>
            <p className="juan-footer-motto">© 2025. San Juan De Dios Educational Foundation Inc.</p>
          </div>
        </div>

        {/* Center and right section - organized in a row */}
        <div className="juan-footer-content">
          {/* About, Terms, Privacy links */}
          <div className="juan-footer-links">
            <a href="/about" className="footer-link">About</a>
            <span className="footer-link-separator">|</span>
            <a href="/terms-of-use" className="footer-link">Terms of Use</a>
            <span className="footer-link-separator">|</span>
            <a href="/privacy" className="footer-link">Privacy</a>
          </div>

          {/* Facebook link */}
          <a
            href="https://www.facebook.com/SJDEFIcollege"
            target="_blank"
            rel="noopener noreferrer"
            className="juan-footer-social-link"
          >
            <FontAwesomeIcon icon={faFacebookSquare} className="juan-social-icon" />
            <div className="juan-social-text">
              <span className="juan-social-find">Find us on</span>
              <span className="juan-social-platform">Facebook</span>
            </div>
          </a>

          {/* Contact Form section */}
          <div className="juan-footer-contact-container">
            <div className="juan-contact-title">
              <FontAwesomeIcon icon={faPhone} />
              <span>CONTACT US</span>
            </div>
            <div className="juan-contact-items">
              <div className="juan-contact-item">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>2772 Roxas Blvd., Pasay City, Philippines, 1300</span>
              </div>
              <div className="juan-contact-item">
                <FontAwesomeIcon icon={faPhone} />
                <span>+632 551-2763</span>
              </div>
              <div className="juan-contact-item">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>admission_office@sjdefi.edu.ph | registrarsoffice@sjdefi.edu.ph</span>
              </div>
              <div className="juan-contact-item">
                <FontAwesomeIcon icon={faClock} />
                <span>Monday to Thursday - 7:00 AM to 5:00 PM | Friday - 7:00 AM to 4:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Register;