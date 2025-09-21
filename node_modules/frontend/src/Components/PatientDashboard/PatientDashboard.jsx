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
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Welcome back, {user.firstName || user.username}!
              </h1>
              <p className="text-slate-600">Manage your healthcare journey from your personal dashboard.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Patient ID: #{user._id ? user._id.substring(0, 8) : 'N/A'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 px-4 py-2 rounded-md border border-red-200 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
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
            {activeTab === 'overview' && <OverviewTab user={user} userFullName={user?.fullName} />}
            {activeTab === 'profile' && <ProfileTab user={user} setUser={setUser} />}
            {activeTab === 'appointments' && <AppointmentsTab user={user} />}
            {activeTab === 'history' && <HistoryTab user={user} />}
            {activeTab === 'documents' && <DocumentsTab user={user} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;