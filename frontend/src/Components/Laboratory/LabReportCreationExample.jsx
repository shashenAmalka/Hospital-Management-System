import React from 'react';
import LabReportCreation from './LabReportCreation';

// This is a demo/example component showing how to use the LabReportCreation component
const LabReportCreationExample = () => {
  // Sample lab request object that would be passed from your actual application
  const sampleLabRequest = {
    _id: "lab-req-12345",
    patientName: "John Doe",
    patient: "patient-12345",
    testType: "blood",
    priority: "urgent",
    notes: "Patient complains of fatigue and dizziness",
    status: "pending",
    createdAt: new Date(),
    preferredDate: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 days from now
    preferredTime: new Date(new Date().setHours(10, 30)) // 10:30 AM
  };

  // Sample submit handler function that would be implemented in your actual application
  const handleSubmitLabReport = async (reportData) => {
    console.log("Report submitted:", reportData);
    
    // In a real application, you would send this data to your backend API
    // Example:
    // try {
    //   const response = await fetch('http://localhost:5000/api/lab-reports/create', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${localStorage.getItem('token')}`
    //     },
    //     body: JSON.stringify(reportData)
    //   });
    //   
    //   if (!response.ok) throw new Error('Failed to submit lab report');
    //   return await response.json();
    // } catch (error) {
    //   console.error('Error submitting lab report:', error);
    //   throw error;
    // }
    
    // For demo purposes, just return a promise that resolves after a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: reportData });
      }, 1000);
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Lab Report Creation Example</h1>
      <LabReportCreation 
        labRequest={sampleLabRequest} 
        onSubmit={handleSubmitLabReport} 
      />
    </div>
  );
};

export default LabReportCreationExample;