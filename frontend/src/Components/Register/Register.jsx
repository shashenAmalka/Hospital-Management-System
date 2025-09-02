import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    dob: '',
    gender: 'male',
    mobileNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return false;
    }

    if (formData.age < 0 || formData.age > 120) {
      setError("Please enter a valid age (0-120)!");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address!");
      return false;
    }

    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.mobileNumber)) {
      setError("Please enter a valid mobile number!");
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
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          age: parseInt(formData.age),
          dob: formData.dob,
          gender: formData.gender,
          mobileNumber: formData.mobileNumber,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'An error occurred during registration');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join us today and start your healthcare journey
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                placeholder="Enter your full name"
                onChange={handleChange}
                value={formData.name}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                placeholder="Enter your email"
                onChange={handleChange}
                value={formData.email}
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                onChange={handleDobChange}
                value={formData.dob}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Age (auto-calculated) */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age *
              </label>
              <input
                id="age"
                name="age"
                type="number"
                required
                min="0"
                max="120"
                readOnly
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                value={formData.age}
              />
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                onChange={handleChange}
                value={formData.gender}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number *
              </label>
              <input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                placeholder="Enter your mobile number"
                onChange={handleChange}
                value={formData.mobileNumber}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength="6"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  placeholder="Enter your password"
                  onChange={handleChange}
                  value={formData.password}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <EyeIcon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength="6"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  placeholder="Confirm your password"
                  onChange={handleChange}
                  value={formData.confirmPassword}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <EyeIcon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-150 ease-in-out"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition duration-150 ease-in-out">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;