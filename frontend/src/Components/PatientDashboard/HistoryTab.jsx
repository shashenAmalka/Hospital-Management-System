import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Calendar, 
  User, 
  FileText, 

  Pill, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Activity
} from 'lucide-react';

const HistoryTab = ({ user }) => {
  const [visitHistory, setVisitHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedVisits, setExpandedVisits] = useState({});
  const API_URL = 'http://localhost:5000';

  useEffect(() => {
    if (user && user._id) {
      fetchVisitHistory();
    } else {
      setError('User information is not available');
      setLoading(false);
    }
  }, [user]);

  const fetchVisitHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`${API_URL}/patients/${user._id}/visits`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setVisitHistory([]);
          return;
        }
        throw new Error(`Failed to fetch visit history: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Defensive: ensure data is an array
      const data = result?.data || result || [];
      setVisitHistory(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('Error fetching visit history:', error);
      setError(error.message || 'Failed to load visit history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVisitExpansion = (visitId) => {
    setExpandedVisits(prev => ({
      ...prev,
      [visitId]: !prev[visitId]
    }));
  };

  const getStatusColor = (status) => {
    const statusColors = {
      completed: 'bg-green-100 text-green-800',
      confirmed: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-gray-100 text-gray-800',
      pending: 'bg-orange-100 text-orange-800'
    };
    return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      completed: CheckCircle,
      confirmed: CheckCircle,
      cancelled: XCircle,
      scheduled: Clock,
      pending: AlertCircle
    };
    const Icon = statusIcons[status?.toLowerCase()] || AlertCircle;
    return <Icon className="h-4 w-4" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-600">Loading visit history...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Visit History</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchVisitHistory}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!visitHistory || visitHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-slate-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
          <Calendar className="h-12 w-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">No Visit History</h3>
        <p className="text-slate-600">You don't have any recorded visits yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Visit History</h3>
          <p className="text-sm text-slate-600 mt-1">
            {visitHistory.length} {visitHistory.length === 1 ? 'visit' : 'visits'} recorded
          </p>
        </div>
        <button
          onClick={fetchVisitHistory}
          className="px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      <div className="space-y-4">
        {visitHistory.map((visit) => {
          const isExpanded = expandedVisits[visit._id];
          const hasLabRequests = visit.labRequests && visit.labRequests.length > 0;
          const hasPrescriptions = visit.prescriptions && visit.prescriptions.length > 0;
          const hasAdditionalInfo = hasLabRequests || hasPrescriptions || visit.diagnosis || visit.treatment;
          
          return (
            <div 
              key={visit._id} 
              className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Visit Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="bg-blue-100 rounded-lg p-3 flex-shrink-0">
                      <Heart className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h4 className="font-semibold text-slate-800 text-lg">
                          {visit.reason || 'Consultation'}
                        </h4>
                        <span className={`inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(visit.status)}`}>
                          {getStatusIcon(visit.status)}
                          <span>{visit.status || 'Unknown'}</span>
                        </span>
                      </div>
                      
                      {/* Doctor Info */}
                      {visit.doctor && (
                        <div className="flex items-center space-x-2 text-slate-700 mb-1">
                          <Stethoscope className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">
                            Dr. {visit.doctor.name || 'Unknown Doctor'}
                          </span>
                          {visit.doctor.specialization && (
                            <span className="text-slate-500 text-sm">
                              • {visit.doctor.specialization}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Department */}
                      {visit.department && (
                        <div className="flex items-center space-x-2 text-slate-600 text-sm mb-1">
                          <Activity className="h-4 w-4 text-slate-400" />
                          <span>{visit.department.name}</span>
                        </div>
                      )}
                      
                      {/* Date and Time */}
                      <div className="flex items-center space-x-2 text-slate-500 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(visit.appointmentDate)}</span>
                        {visit.appointmentTime && (
                          <>
                            <Clock className="h-4 w-4 ml-2" />
                            <span>{formatTime(visit.appointmentTime)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expand/Collapse Button */}
                  {hasAdditionalInfo && (
                    <button
                      onClick={() => toggleVisitExpansion(visit._id)}
                      className="ml-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                      aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>
                
                {/* Quick Summary Pills */}
                <div className="flex items-center space-x-3 mt-3">
                  {hasLabRequests && (
                    <span className="inline-flex items-center space-x-1 text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">
                      <Flask className="h-3 w-3" />
                      <span>{visit.labRequests.length} Lab Test{visit.labRequests.length !== 1 ? 's' : ''}</span>
                    </span>
                  )}
                  {hasPrescriptions && (
                    <span className="inline-flex items-center space-x-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                      <Pill className="h-3 w-3" />
                      <span>{visit.prescriptions.length} Prescription{visit.prescriptions.length !== 1 ? 's' : ''}</span>
                    </span>
                  )}
                  {visit.diagnosis && (
                    <span className="inline-flex items-center space-x-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                      <FileText className="h-3 w-3" />
                      <span>Diagnosis</span>
                    </span>
                  )}
                </div>
                
                {/* Basic Notes (always visible if present) */}
                {visit.notes && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-700">
                      <strong className="text-slate-800">Notes:</strong> {visit.notes}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Expanded Details */}
              {isExpanded && hasAdditionalInfo && (
                <div className="px-6 pb-6 pt-0 border-t border-slate-200 space-y-4">
                  {/* Diagnosis Section */}
                  {visit.diagnosis && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex items-start space-x-2">
                        <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h5 className="font-semibold text-blue-900 mb-1">Diagnosis</h5>
                          <p className="text-sm text-blue-800">{visit.diagnosis}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Treatment Section */}
                  {visit.treatment && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h5 className="font-semibold text-green-900 mb-1">Treatment</h5>
                          <p className="text-sm text-green-800">{visit.treatment}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Lab Requests Section */}
                  {hasLabRequests && (
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                      <div className="flex items-start space-x-2 mb-3">
                        <Flask className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <h5 className="font-semibold text-purple-900">Lab Tests</h5>
                      </div>
                      <div className="space-y-3">
                        {visit.labRequests.map((labRequest, index) => (
                          <div key={labRequest._id || index} className="bg-white rounded-lg p-3 border border-purple-200">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-medium text-slate-800">
                                  {labRequest.testType || 'Test Type Not Specified'}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  Priority: <span className="capitalize">{labRequest.priority || 'normal'}</span>
                                </p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(labRequest.status)}`}>
                                {labRequest.status || 'pending'}
                              </span>
                            </div>
                            
                            {labRequest.notes && (
                              <p className="text-sm text-slate-600 mt-2">
                                <strong>Notes:</strong> {labRequest.notes}
                              </p>
                            )}
                            
                            {/* Lab Report Info */}
                            {labRequest.report ? (
                              <div className="mt-2 pt-2 border-t border-purple-100">
                                <p className="text-xs text-green-600 font-medium mb-1">
                                  ✓ Report Available
                                </p>
                                {labRequest.report.testResults && labRequest.report.testResults.length > 0 && (
                                  <p className="text-xs text-slate-600">
                                    {labRequest.report.testResults.length} test result{labRequest.report.testResults.length !== 1 ? 's' : ''} recorded
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 mt-2">No report available yet</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Prescriptions Section */}
                  {hasPrescriptions && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <div className="flex items-start space-x-2 mb-3">
                        <Pill className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <h5 className="font-semibold text-green-900">Prescriptions</h5>
                      </div>
                      <div className="space-y-3">
                        {visit.prescriptions.map((prescription, index) => (
                          <div key={prescription._id || index} className="bg-white rounded-lg p-3 border border-green-200">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                {prescription.diagnosis && (
                                  <p className="text-sm text-slate-700 mb-2">
                                    <strong>For:</strong> {prescription.diagnosis}
                                  </p>
                                )}
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(prescription.status)}`}>
                                {prescription.status || 'pending'}
                              </span>
                            </div>
                            
                            {/* Medicines List */}
                            {prescription.medicines && prescription.medicines.length > 0 && (
                              <div className="space-y-2">
                                {prescription.medicines.map((medicine, medIndex) => (
                                  <div key={medIndex} className="text-sm bg-slate-50 p-2 rounded border border-slate-200">
                                    <p className="font-medium text-slate-800">{medicine.name || 'Medicine'}</p>
                                    <div className="grid grid-cols-2 gap-2 mt-1 text-xs text-slate-600">
                                      {medicine.dosage && <p><strong>Dosage:</strong> {medicine.dosage}</p>}
                                      {medicine.frequency && <p><strong>Frequency:</strong> {medicine.frequency}</p>}
                                      {medicine.duration && <p><strong>Duration:</strong> {medicine.duration}</p>}
                                    </div>
                                    {medicine.instructions && (
                                      <p className="text-xs text-slate-600 mt-1">
                                        <strong>Instructions:</strong> {medicine.instructions}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {prescription.notes && (
                              <p className="text-sm text-slate-600 mt-2">
                                <strong>Notes:</strong> {prescription.notes}
                              </p>
                            )}
                            
                            {prescription.dispensedBy && (
                              <p className="text-xs text-green-600 mt-2">
                                Dispensed by: {prescription.dispensedBy.name}
                                {prescription.dispensedAt && ` on ${formatDate(prescription.dispensedAt)}`}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Follow-up Information */}
                  {visit.followUpRequired && (
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h5 className="font-semibold text-yellow-900 mb-1">Follow-up Required</h5>
                          {visit.followUpDate && (
                            <p className="text-sm text-yellow-800">
                              Scheduled for: {formatDate(visit.followUpDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryTab;