import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Save, FileText, Trash, PlusCircle, Download, ArrowLeft, Edit, X, Check } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const LabReportCreation = ({ labRequestId: propLabRequestId, initialMode, onClose, isModal = false }) => {
  // Get the labRequestId from URL parameters or props
  const { labRequestId: urlLabRequestId } = useParams();
  const labRequestId = propLabRequestId || urlLabRequestId;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Initialize state
  const [labRequest, setLabRequest] = useState(null);
  const [report, setReport] = useState({
    specimenId: '',
    specimenType: '',
    technicianNotes: '',
    testResults: [{ component: '', result: '', referenceRange: '', units: '' }]
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(initialMode === 'create' || initialMode === 'edit');
  const [existingReport, setExistingReport] = useState(null);
  const reportFormRef = useRef(null);

  // Fetch lab request data when component mounts
  useEffect(() => {
    const fetchLabRequest = async () => {
      try {
        setLoading(true);
        
        // Check authentication
        if (!isAuthenticated) {
          throw new Error('Authentication required');
        }
        
        console.log(`Fetching lab request with ID: ${labRequestId}`);
        
        // Use the centralized API utility
        const { requests: apiRequests } = await import('../../utils/requests');
        const response = await apiRequests.labRequests.getById(labRequestId);

        if (!response.data) {
          throw new Error(`Failed to fetch lab request: ${response.status}`);
        }

        setLabRequest(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lab request:', error);
        setError(error.message || 'Failed to fetch lab request');
        setLoading(false);
      }
    };

    if (labRequestId) {
      fetchLabRequest().then(() => {
        // After fetching lab request, check if there's an existing report
        fetchExistingReport();
      });
    } else {
      setLoading(false);
      setError('No lab request ID provided');
    }
  }, [labRequestId, isAuthenticated]);
  
  // Fetch existing lab report if available
  const fetchExistingReport = async () => {
    try {
      // Search for lab reports by labRequestId using the centralized API utility
      const { requests: apiRequests } = await import('../../utils/requests');
      const response = await apiRequests.labReports.getByLabRequestId(labRequestId);
      const data = response.data;
      
      console.log('Existing reports data:', data);
      
      // If there's a report for this lab request, use it
      if (data && data.length > 0) {
        const existingReportData = data[0];
        setExistingReport(existingReportData);
        setReport({
          specimenId: existingReportData.specimenId || '',
          specimenType: existingReportData.specimenType || '',
          technicianNotes: existingReportData.technicianNotes || '',
          testResults: existingReportData.testResults || [{ component: '', result: '', referenceRange: '', units: '' }]
        });
        console.log('Found existing report, setting mode based on initialMode');
        // Set editing mode based on the initialMode prop or default behavior
        if (initialMode === 'view') {
          setIsEditing(false);
        } else if (initialMode === 'edit') {
          setIsEditing(true);
        } else if (initialMode === 'create') {
          setIsEditing(true);
        } else {
          setIsEditing(false); // Default to view mode for existing reports
        }
      } else {
        console.log('No existing report found, setting to edit mode');
        setIsEditing(true); // Start in edit mode for new reports
      }
    } catch (error) {
      console.error('Error fetching existing report:', error);
      // If we can't fetch existing report data, default to edit mode
      setIsEditing(true);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setReport(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle test result input changes
  const handleResultChange = (index, field, value) => {
    const updatedResults = [...report.testResults];
    updatedResults[index] = {
      ...updatedResults[index],
      [field]: value
    };
    
    setReport(prev => ({
      ...prev,
      testResults: updatedResults
    }));
  };

  // Add new test result row
  const addTestResult = () => {
    setReport(prev => ({
      ...prev,
      testResults: [
        ...prev.testResults,
        { component: '', result: '', referenceRange: '', units: '' }
      ]
    }));
  };

  // Remove test result row
  const removeTestResult = (index) => {
    if (report.testResults.length <= 1) {
      alert('At least one test result is required');
      return;
    }
    
    const updatedResults = report.testResults.filter((_, i) => i !== index);
    setReport(prev => ({
      ...prev,
      testResults: updatedResults
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create complete report object by combining lab request data with report data
      const completeReport = {
        labRequestId: labRequest._id,
        patientId: labRequest.patientId?._id || labRequest.patientId || labRequest.patient?._id || labRequest.patient,
        patientName: labRequest.patientName,
        testType: labRequest.testType,
        specimenId: report.specimenId,
        specimenType: report.specimenType,
        technicianNotes: report.technicianNotes,
        testResults: report.testResults
      };
      
      // Import the API utility
      const { requests: apiRequests } = await import('../../utils/requests');
      let response;
      
      // Determine if we're creating a new report or updating an existing one
      if (existingReport) {
        // Update existing report
        console.log('Updating existing lab report:', completeReport);
        response = await apiRequests.labReports.update(existingReport._id, completeReport);
      } else {
        // Create new report
        console.log('Creating new lab report:', completeReport);
        response = await apiRequests.labReports.create(completeReport);
      }

      // Log the response for debugging
      console.log('API response:', response);
      
      // With axios, if we get here, the request was successful
      const savedReport = response.data;
      
      if (existingReport) {
        // If we updated an existing report, refresh the data and switch to view mode
        setExistingReport(savedReport);
        setIsEditing(false);
        alert('Lab report updated successfully!');
        if (isModal && onClose) {
          onClose(); // Close modal and refresh parent data
        }
      } else {
        // If we created a new report, navigate back to dashboard or close modal
        alert('Lab report submitted successfully!');
        if (isModal && onClose) {
          onClose(); // Close modal and refresh parent data
        } else {
          navigate('/lab-technician');
        }
      }
    } catch (error) {
      console.error('Error with lab report:', error);
      alert(`Failed to ${existingReport ? 'update' : 'submit'} lab report: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Rest of your component (generatePDF, toggleEditMode, UI rendering, etc.)
  // ...

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
      {/* Your existing UI code */}
    </div>
  );
};

export default LabReportCreation;