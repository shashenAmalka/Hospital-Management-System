import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OverviewTab from './OverviewTab';
import ProfileTab from './ProfileTab';
import AppointmentsTab from './AppointmentsTab';
import HistoryTab from './HistoryTab';
import DocumentsTab from './DocumentsTab';
import NotificationBell from '../Notifications/NotificationBell';
import { 
  User, 
  Calendar, 
  FileText, 
  Heart, 
  Clock,
  LogOut
} from 'lucide-react';

function PatientDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');

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
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-teal-500 border-r-cyan-500 border-b-blue-500 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-teal-400 opacity-20 mx-auto"></div>
          </div>
          <p className="mt-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 font-bold text-lg animate-pulse">
            Loading your healthcare dashboard...
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md border border-white/50">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 font-bold text-xl mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header - Professional Healthcare Design */}
        <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 rounded-3xl shadow-2xl p-10 mb-8 relative overflow-hidden border-b-4 border-teal-400">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>
          
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-6">
              {/* User Avatar with Medical Theme */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-300 to-cyan-300 rounded-full blur-xl opacity-70 animate-pulse group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-400 rounded-full flex items-center justify-center shadow-2xl border-4 border-white ring-4 ring-teal-200/50">
                  <span className="text-3xl font-bold text-white drop-shadow-lg">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </span>
                </div>
              </div>
              {/* Welcome Text with Username Prominent */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
                    Welcome back, <span className="text-yellow-300">{user.username || user.firstName}</span>!
                  </h1>
                  <span className="text-3xl animate-wave">👋</span>
                </div>
                <p className="text-white/95 text-lg mb-3 drop-shadow font-medium">
                  Your health, our priority. Manage your complete healthcare journey here.
                </p>
                <div className="flex items-center space-x-3 flex-wrap gap-2">
                  <span className="inline-flex items-center px-5 py-2.5 bg-white/25 backdrop-blur-md text-white rounded-full text-sm font-bold border-2 border-white/40 shadow-lg hover:bg-white/35 transition-all">
                    <User className="w-4 h-4 mr-2" />
                    {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                  </span>
                  <span className="inline-flex items-center px-5 py-2.5 bg-emerald-500/90 backdrop-blur-md text-white rounded-full text-sm font-bold border-2 border-white/40 shadow-lg hover:bg-emerald-600 transition-all">
                    <Heart className="w-4 h-4 mr-2 animate-pulse" />
                    Active Patient
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              {user && user._id && <NotificationBell userId={user._id} />}
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Professional Healthcare Theme */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-teal-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 border-b-2 border-teal-100">
            <nav className="flex overflow-x-auto p-3 gap-3">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold text-sm transition-all duration-300 whitespace-nowrap group ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white shadow-xl scale-105 ring-4 ring-teal-200/60'
                        : 'text-slate-700 hover:text-teal-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 bg-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-white/10 rounded-2xl animate-pulse"></div>
                    )}
                    <tab.icon className={`h-5 w-5 relative z-10 transition-all ${
                      isActive ? 'drop-shadow-lg' : 'group-hover:scale-110 group-hover:text-teal-600'
                    }`} />
                    <span className="relative z-10 tracking-wide">{tab.label}</span>
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 rounded-full shadow-lg"></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8 bg-gradient-to-br from-white via-teal-50/20 to-cyan-50/20">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;