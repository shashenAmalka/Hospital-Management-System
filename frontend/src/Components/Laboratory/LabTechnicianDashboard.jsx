import React, { useState, useEffect, useRef } from 'react';
import { Activity, Clock, CheckCircle, AlertCircle, Search, BarChart2, Package, Settings, FileText, Plus, LogOut, Beaker, Edit, Trash, Eye, Download } from 'lucide-react';
import { labService } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import LabReportCreation from './LabReportCreation';

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
  const [deleteLoading, setDeleteLoading] = useState(null); // Track which report is being deleted
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
  
  // Lab Report Modal State
  const [isLabReportModalOpen, setIsLabReportModalOpen] = useState(false);
  const [selectedLabRequest, setSelectedLabRequest] = useState(null);
  const [labReportMode, setLabReportMode] = useState('create'); // 'create', 'view', 'edit'
  
  const modalRef = useRef(null);

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsResultModalOpen(false);
        setIsProcessingModalOpen(false);
        setIsPatientRequestModalOpen(false);
        setIsLabReportModalOpen(false);
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
    // Log the request to see what data we're working with
    console.log('Opening lab report creation with request:', request);
    
    // Make sure we have a valid ID before navigating
    if (!request || !request._id) {
      console.error('Invalid request object or missing ID:', request);
      alert('Error: Could not process this lab request. Missing ID.');
      return;
    }
    
    // Navigate to LabReportCreation component with the request ID as a URL parameter
    navigate(`/lab-report-creation/${request._id}`);
  };

  // Lab Report Modal Actions
  const openLabReportModal = (request, mode = 'create') => {
    console.log('Opening lab report modal with request:', request, 'mode:', mode);
    setSelectedLabRequest(request);
    setLabReportMode(mode);
    setIsLabReportModalOpen(true);
  };

  const closeLabReportModal = () => {
    setIsLabReportModalOpen(false);
    setSelectedLabRequest(null);
    setLabReportMode('create');
    // Refresh data after modal closes to get updated status
    fetchPatientLabRequests();
  };

  // Handle delete lab request instead of lab report
  const handleDeleteReport = async (request) => {
    if (!window.confirm('Are you sure you want to delete this lab request and its associated reports? This action cannot be undone and will permanently remove all data related to this request.')) {
      return;
    }

    // Prevent multiple delete operations on the same request
    if (deleteLoading === request._id) {
      return;
    }

    try {
      setDeleteLoading(request._id); // Set loading state for this specific request
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      console.log('Deleting lab request with ID:', request._id);
      
      // Delete the lab request directly instead of searching for a report first
      const deleteResponse = await fetch(`${API_URL}/lab-requests/${request._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Delete lab request response status:', deleteResponse.status);
      
      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        console.error('Delete lab request failed:', errorText);
        throw new Error(`Failed to delete lab request (Status: ${deleteResponse.status})`);
      }
      
      // Success - no need to look for lab reports
      alert('Lab request and associated reports deleted successfully!');
      await fetchPatientLabRequests(); // Refresh the data - await to ensure data is fresh
      return;

      // The code below is the original approach - we'll keep it as fallback but won't execute it
      // since we're now deleting the lab request directly
      /*
      console.log('Finding lab report for request:', request._id);
      
      // First, find the lab report for this request
      const reportResponse = await fetch(`${API_URL}/lab-reports?labRequestId=${request._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Report search response status:', reportResponse.status);

      if (!reportResponse.ok) {
        const errorData = await reportResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to find lab report (Status: ${reportResponse.status})`);
      }

      const reportData = await reportResponse.json();
      console.log('Report search data:', reportData);
      
      if (!reportData.success || !reportData.data || reportData.data.length === 0) {
        throw new Error('No lab report found for this request. It may have been already deleted.');
      }

      const reportId = reportData.data[0]._id;
      console.log('Deleting report with ID:', reportId);
      */
      // The code below is commented out because we're deleting the lab request directly now
      /*
      // Delete the report
      console.log(`Sending DELETE request to ${API_URL}/lab-reports/${reportId}`);
      
      try {
        const deleteResponse = await fetch(`${API_URL}/lab-reports/${reportId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Delete response status:', deleteResponse.status);
        
        // Get response text for debugging
        const responseText = await deleteResponse.text();
        console.log('Delete response text:', responseText);
        
        // Try to parse JSON response
        let errorData = {};
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          console.log('Could not parse response as JSON, using raw text');
        }

        if (!deleteResponse.ok) {
          throw new Error(
            errorData.message || 
            `Failed to delete report (Status: ${deleteResponse.status}). ${responseText}`
          );
        }
      } catch (fetchError) {
        console.error('Network or fetch error during delete:', fetchError);
        throw new Error(`Network error during delete: ${fetchError.message}`);
      }

      const deleteResult = await deleteResponse.json();
      console.log('Delete result:', deleteResult);

      // Show success message
      alert('Lab report deleted successfully!');
      
      // Refresh the data to reflect the deletion
      await fetchPatientLabRequests();
      */
      
    } catch (error) {
      console.error('Error deleting lab report:', error);
      alert(`Failed to delete lab report: ${error.message}`);
    } finally {
      setDeleteLoading(null); // Clear loading state
    }
  };

  // Handle PDF download directly
  const handleDirectPDFDownload = async (request) => {
    try {
      // This would trigger the PDF download without opening the modal
      // We'll need to create a simplified PDF generation function
      console.log('Direct PDF download for request:', request);
      // For now, we'll open the modal in view mode and let the user download from there
      openLabReportModal(request, 'view');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
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
                            {request.status === 'pending' ? (
                              // Show Create Report button for pending requests
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  console.log('Request data for lab report:', request);
                                  if (request && request._id) {
                                    openLabReportModal(request, 'create');
                                  } else {
                                    console.error('Invalid lab request object:', request);
                                    alert('Error: Invalid lab request data');
                                  }
                                }}
                                className="px-3 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Create Report
                              </button>
                            ) : request.status === 'completed' ? (
                              // Show action icons for completed requests
                              <div className="flex items-center justify-end space-x-2">
                                {/* View Report */}
                                <button
                                  onClick={() => openLabReportModal(request, 'view')}
                                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                                  title="View Report"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                
                                {/* Edit Report */}
                                <button
                                  onClick={() => openLabReportModal(request, 'edit')}
                                  className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                                  title="Edit Report"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                
                                {/* Delete Request & Report */}
                                <button
                                  onClick={() => handleDeleteReport(request)}
                                  disabled={deleteLoading === request._id}
                                  className={`p-1 rounded ${
                                    deleteLoading === request._id 
                                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                                      : 'text-red-600 hover:text-red-800 hover:bg-red-100'
                                  }`}
                                  title={deleteLoading === request._id ? "Deleting..." : "Delete Lab Request & Report"}
                                  data-testid={`delete-request-${request._id}`}
                                >
                                  {deleteLoading === request._id ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-red-600"></div>
                                  ) : (
                                    <Trash className="h-4 w-4" />
                                  )}
                                </button>
                                
                                {/* Download PDF */}
                                <button
                                  onClick={() => handleDirectPDFDownload(request)}
                                  className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                                  title="Download PDF"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              // Show status for other statuses
                              <span className="text-xs text-slate-500 capitalize">{request.status}</span>
                            )}
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
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Process Lab Request</h3>
                <button
                  onClick={() => setIsPatientRequestModalOpen(false)}
                  className="p-1.5 hover:bg-blue-800 rounded-full transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {/* Current status badge */}
              <div className="mt-2 flex items-center">
                <span className="text-sm opacity-80">Current status:</span>
                <span className={`ml-2 px-3 py-1 text-xs font-bold rounded-full 
                  ${selectedPatientRequest.status === 'completed' 
                    ? 'bg-green-200 text-green-900' 
                    : selectedPatientRequest.status === 'in_progress' 
                      ? 'bg-blue-200 text-blue-900'
                      : selectedPatientRequest.status === 'rejected'
                        ? 'bg-red-200 text-red-900'
                        : 'bg-yellow-200 text-yellow-900'
                  }`}>
                  {selectedPatientRequest.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            
            {/* Patient Information Card */}
            <div className="p-6">
              <div className="bg-white border border-slate-200 rounded-lg p-5 mb-4 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-slate-800 text-lg">
                      {selectedPatientRequest.patientName || 
                       (selectedPatientRequest.patient && 
                        `${selectedPatientRequest.patient.firstName} ${selectedPatientRequest.patient.lastName}`.trim()) || 
                       'Unknown Patient'}
                    </h4>
                    <p className="text-sm text-slate-500">
                      ID: {selectedPatientRequest.patientId || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div className="flex items-start">
                    <div className="p-1 bg-blue-50 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <div className="ml-2">
                      <p className="text-xs text-slate-500">Test Type</p>
                      <p className="font-medium text-slate-800">{selectedPatientRequest.testType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="p-1 bg-blue-50 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-2">
                      <p className="text-xs text-slate-500">Requested</p>
                      <p className="font-medium text-slate-800">{formatDate(selectedPatientRequest.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="p-1 bg-blue-50 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-2">
                      <p className="text-xs text-slate-500">Priority</p>
                      <span className={`inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        selectedPatientRequest.priority === 'emergency' 
                          ? 'bg-red-100 text-red-800 border border-red-300' 
                          : selectedPatientRequest.priority === 'urgent'
                            ? 'bg-orange-100 text-orange-800 border border-orange-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}>
                        {selectedPatientRequest.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {selectedPatientRequest.notes && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-md border border-slate-100">
                    <p className="text-xs font-semibold text-slate-700 mb-1">Patient Notes:</p>
                    <p className="text-sm text-slate-700 italic">"{selectedPatientRequest.notes}"</p>
                  </div>
                )}
              </div>
            
            <div className="mb-6">
              <h4 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Update Status
              </h4>
              
              <form onSubmit={handleUpdateRequestStatus} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-4">
                  {/* Status Selection with Visual Indicators */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Select New Status
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { value: 'pending', label: 'Pending', icon: '⏳', color: 'yellow' },
                        { value: 'approved', label: 'Approved', icon: '✓', color: 'green' },
                        { value: 'in_progress', label: 'In Progress', icon: '⚙️', color: 'blue' },
                        { value: 'completed', label: 'Completed', icon: '✅', color: 'green' },
                        { value: 'rejected', label: 'Rejected', icon: '✗', color: 'red' }
                      ].map(status => (
                        <label 
                          key={status.value}
                          className={`flex items-center cursor-pointer px-3 py-2 rounded-md transition-all ${
                            requestStatusUpdate.status === status.value
                              ? (status.color === 'green' 
                                ? 'bg-green-100 border border-green-300 text-green-800' 
                                : status.color === 'red'
                                  ? 'bg-red-100 border border-red-300 text-red-800'
                                  : status.color === 'blue'
                                    ? 'bg-blue-100 border border-blue-300 text-blue-800'
                                    : 'bg-yellow-100 border border-yellow-300 text-yellow-800')
                              : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="radio"
                            name="status"
                            value={status.value}
                            checked={requestStatusUpdate.status === status.value}
                            onChange={() => setRequestStatusUpdate(prev => ({...prev, status: status.value}))}
                            className="sr-only"
                          />
                          <span className="mr-1">{status.icon}</span>
                          <span className="text-sm font-medium">{status.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Notes Section with Character Count */}
                  <div className="mt-2">
                    <label className="text-sm font-medium text-slate-700 mb-1 flex items-center justify-between">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Notes
                      </div>
                      <span className="text-xs text-slate-500">
                        {requestStatusUpdate.notes.length}/500 characters
                      </span>
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      rows="3"
                      placeholder="Add detailed notes about this status update, treatment plans, or follow-up instructions..."
                      value={requestStatusUpdate.notes}
                      onChange={(e) => setRequestStatusUpdate(prev => ({...prev, notes: e.target.value.slice(0, 500)}))}
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Status
                  </button>
                </div>
              </form>
            </div>
            
            <div className="mt-6 mb-6">
              <h4 className="text-base font-semibold text-slate-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                Status History & Notes
              </h4>

              {selectedPatientRequest.statusHistory?.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-slate-500">No status history available yet</p>
                </div>
              ) : (
                <div className="relative pl-8 pt-2 pb-1">
                  {/* Timeline Line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200"></div>

                  {selectedPatientRequest.statusHistory?.map((history, index) => {
                    // Determine icon and color based on status
                    let icon = '⏳';
                    let bgColor = 'bg-yellow-500';
                    
                    if (history.status === 'completed') {
                      icon = '✅';
                      bgColor = 'bg-green-500';
                    } else if (history.status === 'in_progress') {
                      icon = '⚙️';
                      bgColor = 'bg-blue-500';
                    } else if (history.status === 'rejected') {
                      icon = '❌';
                      bgColor = 'bg-red-500';
                    } else if (history.status === 'approved') {
                      icon = '✓';
                      bgColor = 'bg-green-500';
                    }
                    
                    return (
                      <div key={history._id} className="mb-6 relative">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-8 mt-1.5 rounded-full w-7 h-7 ${bgColor} flex items-center justify-center text-white shadow-md z-10`}>
                          <span className="text-xs">{icon}</span>
                        </div>

                        {/* Timeline Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 ml-2 transition-all hover:shadow-md group">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(history.status)}`}>
                                {history.status.replace('_', ' ').toUpperCase()}
                              </span>
                              <span className="ml-2 text-xs text-slate-500">
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
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleNoteDelete(history._id)}
                                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-200"
                                  title="Delete note"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {/* Note Content with Quote Style */}
                          {history.notes && (
                            <div className="mt-2 pl-3 border-l-2 border-slate-200">
                              <p className="text-sm text-slate-700">{history.notes}</p>
                            </div>
                          )}
                          
                          {/* Staff Member who made the change */}
                          <div className="mt-3 flex items-center justify-end">
                            <div className="bg-slate-100 px-2 py-1 rounded-full flex items-center text-xs text-slate-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>{history.changedBy ? 'Staff' : 'System'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Footer Area - Close Button */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 rounded-b-lg flex justify-center">
            <button
              onClick={() => setIsPatientRequestModalOpen(false)}
              className="flex items-center px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Lab Report Modal */}
    {isLabReportModalOpen && selectedLabRequest && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
            <h2 className="text-xl font-semibold text-gray-800">
              {labReportMode === 'create' ? 'Create Lab Report' : 
               labReportMode === 'view' ? 'View Lab Report' : 'Edit Lab Report'}
            </h2>
            <button
              onClick={closeLabReportModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            <LabReportCreation 
              labRequestId={selectedLabRequest._id}
              initialMode={labReportMode}
              onClose={closeLabReportModal}
              isModal={true}
            />
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default LabTechnicianDashboard;

