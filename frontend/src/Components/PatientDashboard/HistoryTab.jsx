import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  FileText, 
  Clock, 
  User, 
  ChevronDown, 
  ChevronUp,
  Activity,
  TestTube,
  Download,
  Eye,
  AlertCircle,
  Pill,
  Search,
  Filter
} from 'lucide-react';

const HistoryTab = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('all'); // 'all', 'appointments', 'labs', 'prescriptions'
  const [expandedItems, setExpandedItems] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (user && user._id) {
      fetchHistoryData();
    }
  }, [user]);

  const fetchHistoryData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch appointments
      const appointmentsResponse = await fetch(
        `${API_URL}/appointments/user/${user._id}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        console.log('✅ Appointments fetched:', appointmentsData);
        
        // Backend returns {status, results, data} format
        const appointmentsArray = appointmentsData.data || appointmentsData;
        
        // Filter for completed appointments only
        const completedAppointments = Array.isArray(appointmentsArray) 
          ? appointmentsArray.filter(apt => 
              apt.status === 'completed' || 
              apt.status === 'confirmed' ||
              new Date(apt.appointmentDate) < new Date()
            )
          : [];
        
        setAppointments(completedAppointments);
      } else {
        console.warn('⚠️ Failed to fetch appointments:', appointmentsResponse.status);
      }

      // Fetch lab reports
      const labReportsResponse = await fetch(
        `${API_URL}/lab-reports?patientId=${user._id}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (labReportsResponse.ok) {
        const labReportsData = await labReportsResponse.json();
        console.log('✅ Lab reports fetched:', labReportsData);
        
        // Backend might return {data: []} or directly []
        const labReportsArray = labReportsData.data || labReportsData;
        setLabReports(Array.isArray(labReportsArray) ? labReportsArray : []);
      } else {
        console.warn('⚠️ Failed to fetch lab reports:', labReportsResponse.status);
      }

      // Fetch prescriptions
      const prescriptionsResponse = await fetch(
        `${API_URL}/prescriptions/patient/${user._id}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (prescriptionsResponse.ok) {
        const prescriptionsData = await prescriptionsResponse.json();
        console.log('✅ Prescriptions fetched:', prescriptionsData);
        
        // Backend returns {data: []} format
        const prescriptionsArray = prescriptionsData.data || prescriptionsData;
        setPrescriptions(Array.isArray(prescriptionsArray) ? prescriptionsArray : []);
      } else {
        console.warn('⚠️ Failed to fetch prescriptions:', prescriptionsResponse.status);
      }

    } catch (error) {
      console.error('❌ Error fetching history data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'completed': 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg',
      'confirmed': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg',
      'pending': 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg',
      'cancelled': 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg',
      'rescheduled': 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg',
      'active': 'bg-gradient-to-r from-green-400 to-teal-400 text-white shadow-lg'
    };
    return statusColors[status?.toLowerCase()] || 'bg-gradient-to-r from-gray-400 to-slate-400 text-white shadow-lg';
  };

  const AppointmentCard = ({ appointment }) => {
    const isExpanded = expandedItems[`apt-${appointment._id}`];
    
    return (
      <div className="bg-gradient-to-br from-white via-teal-50/20 to-cyan-50/20 border-2 border-teal-200/60 rounded-2xl p-6 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            <div className="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-xl p-3 shadow-lg">
              <Calendar className="h-6 w-6 text-white drop-shadow-lg" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="font-semibold text-slate-800 text-lg">
                  {appointment.appointmentType || 'General Consultation'}
                </h4>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Dr. {appointment.doctorName || appointment.doctorId?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(appointment.appointmentDate)}</span>
                </div>
                {appointment.department && (
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>{appointment.department}</span>
                  </div>
                )}
              </div>

              {isExpanded && appointment.reason && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700">
                    <strong className="text-slate-900">Reason:</strong> {appointment.reason}
                  </p>
                  {appointment.notes && (
                    <p className="text-sm text-slate-700 mt-2">
                      <strong className="text-slate-900">Notes:</strong> {appointment.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => toggleExpand(`apt-${appointment._id}`)}
            className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>
    );
  };

  const PrescriptionCard = ({ prescription }) => {
    const isExpanded = expandedItems[`presc-${prescription._id}`];
    
    return (
      <div className="bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/20 border-2 border-emerald-200/60 rounded-2xl p-6 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl p-3 shadow-lg">
              <Pill className="h-6 w-6 text-white drop-shadow-lg" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="font-semibold text-slate-800 text-lg">
                  Prescription
                </h4>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(prescription.status)}`}>
                  {prescription.status || 'Active'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-slate-600">
                {prescription.doctorName && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Dr. {prescription.doctorName}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(prescription.createdAt)}</span>
                </div>
                {prescription.medications && prescription.medications.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Pill className="h-4 w-4" />
                    <span>{prescription.medications.length} medication{prescription.medications.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {isExpanded && prescription.medications && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-slate-900 mb-2">Medications:</p>
                  {prescription.medications.map((med, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-800">{med.name}</p>
                      <div className="text-xs text-slate-600 mt-1 space-y-1">
                        <p><strong>Dosage:</strong> {med.dosage}</p>
                        <p><strong>Frequency:</strong> {med.frequency}</p>
                        <p><strong>Duration:</strong> {med.duration}</p>
                        {med.instructions && <p><strong>Instructions:</strong> {med.instructions}</p>}
                      </div>
                    </div>
                  ))}
                  
                  {prescription.notes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-slate-700">
                        <strong className="text-slate-900">Doctor's Notes:</strong> {prescription.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => toggleExpand(`presc-${prescription._id}`)}
            className="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50 transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>
    );
  };

  const LabReportCard = ({ report }) => {
    const isExpanded = expandedItems[`lab-${report._id}`];
    
    return (
      <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/20 border-2 border-blue-200/60 rounded-2xl p-6 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-500 rounded-xl p-3 shadow-lg">
              <TestTube className="h-6 w-6 text-white drop-shadow-lg" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="font-semibold text-slate-800 text-lg">
                  {report.testType || 'Lab Test'}
                </h4>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(report.status)}`}>
                  {report.status || 'Completed'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-slate-600">
                {report.technicianName && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Technician: {report.technicianName}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(report.reportDate || report.createdAt)}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-3">
                  {report.result && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-700">
                        <strong className="text-slate-900">Result:</strong> {report.result}
                      </p>
                    </div>
                  )}
                  
                  {report.notes && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-700">
                        <strong className="text-slate-900">Notes:</strong> {report.notes}
                      </p>
                    </div>
                  )}

                  {report.isCritical && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Critical Result - Requires Attention</span>
                    </div>
                  )}

                  {report.reportFile && (
                    <div className="flex space-x-2">
                      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        <Download className="h-4 w-4" />
                        <span>Download Report</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm">
                        <Eye className="h-4 w-4" />
                        <span>View Report</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => toggleExpand(`lab-${report._id}`)}
            className="text-purple-600 hover:text-purple-700 p-2 rounded-lg hover:bg-purple-50 transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-500 border-r-purple-500 border-b-pink-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-400 opacity-20"></div>
        </div>
        <p className="mt-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 font-bold text-lg animate-pulse">
          Loading your medical history...
        </p>
        <div className="mt-4 flex space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 border-2 border-red-200 rounded-2xl shadow-xl p-8 max-w-md mx-auto backdrop-blur-sm">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 font-bold text-xl mb-2">Error Loading History</p>
          <p className="text-red-600 text-sm mb-6">{error}</p>
          <button
            onClick={fetchHistoryData}
            className="px-6 py-3 bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalItems = appointments.length + labReports.length + prescriptions.length;

  // Filter items based on search term
  const filterBySearch = (item, type) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    
    switch(type) {
      case 'appointment':
        return (item.doctorName?.toLowerCase().includes(search) ||
                item.appointmentType?.toLowerCase().includes(search) ||
                item.department?.toLowerCase().includes(search) ||
                item.reason?.toLowerCase().includes(search));
      case 'lab':
        return (item.testType?.toLowerCase().includes(search) ||
                item.technicianName?.toLowerCase().includes(search) ||
                item.result?.toLowerCase().includes(search));
      case 'prescription':
        return (item.doctorName?.toLowerCase().includes(search) ||
                item.medications?.some(med => med.name?.toLowerCase().includes(search)) ||
                item.notes?.toLowerCase().includes(search));
      default:
        return true;
    }
  };

  const filteredAppointments = appointments.filter(apt => filterBySearch(apt, 'appointment'));
  const filteredLabReports = labReports.filter(lab => filterBySearch(lab, 'lab'));
  const filteredPrescriptions = prescriptions.filter(presc => filterBySearch(presc, 'prescription'));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-extrabold text-black">
              🏥 Visit History
            </h3>
            <p className="text-slate-600 mt-2 font-medium">
              <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full text-sm font-semibold shadow-lg mr-2">
                {totalItems} total
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full text-sm font-semibold shadow-lg mr-2">
                {appointments.length} appointments
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full text-sm font-semibold shadow-lg mr-2">
                {prescriptions.length} prescriptions
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full text-sm font-semibold shadow-lg">
                {labReports.length} lab reports
              </span>
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 rounded-xl opacity-30 group-hover:opacity-50 blur transition duration-300"></div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teal-500" />
            <input
              type="text"
              placeholder="🔍 Search by doctor, test type, medication, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white border-2 border-teal-200 rounded-xl focus:ring-4 focus:ring-teal-300 focus:border-teal-500 transition-all duration-300 font-medium placeholder-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-red-400 to-orange-400 text-white rounded-full hover:from-red-500 hover:to-orange-500 transition-all duration-300 flex items-center justify-center font-bold shadow-lg"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {/* View Filter Tabs - Consistent Color Theme */}
        <div className="flex flex-wrap gap-3 p-2">
          <button
            onClick={() => setActiveView('all')}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeView === 'all'
                ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white shadow-xl scale-105 hover:shadow-teal-500/50 ring-4 ring-teal-200/60'
                : 'bg-white text-slate-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 shadow-md hover:shadow-lg border-2 border-teal-100'
            }`}
          >
            ✨ All Records
          </button>
          <button
            onClick={() => setActiveView('appointments')}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeView === 'appointments'
                ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white shadow-xl scale-105 hover:shadow-teal-500/50 ring-4 ring-teal-200/60'
                : 'bg-white text-slate-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 shadow-md hover:shadow-lg border-2 border-teal-100'
            }`}
          >
            📅 Appointments
          </button>
          <button
            onClick={() => setActiveView('prescriptions')}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeView === 'prescriptions'
                ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white shadow-xl scale-105 hover:shadow-teal-500/50 ring-4 ring-teal-200/60'
                : 'bg-white text-slate-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 shadow-md hover:shadow-lg border-2 border-teal-100'
            }`}
          >
            💊 Prescriptions
          </button>
          <button
            onClick={() => setActiveView('labs')}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeView === 'labs'
                ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white shadow-xl scale-105 hover:shadow-teal-500/50 ring-4 ring-teal-200/60'
                : 'bg-white text-slate-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 shadow-md hover:shadow-lg border-2 border-teal-100'
            }`}
          >
            🧪 Lab Reports
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Appointments Section */}
        {(activeView === 'all' || activeView === 'appointments') && (
          <>
            {filteredAppointments.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Past Appointments</span>
                  <span className="text-sm font-normal text-slate-500">({filteredAppointments.length})</span>
                </h4>
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <AppointmentCard key={appointment._id} appointment={appointment} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Prescriptions Section */}
        {(activeView === 'all' || activeView === 'prescriptions') && (
          <>
            {filteredPrescriptions.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                  <Pill className="h-5 w-5 text-green-600" />
                  <span>Prescriptions</span>
                  <span className="text-sm font-normal text-slate-500">({filteredPrescriptions.length})</span>
                </h4>
                <div className="space-y-4">
                  {filteredPrescriptions.map((prescription) => (
                    <PrescriptionCard key={prescription._id} prescription={prescription} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Lab Reports Section */}
        {(activeView === 'all' || activeView === 'labs') && (
          <>
            {filteredLabReports.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                  <TestTube className="h-5 w-5 text-purple-600" />
                  <span>Lab Reports</span>
                  <span className="text-sm font-normal text-slate-500">({filteredLabReports.length})</span>
                </h4>
                <div className="space-y-4">
                  {filteredLabReports.map((report) => (
                    <LabReportCard key={report._id} report={report} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {totalItems === 0 && (
          <div className="text-center py-16">
            <div className="bg-slate-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No History Found</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              You don't have any past appointments or lab reports yet. 
              Your medical history will appear here once you've completed appointments or received lab results.
            </p>
          </div>
        )}

        {/* Filtered Empty State */}
        {totalItems > 0 && activeView === 'appointments' && filteredAppointments.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">
              {searchTerm ? 'No appointments match your search' : 'No past appointments found'}
            </p>
          </div>
        )}

        {totalItems > 0 && activeView === 'prescriptions' && filteredPrescriptions.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <Pill className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">
              {searchTerm ? 'No prescriptions match your search' : 'No prescriptions found'}
            </p>
          </div>
        )}

        {totalItems > 0 && activeView === 'labs' && filteredLabReports.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <TestTube className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">
              {searchTerm ? 'No lab reports match your search' : 'No lab reports found'}
            </p>
          </div>
        )}

        {/* Search No Results */}
        {searchTerm && filteredAppointments.length === 0 && filteredLabReports.length === 0 && filteredPrescriptions.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-800 font-medium mb-2">No results found for "{searchTerm}"</p>
            <p className="text-slate-600 text-sm">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryTab;