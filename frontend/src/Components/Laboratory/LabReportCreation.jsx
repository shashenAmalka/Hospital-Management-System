import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Save, FileText, Trash, PlusCircle, Download, ArrowLeft, Edit, X, Check } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  validateValue,
  validateForm,
  getInputProps,
  getValidationIcon,
  getCharacterCount,
  handleNumericInput,
  handleTextInput,
  handleKeyPress
} from '../../utils/inputValidation';

const API_URL = 'http://localhost:5000/api';

const LabReportCreation = ({ labRequestId: propLabRequestId, initialMode, onClose, isModal = false }) => {
  // Get the labRequestId from URL parameters or props
  const { labRequestId: urlLabRequestId } = useParams();
  const labRequestId = propLabRequestId || urlLabRequestId;
  const navigate = useNavigate();
  
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
  const [validationStates, setValidationStates] = useState({}); // New: track validation status for each field
  const [formValidation, setFormValidation] = useState({ isValid: false, hasErrors: false, hasWarnings: false }); // Restore the form validation state
  const reportFormRef = useRef(null);

  // Component configurations for validation
  // Form validation state (computed properties)
  const computedValidation = useMemo(() => {
    const validationEntries = Object.values(validationStates);
    return {
      hasErrors: validationEntries.some(v => v.status === 'error'),
      hasWarnings: validationEntries.some(v => v.status === 'warning'),
      totalFields: validationEntries.length,
      normalFields: validationEntries.filter(v => v.status === 'normal').length,
      warningFields: validationEntries.filter(v => v.status === 'warning').length,
      errorFields: validationEntries.filter(v => v.status === 'error').length
    };
  }, [validationStates]);
  
  // Update state-based formValidation when computed values change
  useEffect(() => {
    setFormValidation(prev => ({
      ...prev,
      hasErrors: computedValidation.hasErrors,
      hasWarnings: computedValidation.hasWarnings
    }));
  }, [computedValidation.hasErrors, computedValidation.hasWarnings]);

  // Memoize componentConfigs to prevent recreation on every render
  const componentConfigs = useMemo(() => ({
    'Hemoglobin': {
      name: 'Hemoglobin',
      unit: 'g/dL',
      referenceRange: '12.0-17.5',
      minValue: 3.0,
      maxValue: 25.0,
      decimalPlaces: 1,
      required: true,
      type: 'number'
    },
    'White Blood Cells': {
      name: 'White Blood Cells',
      unit: 'x10^9/L',
      referenceRange: '4.0-11.0',
      minValue: 0.5,
      maxValue: 100.0,
      decimalPlaces: 1,
      required: true,
      type: 'number'
    },
    'WBC Count': {
      name: 'WBC Count',
      unit: 'cells/mcL',
      referenceRange: '4,000-11,000',
      minValue: 500,
      maxValue: 100000,
      decimalPlaces: 0,
      required: true,
      type: 'number'
    },
    'Platelets': {
      name: 'Platelets',
      unit: 'x10^9/L',
      referenceRange: '150-450',
      minValue: 10,
      maxValue: 2000,
      decimalPlaces: 0,
      required: true,
      type: 'number'
    },
    'Glucose': {
      name: 'Glucose',
      unit: 'mg/dL',
      referenceRange: '70-100',
      minValue: 20,
      maxValue: 800,
      decimalPlaces: 1,
      required: true,
      type: 'number'
    },
    'pH': {
      name: 'pH',
      unit: '',
      referenceRange: '4.5-8.0',
      minValue: 4.0,
      maxValue: 9.0,
      decimalPlaces: 1,
      required: true,
      type: 'number'
    },
    'Protein': {
      name: 'Protein',
      unit: 'mg/dL',
      referenceRange: 'Negative',
      type: 'select',
      options: ['Negative', 'Trace', '+1', '+2', '+3', '+4'],
      required: true
    },
    'Chest X-Ray': {
      name: 'Chest X-Ray',
      unit: '',
      referenceRange: 'Normal',
      type: 'select',
      options: ['Normal', 'Abnormal', 'Pending Review'],
      required: true
    },
    'Brain MRI': {
      name: 'Brain MRI',
      unit: '',
      referenceRange: 'Normal',
      type: 'select',
      options: ['Normal', 'Abnormal', 'Pending Review'],
      required: true
    },
    'CT Scan': {
      name: 'CT Scan',
      unit: '',
      referenceRange: 'Normal',
      type: 'select',
      options: ['Normal', 'Abnormal', 'Pending Review'],
      required: true
    }
  }), []); // Empty dependency array since config is static

  // Fetch lab request data when component mounts
  useEffect(() => {
    const fetchLabRequest = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        console.log(`Fetching lab request with ID: ${labRequestId}`);
        
        const response = await fetch(`${API_URL}/lab-requests/${labRequestId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(`Failed to fetch lab request: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Lab request data received:', data);
        
        if (!data.success || !data.data) {
          throw new Error('Invalid data structure received from API');
        }
        
        setLabRequest(data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lab request:', error);
        setError(`Failed to load lab request: ${error.message}`);
        setLoading(false);
      }
    };

    if (labRequestId) {
      fetchLabRequest().then(() => {
        // After fetching lab request, check if there's an existing report
        fetchExistingReport();
      });
    } else {
      setError('No lab request ID provided');
      setLoading(false);
    }
  }, [labRequestId]);
  
  // Fetch existing lab report if available (wrapped in useCallback to prevent recreation)
  const fetchExistingReport = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Search for lab reports by labRequestId
      const response = await fetch(`${API_URL}/lab-reports?labRequestId=${labRequestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to check for existing reports: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Existing reports data:', data);
      
      // If there's a report for this lab request, use it
      if (data.success && data.data && data.data.length > 0) {
        const existingReportData = data.data[0];
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
  }, [labRequestId, initialMode]); // Add dependencies for useCallback

  useEffect(() => {
    // Add default test components based on test type if available
    if (labRequest && labRequest.testType) {
      let defaultComponents = [];
      
      switch(labRequest.testType.toLowerCase()) {
        case 'blood':
          defaultComponents = [
            { component: 'Hemoglobin', result: '', referenceRange: '13.5-17.5', units: 'g/dL' },
            { component: 'White Blood Cells', result: '', referenceRange: '4.5-11.0', units: 'x10^9/L' },
            { component: 'Platelets', result: '', referenceRange: '150-450', units: 'x10^9/L' }
          ];
          break;
        case 'urine':
          defaultComponents = [
            { component: 'pH', result: '', referenceRange: '4.5-8.0', units: '' },
            { component: 'Protein', result: '', referenceRange: 'Negative', units: 'mg/dL' }
          ];
          break;
        case 'xray':
          defaultComponents = [
            { component: 'Chest X-Ray', result: '', referenceRange: 'Normal', units: '' }
          ];
          break;
        case 'mri':
          defaultComponents = [
            { component: 'Brain MRI', result: '', referenceRange: 'Normal', units: '' }
          ];
          break;
        case 'ct':
          defaultComponents = [
            { component: 'CT Scan', result: '', referenceRange: 'Normal', units: '' }
          ];
          break;
        default:
          defaultComponents = [{ component: '', result: '', referenceRange: '', units: '' }];
      }
      
      setReport(prev => ({ ...prev, testResults: defaultComponents }));
    }
  }, [labRequest]);

  // Handle form field changes (wrapped in useCallback to prevent recreation)
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setReport(prevReport => ({
      ...prevReport,
      [name]: value
    }));
  }, []);

  // Handle test result changes with validation (wrapped in useCallback)
  const handleTestResultChange = useCallback((index, field, value) => {
    setReport(prevReport => {
      const updatedResults = [...prevReport.testResults];
      updatedResults[index][field] = value;
      
      // Apply validation for result field
      if (field === 'result') {
        const componentName = updatedResults[index].component;
        const component = componentConfigs[componentName];
        
        if (component) {
          const validation = validateValue(value, component);
          const validationKey = `result_${index}`;
          
          setValidationStates(prev => ({
            ...prev,
            [validationKey]: validation
          }));
        }
      }
      
      return {
        ...prevReport,
        testResults: updatedResults
      };
    });
  }, [componentConfigs]); // Add componentConfigs as dependency

  // Add new row to test results (wrapped in useCallback)
  const addTestResultRow = useCallback(() => {
    setReport(prevReport => ({
      ...prevReport,
      testResults: [
        ...prevReport.testResults, 
        { component: '', result: '', referenceRange: '', units: '' }
      ]
    }));
  }, []);

  // Remove a row from test results (wrapped in useCallback)
  const removeTestResultRow = useCallback((index) => {
    setReport(prevReport => {
      const updatedResults = [...prevReport.testResults];
      updatedResults.splice(index, 1);
      return {
        ...prevReport,
        testResults: updatedResults
      };
    });
  }, []);

  // Real-time form validation
  useEffect(() => {
    let hasErrors = false;
    let hasWarnings = false;

    // Validate each test result
    report.testResults.forEach((result, index) => {
      if (result.component && result.result) {
        const component = componentConfigs[result.component];
        if (component) {
          const validation = validateValue(result.result, component);
          if (!validation.isValid) {
            hasErrors = true;
          } else if (validation.status === 'warning') {
            hasWarnings = true;
          }
        }
      }
    });

    // Update the state-based formValidation
    setFormValidation(prev => ({ 
      ...prev,
      isValid: !hasErrors && report.testResults.every(r => r.component && r.result),
      hasErrors, 
      hasWarnings 
    }));
  }, [report, componentConfigs]);

  // Enhanced input renderer with validation
  const renderEnhancedInput = (value, onChange, component, index, field) => {
    if (!component) {
      // Fallback for unknown components
      return (
        <input
          type="text"
          value={value}
          onChange={onChange}
          disabled={!isEditing}
          className={`w-full px-2 py-1 border border-gray-300 rounded ${isEditing ? 'focus:ring-1 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-100 cursor-not-allowed'}`}
          placeholder="Enter value..."
        />
      );
    }

    const validationKey = `${field}_${index}`;
    const validation = validationStates[validationKey] || validateValue(value, component);
    const validationIcon = getValidationIcon(validation.status);

    if (component.type === 'select') {
      return (
        <div className="relative">
          <select
            value={value}
            onChange={onChange}
            disabled={!isEditing}
            className={`w-full px-2 py-1 border rounded ${
              validation.status === 'error' ? 'border-red-500 bg-red-50' :
              validation.status === 'warning' ? 'border-yellow-500 bg-yellow-50' :
              validation.status === 'normal' ? 'border-green-500 bg-green-50' :
              'border-gray-300'
            } ${isEditing ? 'focus:ring-1 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'}`}
          >
            <option value="">Select...</option>
            {component.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {validation.status && isEditing && (
            <span className={`absolute right-8 top-1 text-sm ${validationIcon.color}`}>
              {validationIcon.icon}
            </span>
          )}
        </div>
      );
    }

    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          onInput={(e) => {
            if (component.type === 'number') {
              handleNumericInput(e, component);
            } else {
              handleTextInput(e, component);
            }
          }}
          onKeyDown={(e) => handleKeyPress(e, component)}
          disabled={!isEditing}
          inputMode={component.type === 'number' ? (component.decimalPlaces > 0 ? 'decimal' : 'numeric') : 'text'}
          className={`w-full px-2 py-1 border rounded ${
            validation.status === 'error' ? 'border-red-500 bg-red-50' :
            validation.status === 'warning' ? 'border-yellow-500 bg-yellow-50' :
            validation.status === 'normal' ? 'border-green-500 bg-green-50' :
            'border-gray-300'
          } ${isEditing ? 'focus:ring-1 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'}`}
          placeholder={`Enter ${component.name.toLowerCase()}...`}
        />
        {component.unit && (
          <span className="absolute right-8 top-1 text-xs text-gray-500 pointer-events-none">
            {component.unit}
          </span>
        )}
        {validation.status && isEditing && (
          <span className={`absolute right-2 top-1 text-sm ${validationIcon.color}`}>
            {validationIcon.icon}
          </span>
        )}
      </div>
    );
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
      
      const token = localStorage.getItem('token');
      let response;
      
      // Determine if we're creating a new report or updating an existing one
      if (existingReport) {
        // Update existing report
        console.log('Updating existing lab report:', completeReport);
        response = await fetch(`${API_URL}/lab-reports/${existingReport._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(completeReport)
        });
      } else {
        // Create new report
        console.log('Creating new lab report:', completeReport);
        response = await fetch(`${API_URL}/lab-reports`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(completeReport)
        });
      }

      // Log the raw response for debugging
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        let errorMessage = existingReport 
          ? 'Failed to update report' 
          : 'Failed to submit report';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use the raw text
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      console.log('Success response:', responseData);
      
      if (existingReport) {
        // If we updated an existing report, refresh the data and switch to view mode
        setExistingReport(responseData.data);
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
      alert(`Failed to ${existingReport ? 'update' : 'submit'} lab report: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF report
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add hospital logo or header (optional)
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 153);
    doc.text('Hospital Management System', 105, 15, { align: 'center' });
    
    // Set up PDF
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Laboratory Report', 105, 25, { align: 'center' });
    
    // Patient Information
    doc.setFontSize(12);
    doc.setTextColor(0, 102, 204);
    doc.text('Patient Information', 20, 35);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Patient Name: ${labRequest.patientName || 'N/A'}`, 20, 45);
    doc.text(`Patient ID: ${labRequest.patient?._id || labRequest.patient || 'N/A'}`, 20, 50);
    doc.text(`Test Type: ${labRequest.testType || 'N/A'}`, 20, 55);
    doc.text(`Request Date: ${new Date(labRequest.createdAt).toLocaleDateString()}`, 20, 60);
    
    // Specimen Information
    doc.setFontSize(12);
    doc.setTextColor(0, 102, 204);
    doc.text('Specimen Information', 20, 70);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Specimen ID: ${report.specimenId}`, 20, 80);
    doc.text(`Specimen Type: ${report.specimenType}`, 20, 85);
    
    // Test Results
    doc.setFontSize(12);
    doc.setTextColor(0, 102, 204);
    doc.text('Test Results', 20, 95);
    
    // Create table for test results using autoTable
    const tableColumn = ["Component", "Result", "Reference Range", "Units"];
    const tableRows = [];

    report.testResults.forEach((result) => {
      const resultData = [
        result.component,
        result.result,
        result.referenceRange,
        result.units
      ];
      tableRows.push(resultData);
    });

    // Use autoTable function directly
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 100,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] }
    });
    
    // Get the final Y position after the table
    let finalY = doc.lastAutoTable?.finalY || 130;
    
    // Technician's Notes
    if (report.technicianNotes) {
      doc.setFontSize(12);
      doc.setTextColor(0, 102, 204);
      finalY += 10;
      doc.text('Technician\'s Notes', 20, finalY);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      // Split notes into multiple lines if too long
      const splitNotes = doc.splitTextToSize(report.technicianNotes, 170);
      doc.text(splitNotes, 20, finalY + 10);
      finalY += (splitNotes.length * 5) + 10;
    }
    
    // Date and signature
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(10);
    
    // Make sure we don't go off the page
    const signatureY = Math.max(finalY + 20, 270);
    doc.text(`Report Generated: ${currentDate}`, 20, signatureY);
    doc.text(`Technician Signature: ______________________`, 120, signatureY);
    
    // Save the PDF
    doc.save(`Lab_Report_${report.specimenId || 'Report'}.pdf`);
  };

  // Render component
  if (loading) {
    return (
      <div className={`${isModal ? 'p-8' : 'min-h-screen'} bg-slate-50 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading lab request data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${isModal ? 'p-8' : 'min-h-screen'} bg-slate-50 ${isModal ? '' : 'p-8'}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-red-800 mb-4">Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded border border-red-100">
            <p className="font-semibold">Troubleshooting:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Check that the backend server is running</li>
              <li>Verify that the lab request ID is valid</li>
              <li>Make sure you're properly authenticated</li>
              <li>Check if the lab request exists in the database</li>
            </ul>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                if (isModal && onClose) {
                  onClose();
                } else {
                  navigate('/lab-technician');
                }
              }} 
              className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isModal ? 'Close' : 'Return to Dashboard'}
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!labRequest) {
    return (
      <div className={`${isModal ? 'p-8' : 'min-h-screen'} bg-slate-50 ${isModal ? '' : 'p-8'}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-yellow-800 mb-4">Lab Request Not Found</h2>
          <p className="text-yellow-700 mb-4">The requested lab request could not be found or loaded.</p>
          <button 
            onClick={() => {
              if (isModal && onClose) {
                onClose();
              } else {
                navigate('/lab-technician');
              }
            }} 
            className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isModal ? 'Close' : 'Return to Dashboard'}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={isModal ? "bg-white" : "min-h-screen bg-slate-50 p-8"}>
      <div className={`bg-white rounded-xl shadow-sm overflow-hidden p-6 ${isModal ? '' : 'max-w-5xl mx-auto'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Laboratory Report Creation
          </h2>
          <button
            onClick={() => {
              if (isModal && onClose) {
                onClose();
              } else {
                navigate('/lab-technician');
              }
            }}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {isModal ? 'Close' : 'Back to Dashboard'}
          </button>
        </div>
        
        {/* Patient Information (Read-only) */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Patient Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Patient Name</p>
              <p className="font-medium text-gray-800">
                {labRequest?.patientName || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Patient ID</p>
              <p className="font-medium text-gray-800">
                {labRequest?.patient?._id || labRequest?.patient || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Test Type</p>
              <p className="font-medium text-gray-800">
                {labRequest?.testType || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Request Date</p>
              <p className="font-medium text-gray-800">
                {labRequest?.createdAt 
                  ? new Date(labRequest.createdAt).toLocaleDateString() 
                  : 'N/A'}
              </p>
            </div>
            {labRequest?.preferredDate && (
              <div>
                <p className="text-sm text-gray-600">Preferred Date</p>
                <p className="font-medium text-gray-800">
                  {new Date(labRequest.preferredDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {labRequest?.preferredTime && (
              <div>
                <p className="text-sm text-gray-600">Preferred Time</p>
                <p className="font-medium text-gray-800">
                  {new Date(labRequest.preferredTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>
        </div>

      <form ref={reportFormRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Specimen Information */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-3">Specimen Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="specimenId" className="block text-sm font-medium text-gray-700 mb-1">
                Specimen ID
              </label>
              <input
                type="text"
                id="specimenId"
                name="specimenId"
                required
                value={report.specimenId}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-100 cursor-not-allowed'}`}
                placeholder="Enter specimen ID"
              />
            </div>
            <div>
              <label htmlFor="specimenType" className="block text-sm font-medium text-gray-700 mb-1">
                Specimen Type
              </label>
              <input
                type="text"
                id="specimenType"
                name="specimenType"
                required
                value={report.specimenType}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-100 cursor-not-allowed'}`}
                placeholder="Enter specimen type"
              />
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-semibold text-gray-800">Test Results</h3>
            {isEditing && (
              <button 
                type="button" 
                onClick={addTestResultRow}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Row
              </button>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Component
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Result
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference Range
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.testResults.map((result, index) => {
                  const component = componentConfigs[result.component];
                  const validationKey = `result_${index}`;
                  const validation = validationStates[validationKey] || (component ? validateValue(result.result, component) : null);
                  
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          required
                          value={result.component}
                          onChange={(e) => handleTestResultChange(index, 'component', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-2 py-1 border border-gray-300 rounded ${isEditing ? 'focus:ring-1 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-100 cursor-not-allowed'}`}
                          placeholder="e.g., Hemoglobin"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {renderEnhancedInput(
                            result.result,
                            (e) => handleTestResultChange(index, 'result', e.target.value),
                            component,
                            index,
                            'result'
                          )}
                          {component && component.referenceRange && (
                            <div className="text-xs text-gray-600">
                              Reference: {component.referenceRange} {component.unit}
                            </div>
                          )}
                          {validation && validation.message && isEditing && (
                            <div className={`text-xs ${
                              validation.status === 'error' ? 'text-red-600' :
                              validation.status === 'warning' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {validation.message}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={result.referenceRange}
                          onChange={(e) => handleTestResultChange(index, 'referenceRange', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-2 py-1 border border-gray-300 rounded ${isEditing ? 'focus:ring-1 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-100 cursor-not-allowed'}`}
                          placeholder="e.g., 13.5-17.5"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={result.units}
                          onChange={(e) => handleTestResultChange(index, 'units', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-2 py-1 border border-gray-300 rounded ${isEditing ? 'focus:ring-1 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-100 cursor-not-allowed'}`}
                          placeholder="e.g., g/dL"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing && report.testResults.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTestResultRow(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Technician's Notes */}
        <div>
          <label htmlFor="technicianNotes" className="block text-sm font-medium text-gray-700 mb-1">
            Technician's Notes
          </label>
          <div className="relative">
            <textarea
              id="technicianNotes"
              name="technicianNotes"
              rows={4}
              value={report.technicianNotes}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 1000) {
                  handleInputChange(e);
                }
              }}
              onInput={(e) => handleTextInput(e, { type: 'text', maxLength: 1000 })}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg resize-none ${isEditing ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-100 cursor-not-allowed'}`}
              placeholder="Enter any additional observations or notes about the test results..."
              maxLength={1000}
            />
            {isEditing && report.technicianNotes && (
              <div className="absolute bottom-2 right-2 text-xs bg-white px-1 rounded">
                {(() => {
                  const charCount = getCharacterCount(report.technicianNotes, 1000);
                  return (
                    <span className={charCount.colorClass}>
                      {charCount.text}
                    </span>
                  );
                })()}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Maximum 1000 characters. Use for quality control notes, observations, or additional comments.
          </div>
        </div>

        {/* Form Status Summary */}
        {isEditing && Object.keys(validationStates).length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Form Validation Status</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {computedValidation.normalFields}
                </div>
                <div className="text-xs text-gray-600">Normal</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-yellow-600">
                  {computedValidation.warningFields}
                </div>
                <div className="text-xs text-gray-600">Warnings</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-red-600">
                  {computedValidation.errorFields}
                </div>
                <div className="text-xs text-gray-600">Errors</div>
              </div>
            </div>
            {computedValidation.hasWarnings && !computedValidation.hasErrors && (
              <div className="mt-3 text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                ⚠ Some values are outside normal ranges but can still be submitted.
              </div>
            )}
            {computedValidation.hasErrors && (
              <div className="mt-3 text-xs text-red-700 bg-red-50 p-2 rounded">
                ✗ Please correct all errors before saving the report.
              </div>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          {/* Download PDF button - always visible */}
          <button
            type="button"
            onClick={generatePDF}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download as PDF
          </button>
          
          {/* View Mode Buttons */}
          {!isEditing && existingReport && (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Report
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isModal && onClose) {
                    onClose();
                  } else {
                    navigate('/lab-technician');
                  }
                }}
                className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {isModal ? 'Close' : 'Back to Dashboard'}
              </button>
            </>
          )}
          
          {/* Edit Mode Buttons */}
          {isEditing && (
            <>
              {existingReport && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form to original data
                    setReport({
                      specimenId: existingReport.specimenId || '',
                      specimenType: existingReport.specimenType || '',
                      technicianNotes: existingReport.technicianNotes || '',
                      testResults: existingReport.testResults || [{ component: '', result: '', referenceRange: '', units: '' }]
                    });
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading || computedValidation.hasErrors}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  loading || computedValidation.hasErrors
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : computedValidation.hasWarnings
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                title={computedValidation.hasErrors ? 'Please correct all errors before submitting' : ''}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Submitting...' : existingReport ? 'Save Changes' : 'Submit Report'}
                {computedValidation.hasWarnings && !computedValidation.hasErrors && (
                  <span className="ml-2 text-xs">⚠</span>
                )}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
    </div>
  );
};

export default LabReportCreation;