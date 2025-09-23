import React, { useState, useEffect, useRef } from 'react';
import { Activity, Clock, CheckCircle, AlertCircle, Search, BarChart2, Package, Settings, FileText, Plus, LogOut, Beaker, Edit, Trash } from 'lucide-react';
import { labService } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const LabTechnicianDashboard = ({ initialTab = 'pending' }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingTests: 0,
    completedToday: 0,
    criticalResults: 0,
    totalSamples: 0,
    lowInventoryItems: 0
  });
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [pendingTests, setPendingTests] = useState([]);
  const [inProgressTests, setInProgressTests] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [labInventory, setLabInventory] = useState([]);
  const [equipmentStatus, setEquipmentStatus] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [resultData, setResultData] = useState({
    result: '',
    notes: '',
    isCritical: false
  });
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [patientRequests, setPatientRequests] = useState([]);
  const [selectedPatientRequest, setSelectedPatientRequest] = useState(null);
  const [isPatientRequestModalOpen, setIsPatientRequestModalOpen] = useState(false);
  const [requestStatusUpdate, setRequestStatusUpdate] = useState({
    status: '',
    notes: ''
  });
  const modalRef = useRef(null);

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsResultModalOpen(false);
        setIsProcessingModalOpen(false);
        setIsPatientRequestModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update activeTab when initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Update fetchPatientLabRequests with better error handling and logging
  const fetchPatientLabRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      console.log('Fetching lab requests from:', `${API_URL}/lab-requests/all`);
      const response = await fetch(`${API_URL}/lab-requests/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch requests: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received lab requests:', data);
      
      // Process the requests to ensure patient names are displayed correctly
      const processedRequests = (data.data || []).map(request => ({
        ...request,
        displayName: request.patientName || 
                    (request.patient && `${request.patient.firstName} ${request.patient.lastName}`.trim()) ||
                    request.patient?.username ||
                    'No Name Provided'
      }));
      
      setPatientRequests(processedRequests);
      setPendingTests(processedRequests.filter(req => req.status === 'pending'));
      setInProgressTests(processedRequests.filter(req => req.status === 'in_progress'));
      setCompletedTests(processedRequests.filter(req => req.status === 'completed'));
      
      // Update stats with processed data
      setStats(prev => ({
        ...prev,
        pendingTests: processedRequests.filter(req => req.status === 'pending').length,
        completedToday: processedRequests.filter(req => 
          req.status === 'completed' && 
          new Date(req.completedAt).toDateString() === new Date().toDateString()
        ).length
      }));
      
    } catch (error) {
      console.error('Error fetching patient lab requests:', error);
      setError('Failed to load lab requests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update fetchDashboardData to focus on lab requests
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await fetchPatientLabRequests();
    } catch (err) {
      console.error('Error fetching lab data:', err);
      setError('Failed to load laboratory data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (testId) => {
    try {
      await labService.updateTestStatus(testId, 'in_progress');
      // Move test from pending to in-progress
      const testToMove = pendingTests.find(test => test.id === testId);
      if (testToMove) {
        setPendingTests(pendingTests.filter(test => test.id !== testId));
        setInProgressTests([...inProgressTests, {...testToMove, startedAt: new Date().toISOString()}]);
      }
    } catch (error) {
      console.error('Error starting test:', error);
    }
  };

  const handleCompleteTest = (test) => {
    setSelectedTest(test);
    setResultData({
      result: '',
      notes: '',
      isCritical: false
    });
    setIsResultModalOpen(true);
  };

  const handleSubmitResults = async () => {
    try {
      if (!selectedTest) return;
      
      const completeData = {
        testId: selectedTest.id,
        result: resultData.result,
        notes: resultData.notes,
        isCritical: resultData.isCritical
      };
      
      await labService.completeTest(completeData);
      
      // Remove test from in-progress list
      setInProgressTests(inProgressTests.filter(test => test.id !== selectedTest.id));
      
      // Refresh completed tests data
      const completedResponse = await labService.getCompletedTests();
      if (completedResponse.data && completedResponse.data.tests) {
        setCompletedTests(completedResponse.data.tests);
      }
      
      // Refresh stats
      const statsResponse = await labService.getLabStats();
      if (statsResponse.data) {
        setStats(statsResponse.data);
      }
      
      setIsResultModalOpen(false);
    } catch (error) {
      console.error('Error completing test:', error);
      alert('Failed to complete test. Please try again.');
    }
  };

  const handleProcessSample = (test) => {
    setSelectedTest(test);
    setIsProcessingModalOpen(true);
  };

  const confirmSampleCollection = async () => {
    try {
      if (!selectedTest) return;
      
      await labService.updateSampleStatus(selectedTest.id, true);
      
      // Update the test in the pending list
      setPendingTests(pendingTests.map(test => 
        test.id === selectedTest.id ? {...test, sampleCollected: true} : test
      ));
      
      setIsProcessingModalOpen(false);
    } catch (error) {
      console.error('Error updating sample status:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Dispatch custom logout event for other components
    window.dispatchEvent(new Event('logout'));
    
    navigate('/login');
  };

  // Enhance the handleUpdateRequestStatus function
  const handleUpdateRequestStatus = async (e) => {
    e.preventDefault();
    
    try {
      if (!selectedPatientRequest || !selectedPatientRequest._id) {
        throw new Error('No request selected');
      }
      
      if (!requestStatusUpdate.status) {
        throw new Error('Please select a status');
      }
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/lab-requests/${selectedPatientRequest._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestStatusUpdate)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update request status');
      }
      
      // Show success message
      alert('Request status updated successfully');
      setIsPatientRequestModalOpen(false);
      
      // Refresh data
      await fetchPatientLabRequests();
      
      // Clear the selected request and status update
      setSelectedPatientRequest(null);
      setRequestStatusUpdate({ status: '', notes: '' });
      
    } catch (error) {
      console.error('Error updating request status:', error);
      alert('Error updating status: ' + error.message);
    }
  };

  // Add new function to handle note updates
  const handleNoteUpdate = async (noteId, updatedNote) => {
    if (!updatedNote || !selectedPatientRequest?._id) return;
    if (updatedNote.trim() === '') return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/lab-requests/${selectedPatientRequest._id}/notes/${noteId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes: updatedNote })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update note');
      }

      const updatedData = await response.json();
      
      // Update only the specific note in the local state
      setPatientRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === selectedPatientRequest._id ? updatedData.data : req
        )
      );
      setSelectedPatientRequest(updatedData.data);
      
      alert('Note updated successfully');
    } catch (error) {
      console.error('Error updating note:', error);
      alert(error.message || 'Error updating note');
    }
  };

  // Add new function to handle note deletion
  const handleNoteDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    if (!selectedPatientRequest?._id) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/lab-requests/${selectedPatientRequest._id}/notes/${noteId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete note');
      }

      const updatedData = await response.json();
      
      // Update local state
      setPatientRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === selectedPatientRequest._id ? updatedData.data : req
        )
      );
      setSelectedPatientRequest(updatedData.data);
      
      alert('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      alert(error.message || 'Error deleting note');
    }
  };

  const openPatientRequestModal = (request) => {
    setSelectedPatientRequest(request);
    setRequestStatusUpdate({
      status: request.status,
      notes: ''
    });
    setIsPatientRequestModalOpen(true);
  };

  const getPriorityBadgeColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'abnormal': return 'bg-red-100 text-red-800';
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      // Add statuses for lab requests
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-green-100 text-green-800'; // normal
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getFilteredData = () => {
    if (!searchTerm) {
      switch (activeTab) {
        case 'pending': return pendingTests;
        case 'in-progress': return inProgressTests;
        case 'completed': return completedTests;
        case 'inventory': return labInventory;
        case 'equipment': return equipmentStatus;
        case 'lab-requests': return patientRequests;
        default: return pendingTests;
      }
    }
    
    const term = searchTerm.toLowerCase();
    
    switch (activeTab) {
      case 'pending':
        return pendingTests.filter(test => 
          test.patientName.toLowerCase().includes(term) || 
          test.testType.toLowerCase().includes(term) ||
          test.requestedBy.toLowerCase().includes(term) ||
          test.patientId.toLowerCase().includes(term)
        );
      case 'in-progress':
        return inProgressTests.filter(test => 
          test.patientName.toLowerCase().includes(term) || 
          test.testType.toLowerCase().includes(term) ||
          test.requestedBy.toLowerCase().includes(term) ||
          test.patientId.toLowerCase().includes(term)
        );
      case 'completed':
        return completedTests.filter(test => 
          test.patientName.toLowerCase().includes(term) || 
          test.testType.toLowerCase().includes(term) ||
          test.result.toLowerCase().includes(term) ||
          test.patientId.toLowerCase().includes(term)
        );
      case 'inventory':
        return labInventory.filter(item => 
          item.name.toLowerCase().includes(term) ||
          item.status.toLowerCase().includes(term)
        );
      case 'equipment':
        return equipmentStatus.filter(equip => 
          equip.name.toLowerCase().includes(term) ||
          equip.status.toLowerCase().includes(term)
        );
      case 'lab-requests':
        return patientRequests.filter(request => 
          request.patientName.toLowerCase().includes(term) ||
          request.testType.toLowerCase().includes(term) ||
          request.status.toLowerCase().includes(term)
        );
      default:
        return pendingTests;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading laboratory dashboard...</p>
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Laboratory Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Pending Tests</p>
                <p className="text-2xl font-bold text-slate-800">{stats.pendingTests}</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Completed Today</p>
                <p className="text-2xl font-bold text-slate-800">{stats.completedToday}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Critical Results</p>
                <p className="text-2xl font-bold text-slate-800">{stats.criticalResults}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Total Samples</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalSamples}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Low Inventory</p>
                <p className="text-2xl font-bold text-slate-800">{stats.lowInventoryItems}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Search & Tabs Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-800">Laboratory Management</h3>
              
              <div className="relative w-full md:w-auto md:min-w-[300px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search tests, patients, inventory..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Pending Tests Tab */}
            {activeTab === 'pending' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Test Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Requested By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sample</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {getFilteredData().map(test => (
                      <tr key={test.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                          {test.patientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {test.patientId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {test.testType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {test.requestedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(test.deadline).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(test.priority)}`}>
                            {test.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {test.sampleCollected ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Received
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleProcessSample(test)}
                              className="px-2 py-1 text-xs border border-slate-300 rounded-md hover:bg-slate-100"
                            >
                              Process
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          <button 
                            onClick={() => handleStartTest(test.id)}
                            disabled={!test.sampleCollected}
                            className={`px-3 py-1 text-xs font-medium rounded-md ${
                              test.sampleCollected 
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            Start Test
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getFilteredData().length === 0 && (
                  <div className="text-center py-4 text-slate-500">
                    No pending tests found
                  </div>
                )}
              </div>
            )}
            
            {/* In Progress Tests Tab */}
            {activeTab === 'in-progress' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Test Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Requested By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Started</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {getFilteredData().map(test => (
                      <tr key={test.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                          {test.patientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {test.patientId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {test.testType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {test.requestedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(test.startedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(test.deadline).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(test.priority)}`}>
                            {test.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          <button 
                            onClick={() => handleCompleteTest(test)}
                            className="px-3 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800 hover:bg-green-200"
                          >
                            Complete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getFilteredData().length === 0 && (
                  <div className="text-center py-4 text-slate-500">
                    No tests in progress
                  </div>
                )}
              </div>
            )}
            
            {/* Completed Tests Tab */}
            {activeTab === 'completed' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Test Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Result</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Completed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Verified By</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {getFilteredData().map(test => (
                      <tr key={test.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                          {test.patientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {test.patientId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {test.testType}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate">
                          {test.result}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(test.completedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(test.status)}`}>
                            {test.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {test.verifiedBy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getFilteredData().length === 0 && (
                  <div className="text-center py-4 text-slate-500">
                    No completed tests found
                  </div>
                )}
              </div>
            )}
            
            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <div className="overflow-x-auto">
                <div className="flex justify-end mb-4">
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Inventory Item
                  </button>
                </div>
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Current Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Minimum Required</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {getFilteredData().map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {item.currentStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {item.minRequired}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          <button className="px-3 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 mr-2">
                            Update Stock
                          </button>
                          <button className="px-3 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-800 hover:bg-slate-200">
                            View History
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getFilteredData().length === 0 && (
                  <div className="text-center py-4 text-slate-500">
                    No inventory items found
                  </div>
                )}
              </div>
            )}
            
            {/* Equipment Tab */}
            {activeTab === 'equipment' && (
              <div className="overflow-x-auto">
                <div className="flex justify-end mb-4">
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Equipment
                  </button>
                </div>
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Equipment Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Calibration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Next Calibration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {getFilteredData().map(equip => (
                      <tr key={equip.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                          {equip.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(equip.status)}`}>
                            {equip.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(equip.lastCalibration).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(equip.nextCalibration).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          <button className="px-3 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 mr-2">
                            Update Status
                          </button>
                          <button className="px-3 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800 hover:bg-green-200">
                            Log Calibration
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getFilteredData().length === 0 && (
                  <div className="text-center py-4 text-slate-500">
                    No equipment found
                  </div>
                )}
              </div>
            )}
            
            {/* Patient Lab Requests Tab */}
            {activeTab === 'lab-requests' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Test Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Requested At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {patientRequests
                      .filter(request => {
                        if (!searchTerm) return true;
                        const term = searchTerm.toLowerCase();
                        return (
                          request.patientName.toLowerCase().includes(term) ||
                          request.testType.toLowerCase().includes(term) ||
                          request.status.toLowerCase().includes(term)
                        );
                      })
                      .map(request => (
                        <tr key={request._id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                            {request.displayName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {request.testType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              request.priority === 'emergency' 
                                ? 'bg-red-100 text-red-800' 
                                : request.priority === 'urgent'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}>
                              {request.priority}
                            </span>
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
                            <button 
                              onClick={() => openPatientRequestModal(request)}
                              className="px-3 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200"
                            >
                              View & Process
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {patientRequests.length === 0 && (
                  <div className="text-center py-4 text-slate-500">
                    No patient lab requests found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Sample Processing Modal */}
      {isProcessingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Process Sample</h3>
            <p className="text-slate-600 mb-4">
              Confirm receipt of sample for test:
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="font-medium text-slate-800">{selectedTest?.patientName}</p>
              <p className="text-sm text-slate-600">Patient ID: {selectedTest?.patientId}</p>
              <p className="text-sm text-slate-600">Test: {selectedTest?.testType}</p>
              <p className="text-sm text-slate-600">Requested by: {selectedTest?.requestedBy}</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsProcessingModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmSampleCollection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm Receipt
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Test Results Modal */}
      {isResultModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Enter Test Results</h3>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="font-medium text-slate-800">{selectedTest?.patientName}</p>
              <p className="text-sm text-slate-600">Test: {selectedTest?.testType}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Test Results</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Enter detailed test results"
                  value={resultData.result}
                  onChange={(e) => setResultData({...resultData, result: e.target.value})}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                  placeholder="Any additional notes"
                  value={resultData.notes}
                  onChange={(e) => setResultData({...resultData, notes: e.target.value})}
                ></textarea>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="critical"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={resultData.isCritical}
                  onChange={(e) => setResultData({...resultData, isCritical: e.target.checked})}
                />
                <label htmlFor="critical" className="ml-2 block text-sm text-slate-700">
                  Flag as critical result
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsResultModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitResults}
                disabled={!resultData.result.trim()}
                className={`px-4 py-2 rounded-lg ${
                  resultData.result.trim() 
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                Submit Results
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Patient Request Modal */}
      {isPatientRequestModalOpen && selectedPatientRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Process Lab Request</h3>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="font-medium text-slate-800">
                {selectedPatientRequest.patientName || 
                 (selectedPatientRequest.patient && 
                  `${selectedPatientRequest.patient.firstName} ${selectedPatientRequest.patient.lastName}`.trim()) || 
                 'Unknown Patient'}
              </p>
              <p className="text-sm text-slate-600">Test: {selectedPatientRequest.testType}</p>
              <p className="text-sm text-slate-600">Priority: 
                <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  selectedPatientRequest.priority === 'emergency' 
                    ? 'bg-red-100 text-red-800' 
                    : selectedPatientRequest.priority === 'urgent'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedPatientRequest.priority}
                </span>
              </p>
              <p className="text-sm text-slate-600">Requested: {formatDate(selectedPatientRequest.createdAt)}</p>
              {selectedPatientRequest.notes && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-slate-700">Patient Notes:</p>
                  <p className="text-xs text-slate-600 mt-1">{selectedPatientRequest.notes}</p>
                </div>
              )}
            </div>
            
            <form onSubmit={handleUpdateRequestStatus}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Update Status
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={requestStatusUpdate.status}
                    onChange={(e) => setRequestStatusUpdate(prev => ({...prev, status: e.target.value}))}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Add notes about this status update"
                    value={requestStatusUpdate.notes}
                    onChange={(e) => setRequestStatusUpdate(prev => ({...prev, notes: e.target.value}))}
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsPatientRequestModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Status
                </button>
              </div>
            </form>
            
            <div className="mt-4 mb-6">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Status History & Notes</h4>
              {selectedPatientRequest.statusHistory?.map((history) => (
                <div key={history._id} className="bg-slate-50 rounded-lg p-4 mb-3 relative group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(history.status)}`}>
                        {history.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDate(history.timestamp)}
                      </span>
                    </div>
                    {history.notes && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => {
                            const newNote = prompt('Update note:', history.notes);
                            if (newNote && newNote !== history.notes) {
                              handleNoteUpdate(history._id, newNote);
                            }
                          }}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors duration-200"
                          title="Edit note"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleNoteDelete(history._id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-200"
                          title="Delete note"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {history.notes && (
                    <div className="pl-2 border-l-2 border-slate-200">
                      <p className="text-sm text-slate-600">{history.notes}</p>
                    </div>
                  )}
                </div>
              ))}
              {selectedPatientRequest.statusHistory?.length === 0 && (
                <div className="text-center py-4 text-slate-500">
                  No status history available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTechnicianDashboard;

