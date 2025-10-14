import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';

const LabRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [labRequest, setLabRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLabRequest = async () => {
      try {
        // Fetch lab request details from API
        const response = await fetch(`http://localhost:5000/api/lab-requests/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch lab request: ${response.status}`);
        }

        const data = await response.json();
        setLabRequest(data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lab request:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchLabRequest();
  }, [id]);

  // Function to update lab request status
  const updateStatus = async (newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/lab-requests/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }

      const data = await response.json();
      setLabRequest(data.data);
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Failed to update status: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="text-blue-600 animate-spin" />
        <span className="ml-2 text-slate-600">Loading request details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
          <h2 className="font-semibold">Error</h2>
          <p>{error}</p>
          <button
            className="mt-2 bg-white border border-red-300 text-red-600 px-3 py-1 rounded-md hover:bg-red-50"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!labRequest) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-700">
          <h2 className="font-semibold">Lab Request Not Found</h2>
          <p>The requested lab order could not be found.</p>
          <button
            className="mt-2 bg-white border border-yellow-300 text-yellow-600 px-3 py-1 rounded-md hover:bg-yellow-50"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Lab Request Details</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-slate-800 text-lg">
                {labRequest.testType}
              </h2>
              <p className="text-sm text-slate-500">
                Request ID: {labRequest._id}
              </p>
            </div>
            <div className="flex items-center">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  labRequest.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : labRequest.status === 'in-progress' 
                    ? 'bg-blue-100 text-blue-800'
                    : labRequest.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {labRequest.status.charAt(0).toUpperCase() + labRequest.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Patient Information */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-slate-800 mb-3 border-b border-slate-100 pb-2">
              Patient Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Patient Name</p>
                <p className="text-slate-800">{labRequest.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Patient ID</p>
                <p className="text-slate-800">{labRequest.patientId}</p>
              </div>
            </div>
          </div>

          {/* Test Details */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-slate-800 mb-3 border-b border-slate-100 pb-2">
              Test Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Test Type</p>
                <p className="text-slate-800">{labRequest.testType}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Priority</p>
                <p className="text-slate-800 uppercase">
                  <span className={`font-medium ${
                    labRequest.priority === 'high' 
                      ? 'text-red-600' 
                      : labRequest.priority === 'medium' 
                      ? 'text-orange-600'
                      : 'text-blue-600'
                  }`}>
                    {labRequest.priority}
                  </span>
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-slate-500">Notes</p>
                <p className="text-slate-800">{labRequest.notes || 'No notes provided'}</p>
              </div>
            </div>
          </div>

          {/* Status History */}
          {labRequest.statusHistory && labRequest.statusHistory.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold text-slate-800 mb-3 border-b border-slate-100 pb-2">
                Status History
              </h3>
              <div className="space-y-3">
                {labRequest.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 mr-2"></div>
                    <div>
                      <p className="text-sm text-slate-800 font-medium">{history.status}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(history.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end space-x-3">
          {labRequest.status === 'pending' && (
            <>
              <button
                onClick={() => updateStatus('in-progress')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Start Processing
              </button>
              <button
                onClick={() => updateStatus('rejected')}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
              >
                Reject
              </button>
            </>
          )}

          {labRequest.status === 'in-progress' && (
            <button
              onClick={() => updateStatus('completed')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Complete Test
            </button>
          )}

          {(labRequest.status === 'completed' || labRequest.status === 'rejected') && (
            <button
              onClick={() => navigate('/lab-technician')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              View All Lab Requests
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabRequestDetail;