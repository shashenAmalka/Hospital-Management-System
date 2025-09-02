import React, { useState, useEffect } from 'react';
import { Calendar, Heart, Pill, Beaker, Trash, Edit, Clock } from 'lucide-react';

const OverviewTab = ({ user }) => {
  const [stats, setStats] = useState({
    appointments: [],
    visitCount: 0,
    medicationCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const API_URL = 'http://localhost:5000/api'; // Updated base URL

  useEffect(() => {
    if (user?._id) {
      fetchOverviewData();
      fetchLabRequests();
    }
  }, [user?._id]);

  // Update useEffect to set patient name when user data is available
  useEffect(() => {
    if (user) {
      setLabRequest(prev => ({
        ...prev,
        patientName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username
      }));
    }
  }, [user]);

  const fetchOverviewData = async () => {
    if (!user?._id) {
      setError('User ID not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No auth token');

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Try to fetch from API, fallback to mock data on 404
      let appointmentsData = [], visitsData = { count: 0 }, medsData = { count: 0 };
      
      try {
        const appointmentsRes = await fetch(`${API_URL}/appointments/patient/${user._id}/upcoming`, { headers });
        if (appointmentsRes.ok) {
          appointmentsData = await appointmentsRes.json();
        } else if (appointmentsRes.status === 404) {
          console.log('Appointments API not implemented yet, using mock data');
          appointmentsData = { appointments: [] };
        } else {
          throw new Error(`Appointments fetch failed: ${appointmentsRes.status}`);
        }
      } catch (err) {
        console.warn('Error fetching appointments:', err);
        appointmentsData = { appointments: [] };
      }

      try {
        const visitsRes = await fetch(`${API_URL}/patients/${user._id}/stats/visits`, { headers });
        if (visitsRes.ok) {
          visitsData = await visitsRes.json();
        } else if (visitsRes.status === 404) {
          console.log('Visits API not implemented yet, using mock data');
          visitsData = { count: Math.floor(Math.random() * 5) };
        } else {
          throw new Error(`Visits fetch failed: ${visitsRes.status}`);
        }
      } catch (err) {
        console.warn('Error fetching visits:', err);
        visitsData = { count: Math.floor(Math.random() * 5) };
      }

      try {
        const medsRes = await fetch(`${API_URL}/patients/${user._id}/stats/medications`, { headers });
        if (medsRes.ok) {
          medsData = await medsRes.json();
        } else if (medsRes.status === 404) {
          console.log('Medications API not implemented yet, using mock data');
          medsData = { count: Math.floor(Math.random() * 3) };
        } else {
          throw new Error(`Medications fetch failed: ${medsRes.status}`);
        }
      } catch (err) {
        console.warn('Error fetching medications:', err);
        medsData = { count: Math.floor(Math.random() * 3) };
      }

      setStats({
        appointments: appointmentsData?.appointments || [],
        visitCount: visitsData?.count || 0,
        medicationCount: medsData?.count || 0
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching overview data:', err);
      setError('Failed to load overview data');
      
      // Set mock data even on error
      setStats({
        appointments: [],
        visitCount: Math.floor(Math.random() * 5),
        medicationCount: Math.floor(Math.random() * 3)
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch lab requests for the patient
  const fetchLabRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No auth token found');
        return;
      }
      
      const response = await fetch(`${API_URL}/lab-requests/patient`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        try {
          const data = await response.json();
          setLabRequests(data.data || []);
        } catch (parseError) {
          console.error('Error parsing lab requests response:', parseError);
          setLabRequests([]);
        }
      } else {
        console.error('Failed to fetch lab requests:', response.status, response.statusText);
        setLabRequests([]);
      }
    } catch (error) {
      console.error('Error fetching lab requests:', error);
      setLabRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLabRequest = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !userData) {
        alert('You must be logged in to submit lab requests');
        return;
      }

      const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 
                      userData.username || 
                      labRequest.patientName;

      const response = await fetch(`${API_URL}/lab-requests/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...labRequest,
          patientName: fullName,
          patientId: userData._id || userData.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create lab request');
      }

      // Show success message
      alert('Lab request submitted successfully');
      
      // Reset form and close modal
      setLabRequest({
        testType: '',
        priority: 'normal',
        notes: '',
        patientName: fullName
      });
      setShowLabRequestModal(false);
      
      // Refresh lab requests list
      await fetchLabRequests();
      
    } catch (error) {
      console.error('Error submitting lab request:', error);
      alert('Error submitting lab request: ' + error.message);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/lab-requests/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete lab request';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            errorMessage = await response.text() || errorMessage;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }
      
      alert('Lab request deleted successfully');
      fetchLabRequests();
    } catch (error) {
      console.error('Error deleting lab request:', error);
      alert('Error deleting lab request: ' + error.message);
    }
  };

  const handleEditRequest = async (e) => {
    e.preventDefault();
    
    try {
      if (!selectedRequest || !selectedRequest._id) {
        throw new Error('No request selected for editing');
      }
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/lab-requests/${selectedRequest._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testType: labRequest.testType,
          priority: labRequest.priority,
          notes: labRequest.notes
        })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update lab request';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            errorMessage = await response.text() || errorMessage;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }
      
      alert('Lab request updated successfully');
      setIsEditModalOpen(false);
      fetchLabRequests();
    } catch (error) {
      console.error('Error updating lab request:', error);
      alert('Error updating lab request: ' + error.message);
    }
  };

  const openEditModal = (request) => {
    setSelectedRequest(request);
    setLabRequest({
      testType: request.testType,
      priority: request.priority,
      notes: request.notes
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (request) => {
    setSelectedRequest(request);
    setIsViewRequestModalOpen(true);
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getTimeLeft = (createdAt) => {
    const created = new Date(createdAt);
    const oneHour = 60 * 60 * 1000;
    const timeElapsed = Date.now() - created.getTime();
    const timeLeft = oneHour - timeElapsed;
    
    if (timeLeft <= 0) return "Expired";
    
    const minutes = Math.floor(timeLeft / (60 * 1000));
    return `${minutes} min left`;
  };

  const nextAppointment = stats.appointments.length > 0 ? stats.appointments[0] : null;

  return (
    <>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-medium">Next Appointment</p>
              {nextAppointment ? (
                <>
                  <p className="text-2xl font-bold text-blue-800">
                    {new Date(nextAppointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-blue-600">{nextAppointment.doctorName}</p>
                </>
              ) : (
                <p className="text-2xl font-bold text-blue-800">None</p>
              )}
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-medium">Total Visits</p>
              <p className="text-2xl font-bold text-green-800">{stats.visitCount}</p>
              <p className="text-sm text-green-600">This year</p>
            </div>
            <Heart className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 font-medium">Active Medications</p>
              <p className="text-2xl font-bold text-orange-800">{stats.medicationCount}</p>
              <p className="text-sm text-orange-600">Prescriptions</p>
            </div>
            <Pill className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Lab Request Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Laboratory Services</h3>
          <button
            onClick={() => setShowLabRequestModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Beaker className="h-4 w-4 mr-2" />
            Request Lab Test
          </button>
        </div>

        {/* Lab Requests List */}
        <div className="mt-4">
          <h4 className="text-md font-medium text-slate-700 mb-2">Your Lab Requests</h4>
          
          {labRequests.length === 0 ? (
            <p className="text-slate-500 text-sm">No lab requests yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Test Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Requested</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Edit Window</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {labRequests.map(request => (
                    <tr key={request._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        {request.testType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {request.canEdit ? (
                          <span className="flex items-center text-green-600">
                            <Clock className="h-4 w-4 mr-1" />
                            {getTimeLeft(request.createdAt)}
                          </span>
                        ) : (
                          <span className="text-red-500">Expired</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <button 
                          onClick={() => openViewModal(request)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                          title="View details"
                        >
                          View
                        </button>
                        
                        {request.canEdit && request.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => openEditModal(request)}
                              className="text-green-600 hover:text-green-800 mr-3"
                              title="Edit request"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteRequest(request._id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete request"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Lab Request Modal */}
      {showLabRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Request Laboratory Test</h3>
            <form onSubmit={handleLabRequest}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    value={labRequest.patientName}
                    onChange={(e) => setLabRequest(prev => ({
                      ...prev,
                      patientName: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Test Type
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={labRequest.priority}
                    onChange={(e) => setLabRequest(prev => ({...prev, priority: e.target.value}))}
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Any specific instructions or notes"
                    value={labRequest.notes}
                    onChange={(e) => setLabRequest(prev => ({...prev, notes: e.target.value}))}
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowLabRequestModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Request Modal */}
      {isViewRequestModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Lab Request Details</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Test Type</p>
                <p className="font-medium">{selectedRequest.testType}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-500">Priority</p>
                <p>{selectedRequest.priority}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-500">Status</p>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-500">Notes</p>
                <p className="text-sm">{selectedRequest.notes || 'No notes provided'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-500">Requested</p>
                <p className="text-sm">{formatDate(selectedRequest.createdAt)}</p>
              </div>
              
              {selectedRequest.statusHistory && selectedRequest.statusHistory.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-500">Status History</p>
                  <ul className="mt-2 space-y-2">
                    {selectedRequest.statusHistory.map((history, index) => (
                      <li key={index} className="text-xs">
                        <span className="font-medium">{history.status}</span> - 
                        <span className="text-slate-500"> {formatDate(history.timestamp)}</span>
                        {history.notes && <p className="text-slate-600 mt-1">{history.notes}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsViewRequestModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Request Modal */}
      {isEditModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Edit Lab Request</h3>
            <form onSubmit={handleEditRequest}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Test Type
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={labRequest.priority}
                    onChange={(e) => setLabRequest(prev => ({...prev, priority: e.target.value}))}
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Any specific instructions or notes"
                    value={labRequest.notes}
                    onChange={(e) => setLabRequest(prev => ({...prev, notes: e.target.value}))}
                  ></textarea>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
                  <p className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    You can only edit this request within 1 hour of creation.
                  </p>
                  <p className="mt-1">Time remaining: {getTimeLeft(selectedRequest.createdAt)}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {nextAppointment ? (
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-slate-600">
                Upcoming appointment with {nextAppointment.doctorName} on {new Date(nextAppointment.date).toLocaleDateString()}
              </span>
            </div>
          ) : (
            <p className="text-slate-500">No recent activity</p>
          )}
          {/* Add more activity items as needed */}
        </div>
      </div>
    </>
  );
};

export default OverviewTab;