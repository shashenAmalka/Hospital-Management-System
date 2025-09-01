import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and has appropriate role
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || !['admin', 'doctor', 'staff', 'lab_technician'].includes(userData.role)) {
      navigate('/login');
      return;
    }
    setUser(userData);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  // Role-based component visibility
  const canAccess = (requiredRoles) => {
    return requiredRoles.includes(user.role);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white shadow-lg">
        <div className="p-5 border-b border-blue-700">
          <h1 className="text-xl font-bold">MediCare HMS</h1>
          <p className="text-sm text-blue-200 mt-1 capitalize">{user.role}</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/admin-dashboard" 
                className={`flex items-center p-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <i className="fas fa-tachometer-alt mr-3"></i>
                Dashboard
              </Link>
            </li>
            
            {/* Patient Management - Admin, Doctor, Staff */}
            {(canAccess(['admin', 'doctor', 'staff'])) && (
              <li>
                <Link 
                  to="/patients" 
                  className={`flex items-center p-3 rounded-lg transition-colors ${activeTab === 'patients' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                  onClick={() => setActiveTab('patients')}
                >
                  <i className="fas fa-user-injured mr-3"></i>
                  Patient Management
                </Link>
              </li>
            )}
            
            {/* Doctor & Staff Management - Admin Only */}
            {(canAccess(['admin'])) && (
              <li>
                <Link 
                  to="/staff" 
                  className={`flex items-center p-3 rounded-lg transition-colors ${activeTab === 'staff' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                  onClick={() => setActiveTab('staff')}
                >
                  <i className="fas fa-user-md mr-3"></i>
                  Doctor & Staff
                </Link>
              </li>
            )}
            
            {/* Inventory & Pharmacy - Admin, Staff */}
            {(canAccess(['admin', 'staff'])) && (
              <li>
                <Link 
                  to="/inventory" 
                  className={`flex items-center p-3 rounded-lg transition-colors ${activeTab === 'inventory' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                  onClick={() => setActiveTab('inventory')}
                >
                  <i className="fas fa-pills mr-3"></i>
                  Inventory & Pharmacy
                </Link>
              </li>
            )}
            
            {/* Appointments - Admin, Doctor, Staff */}
            {(canAccess(['admin', 'doctor', 'staff'])) && (
              <li>
                <Link 
                  to="/appointments" 
                  className={`flex items-center p-3 rounded-lg transition-colors ${activeTab === 'appointments' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                  onClick={() => setActiveTab('appointments')}
                >
                  <i className="fas fa-calendar-check mr-3"></i>
                  Appointments
                </Link>
              </li>
            )}
            
            {/* Laboratory - Admin, Doctor, Lab Technician */}
            {(canAccess(['admin', 'doctor', 'lab_technician'])) && (
              <li>
                <Link 
                  to="/laboratory" 
                  className={`flex items-center p-3 rounded-lg transition-colors ${activeTab === 'laboratory' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                  onClick={() => setActiveTab('laboratory')}
                >
                  <i className="fas fa-flask mr-3"></i>
                  Laboratory
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <i className="fas fa-bell text-gray-600"></i>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <i className="fas fa-user"></i>
              </div>
              <div>
                <p className="text-sm font-medium capitalize">{user.role}</p>
                <button 
                  onClick={handleLogout}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Welcome Message */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.name}!</h1>
            <p className="text-gray-600 mt-2">You are logged in as {user.role}</p>
          </div>

          {/* Role-specific content */}
          {user.role === 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Admin-specific stats cards */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Total Patients</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">--</p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <i className="fas fa-user-injured text-blue-600"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Active Staff</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">--</p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <i className="fas fa-user-md text-green-600"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Today's Appointments</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">--</p>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <i className="fas fa-calendar-check text-yellow-600"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Occupancy Rate</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">--%</p>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <i className="fas fa-bed text-purple-600"></i>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Doctor-specific content */}
          {user.role === 'doctor' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Appointments</h3>
                <p className="text-3xl font-bold text-blue-600">--</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Patients Waiting</h3>
                <p className="text-3xl font-bold text-green-600">--</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Lab Results Pending</h3>
                <p className="text-3xl font-bold text-yellow-600">--</p>
              </div>
            </div>
          )}

          {/* Common components for all roles */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities - Visible to all roles */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">System updated successfully</p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Completed</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">New patient registered</p>
                    <p className="text-sm text-gray-500">4 hours ago</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">New</span>
                </div>
              </div>
            </div>

            {/* Quick Actions - Role specific */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {canAccess(['admin', 'doctor', 'staff']) && (
                    <button className="w-full text-left p-3 hover:bg-blue-50 rounded-lg transition-colors">
                      <i className="fas fa-plus-circle mr-2 text-blue-600"></i>
                      New Appointment
                    </button>
                  )}
                  {canAccess(['admin', 'doctor']) && (
                    <button className="w-full text-left p-3 hover:bg-green-50 rounded-lg transition-colors">
                      <i className="fas fa-file-medical mr-2 text-green-600"></i>
                      Request Lab Test
                    </button>
                  )}
                  {canAccess(['admin', 'staff']) && (
                    <button className="w-full text-left p-3 hover:bg-yellow-50 rounded-lg transition-colors">
                      <i className="fas fa-pills mr-2 text-yellow-600"></i>
                      Check Inventory
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;