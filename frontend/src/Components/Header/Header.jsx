import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
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
        loadUserData();
      }
    };

    const handleLogoutEvent = () => {
      setUser(null);
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
    
    // Dispatch custom logout event for other components
    window.dispatchEvent(new Event('logout'));
    window.dispatchEvent(new CustomEvent('auth-state-change', { 
      detail: { isAuthenticated: false, user: null } 
    }));

    navigate('/');
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.name || user.firstName || user.email?.split('@')[0] || 'User';
  };

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Section - HelaMed Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 group" aria-label="HelaMed Home">
              {/* Professional Medical Logo with Medical Cross */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                  {/* Medical Cross Icon */}
                  <svg 
                    className="w-6 h-6 text-white" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M10 2h4v7h7v4h-7v9h-4v-9H3v-4h7V2z" />
                  </svg>
                </div>
                {/* Pulse animation effect on hover */}
                <div className="absolute inset-0 w-10 h-10 bg-blue-400 rounded-lg opacity-0 group-hover:opacity-20 group-hover:animate-ping"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                HelaMed
              </span>
            </Link>
          </div>

          {/* Center Section - Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center justify-center flex-1 space-x-1" aria-label="Main navigation">
            <Link
              to="/"
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                activePath === '/'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
              aria-current={activePath === '/' ? 'page' : undefined}
            >
              Home
            </Link>
            {/* {user && user.role === 'patient' && (
              <Link
                to="/patient-dashboard"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                  activePath === '/patient-dashboard'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                aria-current={activePath === '/patient-dashboard' ? 'page' : undefined}
              >
                My Dashboard
              </Link>
            )} */}
            <Link
              to="/doctor-channelings"
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                activePath === '/doctor-channelings'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
              aria-current={activePath === '/doctor-channelings' ? 'page' : undefined}
            >
              Doctor Channelings
            </Link>
            <Link
              to="/laboratory"
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                activePath === '/laboratory'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
              aria-current={activePath === '/laboratory' ? 'page' : undefined}
            >
              Laboratory
            </Link>
            <Link
              to="/about-us"
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                activePath === '/about-us'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
              aria-current={activePath === '/about-us' ? 'page' : undefined}
            >
              About Us
            </Link>
            <Link
              to="/contact-us"
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                activePath === '/contact-us'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
              aria-current={activePath === '/contact-us' ? 'page' : undefined}
            >
              Contact Us
            </Link>
          </nav>

          {/* Right Section - Authentication Buttons (Desktop) */}
          <div className="hidden md:flex items-center flex-shrink-0 space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  {/* Hello, <span className="font-semibold text-blue-600">{getUserDisplayName()}</span> */}
                </span>
                {user.role === 'patient' && (
                  <Link
                    to="/patient-dashboard"
                    className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-teal-600 rounded-md hover:from-blue-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                    aria-label="Go to Patient Dashboard"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-md hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                  aria-label="Logout from your account"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="px-5 py-2 text-sm font-medium text-blue-600 bg-white border-2 border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 transition-all duration-300"
                  aria-label="Register a new account"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-teal-600 rounded-md hover:from-blue-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                  aria-label="Login to your account"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-300"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
            {isMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200 shadow-lg">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
              activePath === '/'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
            onClick={() => setIsMenuOpen(false)}
            aria-current={activePath === '/' ? 'page' : undefined}
          >
            Home
          </Link>
          {user && user.role === 'patient' && (
            <Link
              to="/patient-dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                activePath === '/patient-dashboard'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
              aria-current={activePath === '/patient-dashboard' ? 'page' : undefined}
            >
              My Dashboard
            </Link>
          )}
          <Link
            to="/doctor-channelings"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
              activePath === '/doctor-channelings'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
            onClick={() => setIsMenuOpen(false)}
            aria-current={activePath === '/doctor-channelings' ? 'page' : undefined}
          >
            Doctor Channelings
          </Link>
          <Link
            to="/laboratory"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
              activePath === '/laboratory'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
            onClick={() => setIsMenuOpen(false)}
            aria-current={activePath === '/laboratory' ? 'page' : undefined}
          >
            Laboratory
          </Link>
          <Link
            to="/about-us"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
              activePath === '/about-us'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
            onClick={() => setIsMenuOpen(false)}
            aria-current={activePath === '/about-us' ? 'page' : undefined}
          >
            About Us
          </Link>
          <Link
            to="/contact-us"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
              activePath === '/contact-us'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
            onClick={() => setIsMenuOpen(false)}
            aria-current={activePath === '/contact-us' ? 'page' : undefined}
          >
            Contact Us
          </Link>
          
          {/* Mobile Authentication */}
          <div className="pt-4 pb-2 border-t border-gray-200">
            {user ? (
              <div className="space-y-3">
                <div className="px-3 py-2">
                  <p className="text-sm text-gray-700">
                    Hello, <span className="font-semibold text-blue-600">{getUserDisplayName()}</span>
                  </p>
                </div>
                {user.role === 'patient' && (
                  <Link
                    to="/patient-dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full block px-3 py-2 text-center rounded-md text-base font-medium text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 transition-all duration-300 shadow-md"
                    aria-label="Go to Patient Dashboard"
                  >
                    My Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-center rounded-md text-base font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md"
                  aria-label="Logout from your account"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/signup"
                  className="block w-full px-3 py-2 text-center rounded-md text-base font-medium text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Register a new account"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="block w-full px-3 py-2 text-center rounded-md text-base font-medium text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 transition-all duration-300 shadow-md"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Login to your account"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
