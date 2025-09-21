import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  Users,
  Calendar,
  Package,
  Activity,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  Search,
  Bell,
  Home
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsCount, setNotificationsCount] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      // Set default values if properties are missing
      setUser({
        username: '',
        email: '',
        role: 'user',
        ...parsedUser
      });
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
      return;
    }

    // Handle responsive sidebar
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Define sidebar navigation items based on user role
  const getSidebarItems = () => {
    if (!user) return [];
    
    const allItems = [
      { name: 'Dashboard', path: '/dashboard', icon: Home, roles: ['admin'] },
      { name: 'Patient Management', path: '/patient-dashboard', icon: User, roles: ['admin', 'doctor', 'staff'] },
      { name: 'Doctor & Staff', path: '/doctors', icon: Users, roles: ['admin', 'doctor', 'staff'] },
      { name: 'Appointments', path: '/appointments', icon: Calendar, roles: ['admin', 'doctor', 'staff'] },
      { name: 'Inventory & Pharmacy', path: '/inventory', icon: Package, roles: ['admin', 'pharmacist'] },
      { name: 'Laboratory', path: '/laboratory', icon: Activity, roles: ['admin', 'lab_technician'] },
      { name: 'Analytics', path: '/analytics', icon: BarChart2, roles: ['admin'] },
      { name: 'Settings', path: '/settings', icon: Settings, roles: ['admin'] }
    ];

    return allItems.filter(item => item.roles.includes(user.role));
  };

  if (!user) return null;

  const sidebarItems = getSidebarItems();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-30 w-64 transform overflow-y-auto bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64 lg:flex-shrink-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <Link to="/" className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-blue-600">MediCare HMS</h1>
            </Link>
          </div>

          {/* Sidebar menu */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left side - Mobile menu button */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-500 focus:outline-none focus:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Search */}
              <div className="ml-4 relative max-w-xs w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Right side - User menu and notifications */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="flex text-gray-500 focus:outline-none">
                  <Bell className="h-6 w-6" />
          {notificationsCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {notificationsCount}
            </span>
          )}
        </button>
      </div>
      {/* User menu */}
      <div className="relative">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
            {user.firstName
              ? user.firstName.charAt(0).toUpperCase()
              : user.username
              ? user.username.charAt(0).toUpperCase()
              : user.email
              ? user.email.charAt(0).toUpperCase()
              : "U"}
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.username
                  ? user.username
                  : user.email
                  ? user.email
                  : "User"}
              </p>
              <p className="text-xs text-gray-500">
                {user.role
                  ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  : 'User'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</header>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;