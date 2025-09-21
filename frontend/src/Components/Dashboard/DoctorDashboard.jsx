import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { dashboardService, appointmentService } from '../../utils/api';

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingTests: 0,
    completedAppointments: 0
  });
  
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const response = await dashboardService.getDoctorStats();
      if (response.data) {
        setStats(response.data.stats || stats);
        setUpcomingAppointments(response.data.appointments || []);
        setRecentPatients(response.data.recentPatients || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      
      // Fallback to dummy data for development/demo
      setUpcomingAppointments([
        { id: 1, patientName: 'James Wilson', time: '10:00 AM', status: 'confirmed', issue: 'Follow-up' },
        { id: 2, patientName: 'Emily Thompson', time: '11:30 AM', status: 'confirmed', issue: 'Consultation' },
        { id: 3, patientName: 'Michael Brown', time: '1:45 PM', status: 'pending', issue: 'Check-up' }
      ]);
      
      setRecentPatients([
        { id: 101, name: 'Robert Johnson', age: 45, lastVisit: '2023-09-01', condition: 'Hypertension' },
        { id: 102, name: 'Lisa Miller', age: 38, lastVisit: '2023-09-05', condition: 'Diabetes Type 2' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-red-800 mb-4">Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData} 
            className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header with Doctor Avatar */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center photo-frame">
                <i className="fas fa-user-md text-3xl text-blue-600"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
                <p className="text-blue-100 flex items-center">
                  <i className="fas fa-stethoscope mr-2"></i>
                  Managing patient care and appointments
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">4.9</div>
                <div className="text-sm text-blue-100">Rating</div>
                <div className="flex justify-center">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-yellow-300 text-xs"></i>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Stats Overview with Medical Icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">My Patients</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalPatients}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <i className="fas fa-arrow-up mr-1"></i>
                  +5% this month
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-users text-2xl text-blue-600"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Today's Appointments</p>
                <p className="text-2xl font-bold text-slate-800">{stats.todayAppointments}</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <i className="fas fa-clock mr-1"></i>
                  Next at 10:30 AM
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-calendar-check text-2xl text-purple-600"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Pending Tests</p>
                <p className="text-2xl font-bold text-slate-800">{stats.pendingTests}</p>
                <p className="text-sm text-amber-600 flex items-center mt-1">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  Needs attention
                </p>
              </div>
              <div className="bg-gradient-to-r from-amber-100 to-amber-200 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-flask text-2xl text-amber-600"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Completed Today</p>
                <p className="text-2xl font-bold text-slate-800">{stats.completedAppointments}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <i className="fas fa-check-circle mr-1"></i>
                  Great progress!
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-100 to-green-200 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-check-square text-2xl text-green-600"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="border-b border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800">Upcoming Appointments</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Issue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {upcomingAppointments.map(appointment => (
                      <tr key={appointment.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                          {appointment.patientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {appointment.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {appointment.issue}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {upcomingAppointments.length === 0 && (
                <div className="text-center py-4 text-slate-500">
                  No upcoming appointments
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Patients */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="border-b border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800">Recent Patients</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentPatients.map(patient => (
                  <div key={patient.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                    <div className="flex items-start">
                      <div className="bg-blue-100 rounded-full p-2 mr-3">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{patient.name}</p>
                        <p className="text-xs text-slate-500 mt-1">Age: {patient.age} • Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}</p>
                        <p className="text-sm text-slate-600 mt-1">{patient.condition}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {recentPatients.length === 0 && (
                <div className="text-center py-4 text-slate-500">
                  No recent patients
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
