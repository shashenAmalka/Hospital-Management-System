import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  ChevronLeftIcon, EyeIcon, EyeOffIcon, UserIcon, MailIcon, PhoneIcon, 
  SaveIcon, AlertCircleIcon
} from 'lucide-react';

export function StaffForm({ 
  editMode = false, 
  staffData = null, 
  onSubmit, 
  onCancel 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: staffData?.firstName || '',
    lastName: staffData?.lastName || '',
    email: staffData?.email || '',
    phone: staffData?.phone || '',
    department: staffData?.department || '',
    role: staffData?.role || '',
    specialization: staffData?.specialization || '',
    status: staffData?.status || 'active',
    password: '',
    confirmPassword: ''
  });

  const departments = [
    'cardiology',
    'neurology', 
    'orthopedics',
    'pediatrics',
    'radiology',
    'emergency',
    'surgery',
    'icu',
    'laboratory',
    'pharmacy',
    'administration'
  ];

  const roles = [
    'physician',
    'nurse',
    'doctor',
    'department-head',
    'technician',
    'administrator',
    'pharmacist',
    'lab-technician',
    'receptionist'
  ];

  const specializations = [
    'cardiology',
    'dermatology',
    'endocrinology',
    'gastroenterology',
    'neurology',
    'oncology',
    'orthopedics',
    'pediatrics',
    'psychiatry',
    'radiology',
    'surgery',
    'urology',
    'emergency-medicine',
    'family-medicine',
    'internal-medicine',
    'obstetrics-gynecology'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Real-time validation to prevent invalid input
    let sanitizedValue = value;
    
    // First Name and Last Name - only allow letters and spaces
    if (name === 'firstName' || name === 'lastName') {
      sanitizedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }
    
    // Phone number - only allow digits and limit to 10 characters
    if (name === 'phone') {
      sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [name]: sanitizedValue
      };
      
      // Clear specialization if role is changed from doctor to something else
      if (name === 'role' && value !== 'doctor') {
        newFormData.specialization = '';
      }
      
      return newFormData;
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // First Name validation - no numbers or symbols
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name cannot contain numbers or symbols';
    }

    // Last Name validation - no numbers or symbols
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name cannot contain numbers or symbols';
    }

    // Email validation - proper email format
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Invalid email address format';
    } else if (!formData.email.toLowerCase().includes('@gmail.com') && 
               !formData.email.toLowerCase().includes('@email.com') &&
               !formData.email.toLowerCase().includes('@mail.com') &&
               !formData.email.toLowerCase().includes('@hospital.com')) {
      newErrors.email = 'Please use a valid email domain (e.g., gmail.com, email.com, hospital.com)';
    }

    // Phone number validation - must start with 0, exactly 10 digits, no letters or symbols
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number cannot contain letters or symbols';
    } else if (!formData.phone.startsWith('0')) {
      newErrors.phone = 'Phone number must start with 0';
    } else if (formData.phone.length !== 10) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    // Validate specialization for doctors
    if (formData.role === 'doctor' && !formData.specialization) {
      newErrors.specialization = 'Specialization is required for doctors';
    }

    if (!editMode) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = { ...formData };
      if (editMode) {
        delete submitData.password;
        delete submitData.confirmPassword;
      }
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error saving staff:', error);
      setErrors({ submit: 'Failed to save staff member. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onCancel}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <ChevronLeftIcon className="h-5 w-5" />
            <span>Back to Staff Directory</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {editMode ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h1>
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircleIcon className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{errors.submit}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name*
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter first name (letters only)"
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name*
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter last name (letters only)"
                />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address*
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="example@gmail.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number*
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength="10"
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0712345678 (10 digits)"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Must start with 0 and be exactly 10 digits</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department*
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept.charAt(0).toUpperCase() + dept.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role*
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.role ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Specialization field - only show for doctors */}
            {formData.role === 'doctor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization*
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.specialization ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Specialization</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>
                      {spec.charAt(0).toUpperCase() + spec.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
                {errors.specialization && (
                  <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
          </div>

          {!editMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password*
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password*
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          )}

          <div className="border-t pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <SaveIcon className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : editMode ? 'Update Staff Member' : 'Create Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

StaffForm.propTypes = {
  editMode: PropTypes.bool,
  staffData: PropTypes.shape({
    id: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    department: PropTypes.string,
    role: PropTypes.string,
    status: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};