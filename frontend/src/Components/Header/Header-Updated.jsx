import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [activePath, setActivePath] = useState(location.pathname);
  
  // Load user data from localStorage
  const loadUserData = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Load user on component mount
    loadUserData();
  }, []);

  // Listen for authentication state changes
  useEffect(() => {
    const handleAuthChange = (event) => {
      if (event.detail) {
        const { isAuthenticated, user: userData } = event.detail;
        setUser(isAuthenticated ? userData : null);
      } else {
        // Handle logout event
        loadUserData();
      }
    };

    const handleLogoutEvent = () => {
      setUser(null);
      setDropdownOpen(false);
    };

    // Listen for custom auth events
    window.addEventListener('auth-state-change', handleAuthChange);
    window.addEventListener('logout', handleLogoutEvent);
    
    return () => {
      window.removeEventListener('auth-state-change', handleAuthChange);
      window.removeEventListener('logout', handleLogoutEvent);
    };
  }, []);

  // Update active path when location changes
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user_name');
    setUser(null);
    setDropdownOpen(false);
    
    // Dispatch custom logout event for other components
    window.dispatchEvent(new Event('logout'));
    window.dispatchEvent(new CustomEvent('auth-state-change', { 
      detail: { isAuthenticated: false, user: null } 
    }));

    navigate('/');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    if (user.name) {
      return user.name.split(' ').map(n => n.charAt(0)).slice(0, 2).join('').toUpperCase();
    }
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.name || user.firstName || user.email?.split('@')[0] || 'User';
  };

  // Get role-based dashboard route
  const getDashboardRoute = () => {
    if (!user || !user.role) return '/patient-dashboard';
    
    const roleRoutes = {
      'patient': '/patient-dashboard',
      'doctor': '/doctor/dashboard',
      'admin': '/admin/dashboard',
      'pharmacist': '/pharmacist/dashboard',
      'lab_technician': '/lab-technician',
      'staff': '/staff-dashboard'
    };

    return roleRoutes[user.role.toLowerCase()] || '/patient-dashboard';
  };

  // Get role-based navigation items for authenticated users
  const getAuthenticatedNavItems = () => {
    if (!user || !user.role) return [];
    
    const role = user.role.toLowerCase();
    
    const navItems = {
      'patient': [
        { path: '/doctor-channelings', label: 'Doctor Channelings' },
        { path: '/laboratory', label: 'Laboratory' },
        { path: '/pharmacy', label: 'Pharmacy' },
      ],
      'doctor': [
        { path: '/doctor/appointments', label: 'My Appointments' },
        { path: '/doctor/patients', label: 'My Patients' },
        { path: '/doctor/schedule', label: 'Schedule' },
      ],
      'admin': [
        { path: '/admin/users', label: 'User Management' },
        { path: '/admin/departments', label: 'Departments' },
        { path: '/admin/reports', label: 'Reports' },
      ],
      'lab_technician': [
        { path: '/lab-technician/tests', label: 'Lab Tests' },
        { path: '/lab-technician/reports', label: 'Reports' },
        { path: '/lab-technician/inventory', label: 'Inventory' },
      ],
      'pharmacist': [
        { path: '/pharmacist/inventory', label: 'Inventory' },
        { path: '/pharmacist/prescriptions', label: 'Prescriptions' },
        { path: '/pharmacist/orders', label: 'Orders' },
      ],
    };

    return navItems[role] || [];
  };

  return (
    <header className="w-full bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-blue-600 to-teal-600 p-2 rounded-lg transform group-hover:scale-110 transition-transform duration-200 shadow-md">
              <svg 
                className="w-7 h-7 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              HelaMed
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Navigation Links */}
            <div className="flex items-center space-x-1">
              {!user ? (
                // Public navigation for non-authenticated users
                <>
                  <Link
                    to="/"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activePath === "/" 
                        ? "bg-blue-50 text-blue-600 font-semibold shadow-sm" 
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/doctor-channelings"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activePath === "/doctor-channelings" 
                        ? "bg-blue-50 text-blue-600 font-semibold shadow-sm" 
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }`}
                  >
                    Doctor Channelings
                  </Link>
                  <Link
                    to="/laboratory"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activePath === "/laboratory" 
                        ? "bg-blue-50 text-blue-600 font-semibold shadow-sm" 
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }`}
                  >
                    Laboratory
                  </Link>
                  <Link
                    to="/about-us"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activePath === "/about-us" 
                        ? "bg-blue-50 text-blue-600 font-semibold shadow-sm" 
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }`}
                  >
                    About Us
                  </Link>
                  <Link
                    to="/contact-us"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activePath === "/contact-us" 
                        ? "bg-blue-50 text-blue-600 font-semibold shadow-sm" 
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }`}
                  >
                    Contact Us
                  </Link>
                </>
              ) : (
                // Role-based navigation for authenticated users
                <>
                  <Link
                    to="/"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activePath === "/" 
                        ? "bg-blue-50 text-blue-600 font-semibold shadow-sm" 
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }`}
                  >
                    Home
                  </Link>
                  {getAuthenticatedNavItems().map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activePath === item.path 
                          ? "bg-blue-50 text-blue-600 font-semibold shadow-sm" 
                          : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </div>
            
            {/* Right-aligned User Actions */}
            <div className="flex items-center space-x-3 ml-4">
            {user ? (
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {getUserInitials()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-sm font-semibold text-gray-800">
                      {getUserDisplayName()}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user.role || 'Patient'}
                    </div>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-200">
                    {/* Profile Section */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {getUserInitials()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 text-sm truncate">
                            {getUserDisplayName()}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {user.email || 'No email'}
                          </div>
                          <div className="text-xs text-blue-600 capitalize font-medium mt-1">
                            {user.role || 'Patient'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="py-2">
                      <Link 
                        to={getDashboardRoute()}
                        className={`flex items-center px-4 py-2.5 hover:bg-blue-50 transition-all duration-200 ${
                          activePath === getDashboardRoute() 
                            ? "bg-blue-50 text-blue-600 font-semibold" 
                            : "text-gray-700 hover:text-blue-600"
                        }`}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                      </Link>
                      
                      <Link 
                        to={`${getDashboardRoute()}/profile`}
                        className={`flex items-center px-4 py-2.5 hover:bg-blue-50 transition-all duration-200 ${
                          activePath.includes('/profile') 
                            ? "bg-blue-50 text-blue-600 font-semibold" 
                            : "text-gray-700 hover:text-blue-600"
                        }`}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </Link>
                      
                      {user.role?.toLowerCase() === 'patient' && (
                        <Link 
                          to="/patient-dashboard/appointments"
                          className={`flex items-center px-4 py-2.5 hover:bg-blue-50 transition-all duration-200 ${
                            activePath.includes('/appointments') 
                              ? "bg-blue-50 text-blue-600 font-semibold" 
                              : "text-gray-700 hover:text-blue-600"
                          }`}
                          onClick={() => setDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          My Appointments
                        </Link>
                      )}
                    </div>

                    {/* Logout Section */}
                    <div className="border-t border-gray-100 pt-2">
                      <button 
                        className="flex items-center w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                        onClick={() => {
                          handleLogout();
                          setDropdownOpen(false);
                        }}
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activePath === "/login" 
                      ? "bg-blue-50 text-blue-600 font-semibold" 
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`py-2 px-5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md ${
                    activePath === "/signup"
                      ? "bg-blue-700 text-white" 
                      : "bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700 hover:shadow-lg transform hover:scale-105"
                  }`}
                >
                  Register
                </Link>
              </>
            )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg 
              className="w-6 h-6 text-gray-700" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex flex-col">
              {/* Main Navigation */}
              <div className="py-2">
                {!user ? (
                  // Public navigation for non-authenticated users
                  <>
                    <Link
                      to="/"
                      className={`flex items-center px-4 py-3 transition-all duration-200 ${
                        activePath === "/" 
                          ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600" 
                          : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      to="/doctor-channelings"
                      className={`flex items-center px-4 py-3 transition-all duration-200 ${
                        activePath === "/doctor-channelings" 
                          ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600" 
                          : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Doctor Channelings
                    </Link>
                    <Link
                      to="/laboratory"
                      className={`flex items-center px-4 py-3 transition-all duration-200 ${
                        activePath === "/laboratory" 
                          ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600" 
                          : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Laboratory
                    </Link>
                    <Link
                      to="/about-us"
                      className={`flex items-center px-4 py-3 transition-all duration-200 ${
                        activePath === "/about-us" 
                          ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600" 
                          : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      About Us
                    </Link>
                    <Link
                      to="/contact-us"
                      className={`flex items-center px-4 py-3 transition-all duration-200 ${
                        activePath === "/contact-us" 
                          ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600" 
                          : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Contact Us
                    </Link>
                  </>
                ) : (
                  // Role-based navigation for authenticated users
                  <>
                    <Link
                      to="/"
                      className={`flex items-center px-4 py-3 transition-all duration-200 ${
                        activePath === "/" 
                          ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600" 
                          : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Home
                    </Link>
                    {getAuthenticatedNavItems().map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-4 py-3 transition-all duration-200 ${
                          activePath === item.path 
                            ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600" 
                            : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </>
                )}
              </div>

              {/* User Section */}
              <div className="border-t border-gray-200 bg-gray-50">
                {user ? (
                  <div className="py-3">
                    {/* User Info */}
                    <div className="flex items-center space-x-3 px-4 py-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                        {getUserInitials()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 truncate">
                          {getUserDisplayName()}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {user.role || 'Patient'}
                        </div>
                      </div>
                    </div>

                    {/* User Links */}
                    <Link
                      to={getDashboardRoute()}
                      className={`flex items-center px-4 py-3 transition-all duration-200 ${
                        activePath === getDashboardRoute()
                          ? "bg-blue-100 text-blue-600 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>
                    
                    <Link
                      to={`${getDashboardRoute()}/profile`}
                      className={`flex items-center px-4 py-3 transition-all duration-200 ${
                        activePath.includes('/profile') 
                          ? "bg-blue-100 text-blue-600 font-semibold" 
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    
                    {user.role?.toLowerCase() === 'patient' && (
                      <Link
                        to="/patient-dashboard/appointments"
                        className={`flex items-center px-4 py-3 transition-all duration-200 ${
                          activePath.includes('/appointments') 
                            ? "bg-blue-100 text-blue-600 font-semibold" 
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        My Appointments
                      </Link>
                    )}
                    
                    <button
                      className="flex items-center w-full text-left text-red-600 font-medium px-4 py-3 hover:bg-red-50 transition-all duration-200 mt-2"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="py-3">
                    <Link
                      to="/login"
                      className={`flex items-center px-4 py-3 transition-all duration-200 ${
                        activePath === "/login" 
                          ? "bg-blue-100 text-blue-600 font-semibold" 
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className={`flex items-center py-3 px-4 transition-all duration-200 ${
                        activePath === "/signup"
                          ? "bg-blue-100 text-blue-600 font-semibold" 
                          : "text-blue-600 hover:bg-blue-50 font-medium"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
