import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Heart, 
  Pill, 
  Beaker, 
  Trash, 
  Edit, 
  Clock,
  TrendingUp,
  Activity,
  Users,
  FileText,
  Shield,
  Bell,
  ChevronRight,
  Plus,
  Download,
  Eye,
  Star,
  Award,
  Target,
  BarChart3,
  Sparkles,
  AlertTriangle,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../utils/api';

const OverviewTab = ({ user, onChangeTab }) => {
  const [stats, setStats] = useState({
    appointments: [],
    visitCount: 0,
    medicationCount: 0,
    labRequests: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLabRequestModal, setShowLabRequestModal] = useState(false);
  const [labRequest, setLabRequest] = useState({ 
    testType: '', 
    priority: 'normal', 
    notes: '',
    patientName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : ''
  });
  const [labRequests, setLabRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewRequestModalOpen, setIsViewRequestModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRequest, setDeletingRequest] = useState(null);
  const [requestTimeLeft, setRequestTimeLeft] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (user?._id) {
      fetchOverviewData();
      fetchLabRequests();
      fetchUpcomingAppointments();
    }
  }, [user?._id]);

  useEffect(() => {
    if (user) {
      setLabRequest(prev => ({
        ...prev,
        patientName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username
      }));
    }
  }, [user]);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      // Fetch appointments
      try {
        const appointmentsResponse = await fetch(`${API_URL}/appointments/user/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (appointmentsResponse.ok) {
          const appointmentsResult = await appointmentsResponse.json();
          const appointmentsData = Array.isArray(appointmentsResult.data) ? appointmentsResult.data : [];
          
          setStats(prevStats => ({
            ...prevStats,
            appointments: appointmentsData,
            visitCount: appointmentsData.filter(apt => apt.status === 'completed').length || 0
          }));
        } else {
          setStats(prevStats => ({
            ...prevStats,
            appointments: [],
            visitCount: 0
          }));
        }
      } catch (err) {
        console.log('Appointments not available:', err.message);
        setStats(prevStats => ({
          ...prevStats,
          appointments: [],
          visitCount: 0
        }));
      }

      // Fetch medications
      try {
        const medicationsResponse = await fetch(`${API_URL}/medication/user/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (medicationsResponse.ok) {
          const medicationsResult = await medicationsResponse.json();
          const medicationsData = medicationsResult.data || [];
          
          setStats(prevStats => ({
            ...prevStats,
            medicationCount: medicationsData.length || 0
          }));
        } else {
          setStats(prevStats => ({
            ...prevStats,
            medicationCount: 0
          }));
        }
      } catch (err) {
        console.log('Medications not available:', err.message);
        setStats(prevStats => ({
          ...prevStats,
          medicationCount: 0
        }));
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching overview data:', err);
      setStats({
        appointments: [],
        visitCount: 0,
        medicationCount: 0,
        labRequests: 0
      });
      setLoading(false);
    }
  };

  const fetchLabRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLabRequests([]);
        return;
      }

      const response = await fetch(`${API_URL}/lab-requests/patient`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const requests = data.data || [];
        
        // Calculate canEdit flag based on one-hour rule
        const requestsWithEditFlag = requests.map(request => {
          const oneHour = 60 * 60 * 1000;
          const canEdit = (
            request.status === 'pending' && 
            (Date.now() - new Date(request.createdAt).getTime() <= oneHour)
          );
          
          return {
            ...request,
            canEdit
          };
        });
        
        setLabRequests(requestsWithEditFlag);
        setStats(prev => ({ ...prev, labRequests: requestsWithEditFlag.length || 0 }));
        
        // Initialize timeLeft for each request
        const initialTimeLeft = {};
        requestsWithEditFlag.forEach(request => {
          if (request.status === 'pending') {
            const oneHour = 60 * 60 * 1000;
            const createdAt = new Date(request.createdAt).getTime();
            const timeElapsed = Date.now() - createdAt;
            const timeLeft = oneHour - timeElapsed;
            
            initialTimeLeft[request._id] = timeLeft > 0 ? timeLeft : 0;
          }
        });
        setRequestTimeLeft(initialTimeLeft);
      } else {
        console.error('Failed to fetch lab requests:', response.status);
        setLabRequests([]);
        setStats(prev => ({ ...prev, labRequests: 0 }));
      }
    } catch (error) {
      console.error('Error fetching lab requests:', error);
      setLabRequests([]);
      setStats(prev => ({ ...prev, labRequests: 0 }));
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No authentication token found');
        return;
      }

      // Fetch upcoming appointments
      const response = await appointmentService.getUpcoming();
      console.log('Upcoming appointments response:', response);

      if (response && response.data) {
        // Filter appointments for current user if needed
        const userAppointments = Array.isArray(response.data) ? 
          response.data.filter(appointment => 
            appointment.patient && 
            ((typeof appointment.patient === 'object' && appointment.patient._id === user._id) || 
             (typeof appointment.patient === 'string' && appointment.patient === user._id))
          ) : [];
        
        // Sort by date (closest first)
        const sortedAppointments = userAppointments.sort((a, b) => 
          new Date(a.appointmentDate) - new Date(b.appointmentDate)
        );
        
        console.log('Filtered upcoming appointments:', sortedAppointments);
        setUpcomingAppointments(sortedAppointments.slice(0, 3)); // Show up to 3 appointments
      }
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
    }
  };

  const handleLabRequest = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      console.log('Submitting lab request:', labRequest);
      const response = await fetch(`${API_URL}/lab-requests/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          testType: labRequest.testType,
          priority: labRequest.priority,
          notes: labRequest.notes,
          patientName: labRequest.patientName
        })
      });

      const responseData = await response.json();
      console.log('Lab request response:', responseData);

      if (response.ok) {
        alert('Lab request submitted successfully!');
        setShowLabRequestModal(false);
        setLabRequest({
          testType: '',
          priority: 'normal',
          notes: '',
          patientName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username
        });
        
        // Refresh the lab requests list
        await fetchLabRequests();
      } else {
        console.error('Lab request failed:', responseData);
        alert(`Error: ${responseData.message || 'Failed to submit lab request'}`);
      }
    } catch (error) {
      console.error('Error submitting lab request:', error);
      alert('Error submitting lab request. Please try again.');
    }
  };

  const handleDeleteLabRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      // Fixed the route path - removed the underscore
      const response = await fetch(`${API_URL}/lab-requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Lab request deleted successfully');
        setIsDeleteModalOpen(false);
        setDeletingRequest(null);
        
        // Refresh lab requests
        await fetchLabRequests();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to delete lab request'}`);
      }
    } catch (error) {
      console.error('Error deleting lab request:', error);
      alert('Error deleting lab request. Please try again.');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-rose-100 text-rose-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeLeft = (requestId) => {
    const timeLeft = requestTimeLeft[requestId];
    if (!timeLeft || timeLeft <= 0) return "Time expired";
    
    const minutes = Math.floor(timeLeft / (60 * 1000));
    const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
    
    return `${minutes}m ${seconds}s left`;
  };

  const nextAppointment = Array.isArray(stats.appointments) && stats.appointments.length > 0 ? stats.appointments[0] : null;

  // Filtered lab requests based on search term
  const filteredLabRequests = labRequests.filter(request => {
    return request.testType.toLowerCase().includes(searchTerm.toLowerCase()) ||
           request.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
           request.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (request.notes && request.notes.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setIsViewRequestModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Next Appointment</p>
              {nextAppointment ? (
                <>
                  <p className="text-xl font-bold text-gray-800 mt-1">
                    {formatDate(nextAppointment.appointmentDate)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {nextAppointment.doctor?.firstName} {nextAppointment.doctor?.lastName}
                  </p>
                </>
              ) : (
                <p className="text-xl font-bold text-gray-800 mt-1">None</p>
              )}
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Visits</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{stats.visitCount}</p>
              <p className="text-sm text-gray-600 mt-1">This year</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Medications</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{stats.medicationCount}</p>
              <p className="text-sm text-gray-600 mt-1">Active prescriptions</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Pill className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Lab Requests</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{stats.labRequests}</p>
              <p className="text-sm text-gray-600 mt-1">This month</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Beaker className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Upcoming Appointments
            </h2>
            <button 
              onClick={() => onChangeTab('appointments')}
              className="text-blue-600 text-sm font-medium"
            >
              View all
            </button>
          </div>
          
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment._id} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-blue-800">
                        {typeof appointment.doctor === 'object' 
                          ? `Dr. ${appointment.doctor.firstName || ''} ${appointment.doctor.lastName || ''}` 
                          : 'Assigned Doctor'}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        {typeof appointment.department === 'object'
                          ? appointment.department.name
                          : appointment.department}
                      </p>
                      <p className="text-sm text-blue-700 font-medium mt-2">
                        {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}{' '}
                        at {appointment.appointmentTime}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'scheduled'
                        ? 'bg-yellow-100 text-yellow-800'
                        : appointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {appointment.status}
                    </div>
                    <button 
                      onClick={() => onChangeTab('appointments')}
                      className="ml-auto text-blue-600 text-sm font-medium flex items-center"
                    >
                      Details <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming appointments</p>
              <button 
                onClick={() => onChangeTab('appointments')} 
                className="mt-3 text-blue-600 text-sm font-medium"
              >
                Schedule an appointment
              </button>
            </div>
          )}
        </div>

        {/* Health Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-600" />
              Health Summary
            </h2>
            <button className="text-blue-600 text-sm font-medium">View history</button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last checkup</span>
              <span className="font-medium">2 weeks ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Blood pressure</span>
              <span className="font-medium text-green-600">120/80 mmHg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Heart rate</span>
              <span className="font-medium">72 bpm</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Temperature</span>
              <span className="font-medium">98.6°F</span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors">
              Download Health Report
            </button>
          </div>
        </div>
      </div>

      {/* Lab Requests Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Beaker className="h-5 w-5 mr-2 text-purple-600" />
              Laboratory Requests
            </h2>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <button
              onClick={() => setShowLabRequestModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </button>
          </div>
        </div>

        {filteredLabRequests.length === 0 ? (
          <div className="text-center py-8">
            {searchTerm ? (
              <>
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No lab requests found matching "{searchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 text-sm font-medium hover:text-blue-800"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <Beaker className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No lab requests yet</p>
                <p className="text-sm text-gray-400">Submit your first lab test request</p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLabRequests.map(request => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{request.testType}</div>
                      <div className="text-sm text-gray-500">{request.notes}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        request.priority === 'urgent' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewRequest(request)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {request.canEdit && (
                          <>
                            <button 
                              onClick={() => {
                                setIsEditModalOpen(true);
                                setEditingRequest(request);
                              }}
                              className="text-green-600 hover:text-green-800"
                              title="Edit request"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setIsDeleteModalOpen(true);
                                setDeletingRequest(request);
                              }}
                              className="text-red-600 hover:text-red-800"
                              title="Delete request"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
            <Calendar className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Book Appointment</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
            <FileText className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">View Records</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
            <Download className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Download Reports</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
            <Users className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Contact Doctor</span>
          </button>
        </div>
      </div>

      {/* Lab Request Modal */}
      {showLabRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Request Laboratory Test</h3>
              <button 
                onClick={() => setShowLabRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleLabRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={labRequest.testType}
                  onChange={(e) => setLabRequest(prev => ({...prev, testType: e.target.value}))}
                >
                  <option value="">Select Test Type</option>
                  <option value="blood">Blood Test</option>
                  <option value="urine">Urine Test</option>
                  <option value="xray">X-Ray</option>
                  <option value="mri">MRI</option>
                  <option value="ct">CT Scan</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={labRequest.priority}
                  onChange={(e) => setLabRequest(prev => ({...prev, priority: e.target.value}))}
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Any specific instructions or notes"
                  value={labRequest.notes}
                  onChange={(e) => setLabRequest(prev => ({...prev, notes: e.target.value}))}
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLabRequestModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lab Request Modal */}
      {isEditModalOpen && editingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Edit Laboratory Test Request</h3>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingRequest(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                You can only edit this request within 1 hour of creation.
                <br />
                <span className="font-semibold">{getTimeLeft(editingRequest._id)}</span>
              </p>
            </div>
            
            <form onSubmit={handleLabRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={labRequest.testType}
                  onChange={(e) => setLabRequest(prev => ({...prev, testType: e.target.value}))}
                >
                  <option value="">Select Test Type</option>
                  <option value="blood">Blood Test</option>
                  <option value="urine">Urine Test</option>
                  <option value="xray">X-Ray</option>
                  <option value="mri">MRI</option>
                  <option value="ct">CT Scan</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={labRequest.priority}
                  onChange={(e) => setLabRequest(prev => ({...prev, priority: e.target.value}))}
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Any specific instructions or notes"
                  value={labRequest.notes}
                  onChange={(e) => setLabRequest(prev => ({...prev, notes: e.target.value}))}
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Update Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Lab Request Confirmation Modal */}
      {isDeleteModalOpen && deletingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Confirm Deletion</h3>
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingRequest(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-medium mb-1">Are you sure you want to delete this lab request?</p>
                <p className="text-sm text-red-600">
                  This action cannot be undone. The request will be permanently removed.
                  <br />
                  <span className="font-semibold">{getTimeLeft(deletingRequest._id)}</span> remaining to delete.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteLabRequest(deletingRequest._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
              >
                Delete Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Lab Request Modal */}
      {isViewRequestModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Laboratory Request Details</h3>
              <button 
                onClick={() => {
                  setIsViewRequestModalOpen(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-gray-800">
                  {selectedRequest.testType}
                </h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(selectedRequest.status)}`}>
                  {selectedRequest.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Requested on {formatDate(selectedRequest.createdAt)}
              </p>
              <div className="mt-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  selectedRequest.priority === 'urgent' 
                    ? 'bg-red-100 text-red-800' 
                    : selectedRequest.priority === 'emergency'
                    ? 'bg-red-200 text-red-900'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedRequest.priority} priority
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              {selectedRequest.notes && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Notes</h5>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedRequest.notes}</p>
                </div>
              )}
              
              {selectedRequest.statusHistory && selectedRequest.statusHistory.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Status History</h5>
                  <div className="space-y-2">
                    {selectedRequest.statusHistory.map((history, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{history.status}</span>
                          <span className="text-gray-500">
                            {new Date(history.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {history.notes && <p className="mt-1 text-gray-600">{history.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedRequest.status === 'completed' && selectedRequest.completedAt && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Completion Details</h5>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">
                    Completed on {new Date(selectedRequest.completedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsViewRequestModalOpen(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Close
              </button>
              
              {selectedRequest.canEdit && (
                <>
                  <button
                    onClick={() => {
                      setIsViewRequestModalOpen(false);
                      setEditingRequest(selectedRequest);
                      setIsEditModalOpen(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
                  >
                    Edit Request
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsViewRequestModalOpen(false);
                      setDeletingRequest(selectedRequest);
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                  >
                    Delete Request
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;