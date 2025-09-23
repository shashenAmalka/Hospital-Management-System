import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [activePath, setActivePath] = useState(location.pathname);
  
  // Function to check and update user state from localStorage
  const checkUserStatus = () => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    // Clear any existing session on fresh page load if both token and user data don't exist together
    if ((userData && !token) || (!userData && token)) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      return;
    }
    
    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData);
        // Simple validation - check if token exists and user data is valid
        if (parsedUser && (parsedUser.email || parsedUser.username || parsedUser.firstName)) {
          setUser(parsedUser);
        } else {
          // Invalid user data, clear localStorage
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      // No authentication data found
      setUser(null);
    }
  };
  
  useEffect(() => {
    // Initial check
    checkUserStatus();
    
    // Listen for storage changes (when other tabs or components modify localStorage)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        checkUserStatus();
      }
    };
    
    // Listen for custom logout events
    const handleLogoutEvent = () => {
      checkUserStatus();
    };
    
    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('logout', handleLogoutEvent);
    
    // Periodic check for localStorage changes (useful for same-tab logout)
    // Use a longer interval to reduce performance impact
    const intervalId = setInterval(checkUserStatus, 2000);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logout', handleLogoutEvent);
      clearInterval(intervalId);
    };
  }, []);
  
  // Update active path when location changes
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    
    // Dispatch custom logout event for other components
    window.dispatchEvent(new Event('logout'));
    
    navigate('/');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    if (user.name) {
      return user.name.split(' ').map(n => n.charAt(0)).slice(0, 2).join('');
    }
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-3">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <span className="text-white text-2xl">HM</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-600">HelaMed</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center flex-grow space-x-2">
            <Link
              to={"/"}
              className={`px-4 py-2 rounded-lg transition duration-200 ${
                activePath === "/" 
                  ? "bg-blue-50 text-blue-600 font-semibold" 
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
              onClick={() => setActivePath("/")}
            >
              Home
            </Link>
            <Link
              to="/doctor-channelings"
              className={`px-4 py-2 rounded-lg transition duration-200 ${
                activePath === "/doctor-channelings" 
                  ? "bg-blue-50 text-blue-600 font-semibold" 
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
              onClick={() => setActivePath("/doctor-channelings")}
            >
              Doctor Channelings
            </Link>
            <Link
              to="/laboratory"
              className={`px-4 py-2 rounded-lg transition duration-200 ${
                activePath === "/laboratory" 
                  ? "bg-blue-50 text-blue-600 font-semibold" 
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
              onClick={() => setActivePath("/laboratory")}
            >
              Laboratory
            </Link>
            <Link
              to="/online-consultation"
              className={`px-4 py-2 rounded-lg transition duration-200 ${
                activePath === "/online-consultation" 
                  ? "bg-blue-50 text-blue-600 font-semibold" 
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
              onClick={() => setActivePath("/online-consultation")}
            >
              Online Consultation
            </Link>
            <Link
              to="/about-us"
              className={`px-4 py-2 rounded-lg transition duration-200 ${
                activePath === "/about-us" 
                  ? "bg-blue-50 text-blue-600 font-semibold" 
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
              onClick={() => setActivePath("/about-us")}
            >
              About Us
            </Link>
            <Link
              to="/contact-us"
              className={`px-4 py-2 rounded-lg transition duration-200 ${
                activePath === "/contact-us" 
                  ? "bg-blue-50 text-blue-600 font-semibold" 
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
              onClick={() => setActivePath("/contact-us")}
            >
              Contact Us
            </Link>
            
            <div className="h-6 border-l border-gray-300 mx-2"></div>
            
            {user ? (
              <div className="relative">
                <div className="flex items-center space-x-3">
                  {/* User Avatar with Dropdown */}
                  <div className="relative group">
                    <button 
                      className="flex items-center space-x-2"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                        {getUserInitials()}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-800">
                          {user.name || user.firstName || 'User'}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {user.role || 'Patient'}
                        </div>
                      </div>
                      <span className={`text-xs text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-200">
                        {/* Profile Section */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                              {getUserInitials()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800 text-sm">
                                {user.name || user.firstName || 'User'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {user.email || 'No email'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="py-2">
                          <Link 
                            to="/patient-dashboard"
                            className={`flex items-center px-4 py-3 hover:bg-blue-50 transition duration-200 ${
                              activePath === "/patient-dashboard" 
                                ? "bg-blue-50 text-blue-600 font-semibold" 
                                : "text-gray-700 hover:text-blue-600"
                            }`}
                            onClick={() => setDropdownOpen(false)}
                          >
                            <span className="w-5 mr-3"></span>
                            Dashboard
                          </Link>
                          
                          <Link 
                            to="/patient-dashboard/profile"
                            className={`flex items-center px-4 py-3 hover:bg-blue-50 transition duration-200 ${
                              activePath === "/patient-dashboard/profile" 
                                ? "bg-blue-50 text-blue-600 font-semibold" 
                                : "text-gray-700 hover:text-blue-600"
                            }`}
                            onClick={() => setDropdownOpen(false)}
                          >
                            <span className="w-5 h-5 mr-3"></span>
                            My Profile
                          </Link>
                          
                          <Link 
                            to="/patient-dashboard/appointments"
                            className={`flex items-center px-4 py-3 hover:bg-blue-50 transition duration-200 ${
                              activePath === "/patient-dashboard/appointments" 
                                ? "bg-blue-50 text-blue-600 font-semibold" 
                                : "text-gray-700 hover:text-blue-600"
                            }`}
                            onClick={() => setDropdownOpen(false)}
                          >
                            <span className="w-5 h-5 mr-3"></span>
                            My Appointments
                          </Link>
                        </div>

                        {/* Logout Section */}
                        <div className="border-t border-gray-100 pt-2">
                          <button 
                            className="flex items-center w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition duration-200"
                            onClick={() => {
                              handleLogout();
                              setDropdownOpen(false);
                            }}
                          >
                            <span className="w-5 h-5 mr-3"></span>
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg transition duration-200 ${
                    activePath === "/login" 
                      ? "bg-blue-50 text-blue-600 font-semibold" 
                      : "text-blue-600 hover:bg-blue-50"
                  }`}
                  onClick={() => setActivePath("/login")}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`py-2 px-4 rounded-lg transition duration-200 shadow-md ${
                    activePath === "/signup"
                      ? "bg-blue-700 text-white font-semibold" 
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                  onClick={() => setActivePath("/signup")}
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-600 p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="text-xl">{isMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-xl shadow-2xl p-4 border border-gray-200">
            <div className="flex flex-col space-y-3">
              {/* Main Navigation */}
              <Link
                to="/"
                className={`flex items-center px-4 py-3 rounded-lg transition duration-200 ${
                  activePath === "/" 
                    ? "bg-blue-50 text-blue-600 font-semibold" 
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              <Link
                to="/doctor-channelings"
                className={`flex items-center px-4 py-3 rounded-lg transition duration-200 ${
                  activePath === "/doctor-channelings" 
                    ? "bg-blue-50 text-blue-600 font-semibold" 
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Doctor Channelings
              </Link>
              
              <Link
                to="/laboratory"
                className={`flex items-center px-4 py-3 rounded-lg transition duration-200 ${
                  activePath === "/laboratory" 
                    ? "bg-blue-50 text-blue-600 font-semibold" 
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Laboratory
              </Link>
              
              <Link
                to="/online-consultation"
                className={`flex items-center px-4 py-3 rounded-lg transition duration-200 ${
                  activePath === "/online-consultation" 
                    ? "bg-blue-50 text-blue-600 font-semibold" 
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Online Consultation
              </Link>
              
              <Link
                to="/about-us"
                className={`flex items-center px-4 py-3 rounded-lg transition duration-200 ${
                  activePath === "/about-us" 
                    ? "bg-blue-50 text-blue-600 font-semibold" 
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              
              <Link
                to="/contact-us"
                className={`flex items-center px-4 py-3 rounded-lg transition duration-200 ${
                  activePath === "/contact-us" 
                    ? "bg-blue-50 text-blue-600 font-semibold" 
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact Us
              </Link>

              {/* User Section */}
              <div className="border-t border-gray-200 pt-4 mt-2">
                {user ? (
                  <>
                    {/* User Info */}
                    <div className="flex items-center space-x-3 px-4 py-3 mb-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {getUserInitials()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {user.name || user.firstName || 'User'}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {user.role || 'Patient'}
                        </div>
                      </div>
                    </div>

                    {/* User Links */}
                    <Link
                      to="/patient-dashboard"
                      className={`flex items-center px-4 py-3 rounded-lg transition duration-200 ${
                        activePath === "/patient-dashboard"
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    
                    <Link
                      to="/patient-dashboard/profile"
                      className={`flex items-center px-4 py-3 rounded-lg transition duration-200 ${
                        activePath === "/patient-dashboard/profile" 
                          ? "bg-blue-50 text-blue-600 font-semibold" 
                          : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    
                    <Link
                      to="/patient-dashboard/appointments"
                      className={`flex items-center px-4 py-3 rounded-lg transition duration-200 ${
                        activePath === "/patient-dashboard/appointments" 
                          ? "bg-blue-50 text-blue-600 font-semibold" 
                          : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Appointments
                    </Link>
                    
                    <button
                      className="flex items-center w-full text-left text-red-600 font-medium px-4 py-3 rounded-lg hover:bg-red-50 transition duration-200"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className={`flex items-center px-4 py-3 rounded-lg transition duration-200 ${
                        activePath === "/login" 
                          ? "bg-blue-50 text-blue-600 font-semibold" 
                          : "text-blue-600 hover:bg-blue-50"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className={`flex items-center py-3 px-4 rounded-lg transition duration-200 shadow-md mt-2 ${
                        activePath === "/signup"
                          ? "bg-blue-700 text-white font-semibold" 
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
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