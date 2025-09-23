import React, { useState } from 'react';
import { UserPlusIcon, SaveIcon, XIcon } from 'lucide-react';
import { userService } from '../../utils/api';

const PatientRegistrationForm = ({ onPatientAdded, onCancel, onBackToList }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    dob: '',
    age: '',
    gender: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate age when DOB changes
    if (name === 'dob' && value) {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData(prev => ({
        ...prev,
        age: age >= 0 ? age.toString() : ''
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.mobileNumber.trim()) {
      setError('Mobile number is required');
      return false;
    }
    if (!formData.gender) {
      setError('Gender is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API (exclude confirmPassword)
      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, ...patientData } = formData;
      
      // Add role as patient
      const dataToSubmit = {
        ...patientData,
        role: 'patient'
      };

      console.log('Submitting patient data:', dataToSubmit);

      await userService.create(dataToSubmit);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        mobileNumber: '',
        dob: '',
        age: '',
        gender: '',
        address: ''
      });

      // Notify parent component
      if (onPatientAdded) {
        onPatientAdded();
      }

      alert('Patient registered successfully!');
    } catch (error) {
      console.error('Error creating patient:', error);
      setError(error.message || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UserPlusIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">Patient Registration</h2>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <XIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Fields marked with <span className="text-red-500">*</span> are required. 
              The patient will use their email and password to log into the system.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                placeholder="Enter full name"
                onChange={handleChange}
                value={formData.name}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                placeholder="Enter email address"
                onChange={handleChange}
                value={formData.email}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                name="password"
                type="password"
                placeholder="Enter password (min 6 characters)"
                onChange={handleChange}
                value={formData.password}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border"
                required
                minLength="6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                onChange={handleChange}
                value={formData.confirmPassword}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                name="mobileNumber"
                type="tel"
                placeholder="Enter mobile number"
                onChange={handleChange}
                value={formData.mobileNumber}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                onChange={handleChange}
                value={formData.gender}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                name="dob"
                type="date"
                onChange={handleChange}
                value={formData.dob}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                name="age"
                type="number"
                placeholder="Age (auto-calculated from DOB)"
                onChange={handleChange}
                value={formData.age}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border"
                min="0"
                max="120"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                name="address"
                type="text"
                placeholder="Enter address"
                onChange={handleChange}
                value={formData.address}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border"
              />
            </div>
          </div>
          
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onBackToList || onCancel}
              className="px-6 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition duration-200 flex items-center"
              disabled={loading}
            >
              <XIcon className="h-4 w-4 mr-2" />
              Back to Patient List
            </button>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <SaveIcon className="h-4 w-4 mr-2" />
                    Register Patient
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientRegistrationForm;