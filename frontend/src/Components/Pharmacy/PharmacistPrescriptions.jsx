import React, { useState, useEffect } from 'react';
import {
  Pill,
  User,
  UserCog,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  Eye,
  Search,
  RefreshCw,
  AlertCircle,
  Package
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const PharmacistPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Get current pharmacist ID
  const getCurrentPharmacistId = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user._id || user.id;
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
    return null;
  };

  const pharmacistId = getCurrentPharmacistId();

  // Fetch prescriptions for pharmacy
  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/prescriptions/pharmacy`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setPrescriptions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      alert('Failed to load prescriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    // Set up polling for new prescriptions every 30 seconds
    const interval = setInterval(fetchPrescriptions, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter prescriptions
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = 
      `${prescription.patient?.firstName} ${prescription.patient?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${prescription.doctor?.firstName} ${prescription.doctor?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Update prescription status
  const updatePrescriptionStatus = async (prescriptionId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/prescriptions/${prescriptionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ 
          status,
          dispensedBy: pharmacistId 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        alert(`Prescription ${status} successfully!`);
        fetchPrescriptions();
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Error updating prescription:', error);
      alert('Failed to update prescription. Please try again.');
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'sent-to-pharmacy':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'dispensed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent-to-pharmacy':
        return <Clock size={16} />;
      case 'in-progress':
        return <Package size={16} />;
      case 'dispensed':
      case 'completed':
        return <CheckCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  if (loading && prescriptions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Prescriptions</h2>
        <p className="text-gray-600">Manage and dispense patient prescriptions</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by patient, doctor, or diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="sent-to-pharmacy">New</option>
          <option value="in-progress">In Progress</option>
          <option value="dispensed">Dispensed</option>
        </select>

        <button
          onClick={fetchPrescriptions}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">New Prescriptions</p>
              <p className="text-2xl font-bold text-blue-800">
                {prescriptions.filter(p => p.status === 'sent-to-pharmacy').length}
              </p>
            </div>
            <Clock className="text-blue-600" size={32} />
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">In Progress</p>
              <p className="text-2xl font-bold text-yellow-800">
                {prescriptions.filter(p => p.status === 'in-progress').length}
              </p>
            </div>
            <Package className="text-yellow-600" size={32} />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Dispensed Today</p>
              <p className="text-2xl font-bold text-green-800">
                {prescriptions.filter(p => 
                  p.status === 'dispensed' && 
                  p.dispensedAt && 
                  new Date(p.dispensedAt).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>
      </div>

      {/* Prescriptions Table */}
      {filteredPrescriptions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 text-lg">No prescriptions found</p>
          <p className="text-gray-500 text-sm mt-2">
            {statusFilter !== 'all' 
              ? `No prescriptions with status "${statusFilter}"`
              : 'New prescriptions will appear here'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicines
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPrescriptions.map((prescription) => (
                  <tr key={prescription._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="text-blue-600" size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {prescription.patient?.firstName} {prescription.patient?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {prescription.patient?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserCog className="text-gray-400 mr-2" size={16} />
                        <div className="text-sm text-gray-900">
                          Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {prescription.diagnosis}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Pill className="text-gray-400 mr-2" size={16} />
                        <span className="text-sm text-gray-900">
                          {prescription.medicines?.length || 0} item(s)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-2" size={16} />
                        {new Date(prescription.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                        {getStatusIcon(prescription.status)}
                        {prescription.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-bold text-gray-800">Prescription Details</h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient & Doctor Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-2">Patient Information</p>
                  <p className="font-semibold text-gray-800">
                    {selectedPrescription.patient?.firstName} {selectedPrescription.patient?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{selectedPrescription.patient?.email}</p>
                  {selectedPrescription.patient?.phone && (
                    <p className="text-sm text-gray-600">{selectedPrescription.patient?.phone}</p>
                  )}
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium mb-2">Prescribed By</p>
                  <p className="font-semibold text-gray-800">
                    Dr. {selectedPrescription.doctor?.firstName} {selectedPrescription.doctor?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{selectedPrescription.doctor?.specialization}</p>
                  <p className="text-sm text-gray-600">{selectedPrescription.doctor?.department}</p>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Diagnosis</p>
                <p className="text-gray-800">{selectedPrescription.diagnosis}</p>
              </div>

              {/* Medicines */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Medicines</p>
                <div className="space-y-3">
                  {selectedPrescription.medicines?.map((medicine, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-gray-800">{medicine.name}</p>
                        <span className="text-sm text-gray-500">#{index + 1}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Dosage:</span>
                          <span className="ml-2 text-gray-800">{medicine.dosage}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Frequency:</span>
                          <span className="ml-2 text-gray-800">{medicine.frequency}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <span className="ml-2 text-gray-800">{medicine.duration}</span>
                        </div>
                      </div>
                      {medicine.instructions && (
                        <p className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Instructions:</span> {medicine.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedPrescription.notes && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Additional Notes</p>
                  <p className="text-gray-800">{selectedPrescription.notes}</p>
                </div>
              )}

              {/* Status & Date Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPrescription.status)}`}>
                    {getStatusIcon(selectedPrescription.status)}
                    {selectedPrescription.status.replace('-', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2 text-gray-800">
                    {new Date(selectedPrescription.createdAt).toLocaleString()}
                  </span>
                </div>
                {selectedPrescription.dispensedAt && (
                  <>
                    <div>
                      <span className="text-gray-500">Dispensed:</span>
                      <span className="ml-2 text-gray-800">
                        {new Date(selectedPrescription.dispensedAt).toLocaleString()}
                      </span>
                    </div>
                    {selectedPrescription.dispensedBy && (
                      <div>
                        <span className="text-gray-500">Dispensed By:</span>
                        <span className="ml-2 text-gray-800">
                          {selectedPrescription.dispensedBy.firstName} {selectedPrescription.dispensedBy.lastName}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedPrescription(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
              {selectedPrescription.status === 'sent-to-pharmacy' && (
                <button
                  onClick={() => updatePrescriptionStatus(selectedPrescription._id, 'in-progress')}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  Start Processing
                </button>
              )}
              {selectedPrescription.status === 'in-progress' && (
                <button
                  onClick={() => updatePrescriptionStatus(selectedPrescription._id, 'dispensed')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Mark as Dispensed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacistPrescriptions;
