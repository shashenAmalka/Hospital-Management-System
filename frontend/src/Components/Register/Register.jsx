import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    dob: '',
    gender: 'male',
    mobileNumber: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000';

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (error) setError('');

    // Validate input based on field type
    let validatedValue = value;

    // Name fields: Only allow letters and spaces
    if (name === 'firstName' || name === 'lastName') {
      validatedValue = value.replace(/[^a-zA-Z\s]/g, '');
      if (validatedValue && !/^[a-zA-Z\s]+$/.test(validatedValue)) {
        setFieldErrors(prev => ({ ...prev, [name]: 'Only letters are allowed' }));
      }
    }

    // Mobile number: Only allow numbers and + sign
    if (name === 'mobileNumber') {
      validatedValue = value.replace(/[^\d+]/g, '');
      if (validatedValue && validatedValue.length > 15) {
        validatedValue = validatedValue.slice(0, 15);
      }
    }

    // Age: Only allow numbers
    if (name === 'age') {
      validatedValue = value.replace(/\D/g, '');
      const ageNum = parseInt(validatedValue);
      if (validatedValue && (ageNum < 0 || ageNum > 120)) {
        setFieldErrors(prev => ({ ...prev, [name]: 'Age must be between 0 and 120' }));
      }
    }

    setFormData({ ...formData, [name]: validatedValue });
  };

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      errors.firstName = "First name can only contain letters";
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      errors.lastName = "Last name can only contain letters";
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Mobile number validation (10-15 digits, optional + prefix)
    const phoneRegex = /^[+]?[\d]{10,15}$/;
    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = "Mobile number is required";
    } else if (!phoneRegex.test(formData.mobileNumber.replace(/\s/g, ''))) {
      errors.mobileNumber = "Mobile number must be 10-15 digits";
    }

    // Age validation (optional)
    if (formData.age) {
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
        errors.age = "Age must be between 0 and 120";
      }
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    } else if (formData.password.length > 50) {
      errors.password = "Password must be less than 50 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }

    // Gender validation
    if (!formData.gender) {
      errors.gender = "Please select a gender";
    }

    setFieldErrors(errors);

    // If there are errors, show a general error message
    if (Object.keys(errors).length > 0) {
      setError("Please fix the errors in the form before submitting");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('Sending registration data to:', `${API_URL}/api/auth/register`);
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          age: formData.age ? parseInt(formData.age) : undefined,
          dob: formData.dob,
          gender: formData.gender,
          mobileNumber: formData.mobileNumber,
          address: formData.address,
          password: formData.password
        }),
      });

      let data;
      let responseText = await response.text();
      console.log('Raw response:', responseText);
      
      try {
        // Try to parse as JSON
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `Registration failed with status ${response.status}`);
      }

      // Registration successful
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error cases with user-friendly messages
      if (error.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please check if the backend server is running.');
      } else if (error.message.includes('already exists')) {
        setError('This email or mobile number is already registered. Please use different credentials or login.');
      } else if (error.message.includes('Route not found')) {
        setError('The registration service is currently unavailable. Please try again later.');
      } else {
        setError(error.message || 'An error occurred during registration');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleDobChange = (e) => {
    const dob = e.target.value;
    setFormData({ ...formData, dob });
    
    // Auto-calculate age if DOB is provided
    if (dob) {
      const calculatedAge = calculateAge(dob);
      setFormData(prev => ({ ...prev, age: calculatedAge.toString() }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-40 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-2xl opacity-25 animate-blob animation-delay-6000"></div>
      </div>

      <div className="relative max-w-2xl w-full space-y-8 bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-blue-100/50">
        {/* Header */}
        <div className="text-center relative">
          {/* Icon with animated rings */}
          <div className="relative mx-auto h-20 w-20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl transform rotate-6 opacity-80 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl transform -rotate-6 opacity-80 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          
          {/* Animated Title */}
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Create Your Account
            </span>
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            Join us today and start your 
            <span className="bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent font-semibold"> healthcare journey</span>
          </p>
          
          {/* Decorative Line */}
          <div className="flex justify-center items-center space-x-2 mb-6">
            <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"></div>
            <div className="h-2 w-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
            <div className="h-1 w-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 p-6 border-l-4 border-red-400 shadow-lg animate-shake">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-red-800">Registration Error</h3>
                <div className="mt-2 text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="group">
              <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                First Name *
              </label>
              <div className="relative">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className={`w-full px-6 py-4 border-2 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 bg-white/70 backdrop-blur-sm ${
                    fieldErrors.firstName 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-blue-300'
                  }`}
                  placeholder="Enter your first name"
                  onChange={handleChange}
                  value={formData.firstName}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              {fieldErrors.firstName && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="group">
              <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                Last Name *
              </label>
              <div className="relative">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className={`w-full px-6 py-4 border-2 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 bg-white/70 backdrop-blur-sm ${
                    fieldErrors.lastName 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-blue-300'
                  }`}
                  placeholder="Enter your last name"
                  onChange={handleChange}
                  value={formData.lastName}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              {fieldErrors.lastName && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.lastName}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                Email Address *
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`w-full px-6 py-4 border-2 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 bg-white/70 backdrop-blur-sm ${
                    fieldErrors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-blue-300'
                  }`}
                  placeholder="Enter your email"
                  onChange={handleChange}
                  value={formData.email}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              {fieldErrors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div className="group">
              <label htmlFor="mobileNumber" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                Mobile Number *
              </label>
              <div className="relative">
                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  required
                  className={`w-full px-6 py-4 border-2 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 bg-white/70 backdrop-blur-sm ${
                    fieldErrors.mobileNumber 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-blue-300'
                  }`}
                  placeholder="Enter your mobile number"
                  onChange={handleChange}
                  value={formData.mobileNumber}
                  maxLength="15"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              {fieldErrors.mobileNumber && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.mobileNumber}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">10-15 digits, numbers only</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Address */}
            <div className="group md:col-span-2">
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                Address
              </label>
              <div className="relative">
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:border-blue-300"
                  placeholder="Enter your address"
                  onChange={handleChange}
                  value={formData.address}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="group">
              <label htmlFor="dob" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                Date of Birth
              </label>
              <div className="relative">
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:border-blue-300"
                  onChange={handleDobChange}
                  value={formData.dob}
                  max={new Date().toISOString().split('T')[0]}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Age */}
            <div className="group">
              <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
                Age (Auto-calculated)
              </label>
              <div className="relative">
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="0"
                  max="120"
                  readOnly
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl placeholder-gray-400 bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 cursor-not-allowed"
                  value={formData.age}
                />
              </div>
            </div>

            {/* Gender */}
            <div className="group">
              <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                Gender
              </label>
              <div className="relative">
                <select
                  id="gender"
                  name="gender"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:border-blue-300 appearance-none cursor-pointer"
                  onChange={handleChange}
                  value={formData.gender}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength="6"
                  className={`w-full px-6 py-4 pr-12 border-2 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 bg-white/70 backdrop-blur-sm ${
                    fieldErrors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-blue-300'
                  }`}
                  placeholder="Enter your password"
                  onChange={handleChange}
                  value={formData.password}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors z-10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              {fieldErrors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.password}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div className="group">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength="6"
                  className={`w-full px-6 py-4 pr-12 border-2 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 bg-white/70 backdrop-blur-sm ${
                    fieldErrors.confirmPassword 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-blue-300'
                  }`}
                  placeholder="Confirm your password"
                  onChange={handleChange}
                  value={formData.confirmPassword}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors z-10"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 hover:from-blue-700 hover:via-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* Button Background Animation */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Your Account...
                </div>
              ) : (
                <span className="relative">Create Account</span>
              )}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center pt-4">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-teal-700 transition-all duration-300 underline-offset-4 hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;