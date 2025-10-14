import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UserCircleIcon, 
  Squares2X2Icon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  InformationCircleIcon,
  PhoneIcon,
  BellIcon,
  ChevronDownIcon,
  CalendarIcon,
  BeakerIcon,
  ClipboardDocumentListIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout, getDashboardRoute, getUserDisplayName, getUserInitials } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [authState, setAuthState] = useState({ isAuthenticated, user });

  // Listen for auth state changes for real-time updates
  useEffect(() => {
    const handleAuthChange = (event) => {
      setAuthState({
        isAuthenticated: event.detail.isAuthenticated,
        user: event.detail.user
      });
    };

    window.addEventListener('auth-state-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-state-change', handleAuthChange);
    };
  }, []);

  // Update local state when context changes
  useEffect(() => {
    setAuthState({ isAuthenticated, user });
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const handleDashboardClick = () => {
    const dashboardRoute = getDashboardRoute();
    navigate(dashboardRoute);
    setShowMobileMenu(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Get role-specific menu items
  const getRoleBasedMenuItems = () => {
    if (!authState.user) return [];

    const role = authState.user.role;
    
    const menuItems = {
      patient: [
        { name: 'Dashboard', path: '/patient-dashboard', icon: Squares2X2Icon },
        { name: 'Appointments', path: '/appointments', icon: CalendarIcon },
        { name: 'Lab Reports', path: '/lab-reports', icon: BeakerIcon },
      ],
      doctor: [
        { name: 'Dashboard', path: '/doctor/dashboard', icon: Squares2X2Icon },
        { name: 'My Schedule', path: '/doctor/schedule', icon: CalendarIcon },
        { name: 'Patients', path: '/doctor/patients', icon: ClipboardDocumentListIcon },
      ],
      admin: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: Squares2X2Icon },
        { name: 'User Management', path: '/admin/users', icon: UserCircleIcon },
        { name: 'Analytics', path: '/admin/analytics', icon: ClipboardDocumentListIcon },
      ],
      lab_technician: [
        { name: 'Lab Dashboard', path: '/lab-technician', icon: Squares2X2Icon },
        { name: 'Tests', path: '/lab-technician/tests', icon: BeakerIcon },
        { name: 'Inventory', path: '/lab-technician/inventory', icon: ClipboardDocumentListIcon },
      ],
      pharmacist: [
        { name: 'Dashboard', path: '/pharmacist/dashboard', icon: Squares2X2Icon },
        { name: 'Inventory', path: '/pharmacist/inventory', icon: ClipboardDocumentListIcon },
        { name: 'Prescriptions', path: '/pharmacist/prescriptions', icon: CalendarIcon },
      ],
    };

    return menuItems[role] || [];
  };

  const roleMenuItems = getRoleBasedMenuItems();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 shadow-md">
                  <svg 
                    className="w-6 h-6 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                  </svg>
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                HelaMed
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {!authState.isAuthenticated ? (
              <>
                {/* Public Navigation */}
                <Link
                  to="/"
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActivePath('/') 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <HomeIcon className="w-5 h-5 mr-2" />
                  Home
                </Link>
                <Link
                  to="/about"
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActivePath('/about') 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <InformationCircleIcon className="w-5 h-5 mr-2" />
                  About
                </Link>
                <Link
                  to="/contact"
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActivePath('/contact') 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <PhoneIcon className="w-5 h-5 mr-2" />
                  Contact
                </Link>
                
                {/* Auth Buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    to="/login"
                    className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <UserPlusIcon className="w-5 h-5 mr-2" />
                    Register
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Authenticated Navigation */}
                {roleMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActivePath(item.path) 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}

                {/* Notifications */}
                <button className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <BellIcon className="w-6 h-6" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <div className="relative ml-4">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {getUserInitials()}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500 capitalize">{authState.user?.role}</p>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
                        <p className="text-xs text-gray-500">{authState.user?.email}</p>
                      </div>
                      
                      <button
                        onClick={handleDashboardClick}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      >
                        <Squares2X2Icon className="w-5 h-5 mr-3 text-gray-400" />
                        Dashboard
                      </button>
                      
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      >
                        <UserCircleIcon className="w-5 h-5 mr-3 text-gray-400" />
                        My Profile
                      </Link>
                      
                      <div className="border-t border-gray-200 my-2"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              {showMobileMenu ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {!authState.isAuthenticated ? (
              <>
                <Link
                  to="/"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${
                    isActivePath('/') 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <HomeIcon className="w-5 h-5 mr-3" />
                  Home
                </Link>
                <Link
                  to="/about"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${
                    isActivePath('/about') 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <InformationCircleIcon className="w-5 h-5 mr-3" />
                  About
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${
                    isActivePath('/contact') 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <PhoneIcon className="w-5 h-5 mr-3" />
                  Contact
                </Link>
                
                <div className="pt-4 border-t border-gray-200 space-y-1">
                  <Link
                    to="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-white bg-gradient-to-r from-blue-600 to-teal-600"
                  >
                    <UserPlusIcon className="w-5 h-5 mr-3" />
                    Register
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* User Info */}
                <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                    {getUserInitials()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500 capitalize">{authState.user?.role}</p>
                  </div>
                </div>

                {/* Role-based Menu Items */}
                {roleMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${
                        isActivePath(item.path) 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}

                <Link
                  to="/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100"
                >
                  <UserCircleIcon className="w-5 h-5 mr-3" />
                  My Profile
                </Link>

                <div className="pt-2 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;