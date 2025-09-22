import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OverviewTab from './OverviewTab';
import ProfileTab from './ProfileTab';
import AppointmentsTab from './AppointmentsTab';
import HistoryTab from './HistoryTab';
import DocumentsTab from './DocumentsTab';
import { 
  User, 
  Calendar, 
  FileText, 
  Heart, 
  Clock,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function PatientDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const API_URL = 'http://localhost:5000/api'; // Updated base URL

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      console.log('No token or user data found');
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      
      // Check for required user data with different possible ID fields
      if (!parsedUser || (!parsedUser._id && !parsedUser.id) || !parsedUser.role) {
        console.error('Invalid user data:', parsedUser);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      // Normalize the user data structure
      const normalizedUser = {
        _id: parsedUser._id || parsedUser.id,
        firstName: parsedUser.firstName || parsedUser.name?.split(' ')[0] || '',
        lastName: parsedUser.lastName || parsedUser.name?.split(' ')[1] || '',
        email: parsedUser.email,
        role: parsedUser.role,
        patientId: parsedUser.patientId || parsedUser._id || parsedUser.id,
        ...parsedUser
      };
      
      console.log('Normalized user data:', normalizedUser);
      setUser(normalizedUser);
      
      // Skip additional fetch if we already have the patient data
      if (normalizedUser.role === 'patient' && !normalizedUser.hasPatientData) {
        fetchPatientData(normalizedUser.patientId || normalizedUser._id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  const fetchPatientData = async (userId) => {
    if (!userId) {
      setError('Invalid patient ID');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/patients/${userId}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 404) {
        console.log('No additional patient data found, using basic user data');
        setUser(prev => ({ ...prev, hasPatientData: true }));
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const patientData = await response.json();
      setUser(prev => ({
        ...prev,
        ...patientData,
        hasPatientData: true,
        _id: prev._id
      }));
    } catch (error) {
      console.error('Error fetching patient data:', error);
      // Don't show error for 404, just use basic user data
      if (!error.message.includes('404')) {
        setError('Failed to load complete patient data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'history', label: 'Visit History', icon: Clock },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  // Add a formatted full name for the user
  useEffect(() => {
    if (user) {
      const formattedUser = {
        ...user,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown Patient'
      };
      setUser(formattedUser);
    }
  }, [user?.firstName, user?.lastName, user?.username]);

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return <OverviewTab user={user} onChangeTab={setActiveTab} />;
      case 'appointments':
        return <AppointmentsTab user={user} />;
      case 'profile':
        return <ProfileTab user={user} setUser={setUser} />;
      case 'history':
        return <HistoryTab user={user} />;
      case 'documents':
        return <DocumentsTab user={user} />;
      default:
        return <OverviewTab user={user} onChangeTab={setActiveTab} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* User Avatar */}
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </span>
              </div>
              {/* Welcome Text */}
              <div>
                <h1 className="text-2xl font-bold text-slate-800 mb-1">
                  Welcome back, {user.firstName || user.username}!
                </h1>
                <p className="text-slate-600">Manage your healthcare journey from your personal dashboard.</p>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <User className="w-4 h-4 mr-1" />
                    {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                  </span>
                  <span className="text-sm text-slate-500">
                    
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Profile Quick Stats
              <div className="hidden md:flex items-center space-x-6 text-sm text-slate-600 bg-slate-50 rounded-lg px-4 py-2">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">12</div>
                  <div className="text-xs">Visits</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">3</div>
                  <div className="text-xs">Active Meds</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">5</div>
                  <div className="text-xs">Lab Results</div>
                </div>
              </div> */}
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="border-b border-slate-200">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;