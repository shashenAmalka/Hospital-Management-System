import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, LogOut } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin': return '/admin-dashboard';
      case 'doctor': return '/doctor-dashboard';
      case 'pharmacist': return '/pharmacist-dashboard';
      case 'lab_technician': return '/lab-dashboard';
      case 'staff': return '/staff-dashboard';
      case 'patient': return '/patient-dashboard';
      default: return '/patient-dashboard';
    }
  };

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <i className="fas fa-hospital text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-600">HelaMed</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              to={"/"}
              className="text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition duration-200"
            >
              Home
            </Link>

            {user && (
              <>
                <Link
                  to={getDashboardLink()}
                  className="text-gray-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition duration-200"
                >
                  Dashboard
                </Link>

                {['admin', 'doctor', 'staff'].includes(user.role) && (
                  <Link
                    to="/patients"
                    className="text-gray-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition duration-200"
                  >
                    Patients
                  </Link>
                )}

                {['admin', 'doctor', 'staff', 'patient'].includes(user.role) && (
                  <Link
                    to="/appointments"
                    className="text-gray-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition duration-200"
                  >
                    Appointments
                  </Link>
                )}

                {['admin', 'doctor', 'staff'].includes(user.role) && (
                  <Link
                    to="/doctors"
                    className="text-gray-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition duration-200"
                  >
                    Doctors
                  </Link>
                )}

                {['admin'].includes(user.role) && (
                  <Link to="/user-management" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50">
                    <Users className="h-5 w-5" />
                    <span>User Management</span>
                  </Link>
                )}
              </>
            )}

            <div className="h-6 border-l border-gray-300 mx-2"></div>

            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 px-4 py-2 rounded-md border border-red-200 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-lg p-4">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>

              {user && (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="text-gray-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>

                  {['admin', 'doctor', 'staff'].includes(user.role) && (
                    <Link
                      to="/patients"
                      className="text-gray-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Patients
                    </Link>
                  )}

                  {['admin', 'doctor', 'staff', 'patient'].includes(user.role) && (
                    <Link
                      to="/appointments"
                      className="text-gray-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Appointments
                    </Link>
                  )}

                  {['admin', 'doctor', 'staff'].includes(user.role) && (
                    <Link
                      to="/doctors"
                      className="text-gray-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Doctors
                    </Link>
                  )}
                </>
              )}
              
              <div className="border-t border-gray-200 pt-3 mt-2">
                {user ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full space-x-2 text-red-600 hover:text-red-700 px-4 py-2 rounded-md border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block text-center text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block text-center bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md mt-2"
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