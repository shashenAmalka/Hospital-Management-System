import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle,
  MessageSquare 
} from 'lucide-react';

const StaffDashboard = () => {
  const [stats, setStats] = useState({
    totalAppointments: 42,
    todayAppointments: 14,
    pendingRequests: 7,
    messageCount: 5
  });
  
  const [appointments, setAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating data fetching
    setTimeout(() => {
      setAppointments([
        { id: 1, patientName: 'James Wilson', time: '10:00 AM', doctor: 'Dr. Sarah Johnson', status: 'confirmed', type: 'Follow-up' },
        { id: 2, patientName: 'Emily Thompson', time: '11:30 AM', doctor: 'Dr. Michael Brown', status: 'checked-in', type: 'Consultation' },
        { id: 3, patientName: 'Michael Brown', time: '1:45 PM', doctor: 'Dr. Robert Davis', status: 'pending', type: 'Check-up' },
        { id: 4, patientName: 'Sarah Davis', time: '3:15 PM', doctor: 'Dr. Sarah Johnson', status: 'confirmed', type: 'Test Results' },
      ]);
      
      setRecentPatients([
        { id: 101, name: 'Robert Johnson', age: 45, phone: '(555) 123-4567', lastVisit: '2023-09-01' },
        { id: 102, name: 'Lisa Miller', age: 38, phone: '(555) 987-6543', lastVisit: '2023-09-05' },
        { id: 103, name: 'Kevin Wilson', age: 29, phone: '(555) 456-7890', lastVisit: '2023-09-10' },
      ]);
      
      setLoading(false);
    }, 800);
  }, []);

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'checked-in': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800'; // pending
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Staff Dashboard</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">All Appointments</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalAppointments}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Today's Schedule</p>
                <p className="text-2xl font-bold text-slate-800">{stats.todayAppointments}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Pending Requests</p>
                <p className="text-2xl font-bold text-slate-800">{stats.pendingRequests}</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-full">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">New Messages</p>
                <p className="text-2xl font-bold text-slate-800">{stats.messageCount}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Appointments */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="border-b border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800">Today's Appointments</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {appointments.map(appointment => (
                      <tr key={appointment.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                          {appointment.patientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {appointment.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {appointment.doctor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {appointment.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {appointments.length === 0 && (
                <div className="text-center py-4 text-slate-500">
                  No appointments today
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
                        <p className="text-xs text-slate-500 mt-1">Age: {patient.age} • Phone: {patient.phone}</p>
                        <p className="text-xs text-slate-500 mt-1">Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}</p>
                        <div className="mt-2">
                          <button className="text-sm text-blue-600 hover:text-blue-800">
                            View Profile
                          </button>
                        </div>
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

export default StaffDashboard;
