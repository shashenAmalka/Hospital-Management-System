import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { authService } from '../../utils/api';


import { useAuth } from '../../context/AuthContext';


function Login() {
  const [formData, setFormData] = useState({
    email: '', 
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  
  // Use auth context
  const { login } = useAuth();


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(formData);
      

      // Store user data and token - response structure is { token, user, message }
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Update auth context with user data and token
      login(response.user, response.token);

      
      // Redirect based on role
      if (response.user.role === 'patient') {
        navigate('/patient-dashboard', { replace: true });
      } else if (response.user.role === 'doctor') {
        navigate('/doctor/dashboard', { replace: true });
      } else if (response.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (response.user.role === 'staff') {
        navigate('/staff-dashboard', { replace: true });
      } else if (response.user.role === 'pharmacist') {
        navigate('/pharmacist/dashboard', { replace: true });
      } else if (response.user.role === 'lab_technician') {
        navigate('/lab-dashboard', { replace: true });
      } else {
        navigate('/patient-dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-40 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-2xl opacity-25 animate-blob animation-delay-6000"></div>
      </div>
      
      <div className="relative max-w-md w-full space-y-8 bg-white/90 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-blue-100/50">
        {/* Header Section */}
        <div className="text-center">
          {/* Animated Logo */}
          <div className="relative mx-auto h-24 w-24 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl transform rotate-6 opacity-80 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl transform -rotate-6 opacity-80 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl transform rotate-3 opacity-80 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>
          </div>
          
          {/* Animated Title */}
          <h2 className="text-4xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Welcome Back
            </span>
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Sign in to access your 
            <span className="bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent font-semibold"> healthcare portal</span>
          </p>
          
          {/* Decorative Elements */}
          <div className="flex justify-center items-center space-x-3 mb-8">
            <div className="h-1 w-6 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full animate-pulse"></div>
            <div className="h-2 w-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-3 w-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <div className="h-2 w-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            <div className="h-1 w-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 p-6 border-l-4 border-red-400 shadow-lg animate-shake">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center animate-pulse">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-lg font-semibold text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Email Field */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3 group-focus-within:text-blue-600 transition-colors">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <EnvelopeIcon className="h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 shadow-sm hover:shadow-md bg-white/70 backdrop-blur-sm hover:border-blue-300"
                  placeholder="Enter your email"
                  onChange={handleChange}
                  value={formData.email}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3 group-focus-within:text-blue-600 transition-colors">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <LockClosedIcon className="h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-14 pr-14 py-4 border-2 border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 shadow-sm hover:shadow-md bg-white/70 backdrop-blur-sm hover:border-blue-300"
                  placeholder="Enter your password"
                  onChange={handleChange}
                  value={formData.password}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center z-10">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-blue-500 focus:outline-none transition-colors p-1 rounded-lg hover:bg-blue-50"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-6 w-6" />
                    ) : (
                      <EyeIcon className="h-6 w-6" />
                    )}
                  </button>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center group">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-2 border-gray-300 rounded-lg transition-all duration-200 hover:border-blue-400"
              />
              <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-700 group-hover:text-blue-600 transition-colors cursor-pointer">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-teal-700 transition-all duration-300 underline-offset-4 hover:underline">
                Forgot password?
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
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
                  Signing you in...
                </div>
              ) : (
                <div className="flex items-center relative">
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/70 group-hover:text-white/90 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </span>
                  <span className="pl-8">Sign In</span>
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Sign Up Link */}
        <div className="text-center pt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-teal-700 transition-all duration-300 underline-offset-4 hover:underline"
            >
              Sign up now
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl border border-blue-200 shadow-inner">
          <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
            <div className="w-5 h-5 mr-2 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Demo Credentials
          </h4>
          <div className="space-y-2 pl-7 border-l-2 border-gradient-to-b from-blue-300 to-teal-300">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Email:</span> demo@example.com
            </p>
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Password:</span> demo123
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center text-xs text-gray-500">
        <p className="bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent font-medium">
          © 2023 HelaMed Healthcare Management System
        </p>
      </div>
    </div>
  );
}

export default Login;