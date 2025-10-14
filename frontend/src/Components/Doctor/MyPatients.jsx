import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Plus,
  Eye,
  Pill,
  Search,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const MyPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    notes: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
  });

  // Get doctor ID from localStorage
  const getCurrentDoctorId = () => {
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

  const doctorId = getCurrentDoctorId();

  // Fetch doctor's patients
  const fetchPatients = async () => {
    if (!doctorId) {
      console.error('No doctor ID found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/appointments/doctor/${doctorId}/patients`, {
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
        setPatients(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      alert('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle prescription form changes
  const handlePrescriptionChange = (field, value) => {
    setPrescriptionForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle medicine changes
  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...prescriptionForm.medicines];
    updatedMedicines[index][field] = value;
    setPrescriptionForm(prev => ({ ...prev, medicines: updatedMedicines }));
  };

  // Add new medicine row
  const addMedicine = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }));
  };

  // Remove medicine row
  const removeMedicine = (index) => {
    const updatedMedicines = prescriptionForm.medicines.filter((_, i) => i !== index);
    setPrescriptionForm(prev => ({ ...prev, medicines: updatedMedicines }));
  };

  // Create prescription
  const handleCreatePrescription = async () => {
    if (!selectedPatient) return;

    // Validation
    if (!prescriptionForm.diagnosis.trim()) {
      alert('Please enter a diagnosis');
      return;
    }

    const validMedicines = prescriptionForm.medicines.filter(
      med => med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
    );

    if (validMedicines.length === 0) {
      alert('Please add at least one medicine with all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const prescriptionData = {
        patient: selectedPatient._id,
        doctor: doctorId,
        diagnosis: prescriptionForm.diagnosis,
        notes: prescriptionForm.notes,
        medicines: validMedicines,
        status: 'pending'
      };

      const response = await fetch(`${API_BASE_URL}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(prescriptionData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        alert('Prescription created successfully!');
        setShowPrescriptionModal(false);
        setPrescriptionForm({
          diagnosis: '',
          notes: '',
          medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
        });
        setSelectedPatient(null);
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
      alert('Failed to create prescription. Please try again.');
    }
  };

  // Send prescription to pharmacy
  const sendToPharmacy = async (prescriptionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/prescriptions/${prescriptionId}/send-to-pharmacy`, {
        method: 'PATCH',
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
        alert('Prescription sent to pharmacy successfully!');
        setShowPrescriptionModal(false);
        setPrescriptionForm({
          diagnosis: '',
          notes: '',
          medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
        });
        setSelectedPatient(null);
      }
    } catch (error) {
      console.error('Error sending prescription to pharmacy:', error);
      alert('Failed to send prescription to pharmacy. Please try again.');
    }
  };

  // Create and send prescription to pharmacy in one action
  const handleCreateAndSend = async () => {
    if (!selectedPatient) return;

    // Validation
    if (!prescriptionForm.diagnosis.trim()) {
      alert('Please enter a diagnosis');
      return;
    }

    const validMedicines = prescriptionForm.medicines.filter(
      med => med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
    );

    if (validMedicines.length === 0) {
      alert('Please add at least one medicine with all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const prescriptionData = {
        patient: selectedPatient._id,
        doctor: doctorId,
        diagnosis: prescriptionForm.diagnosis,
        notes: prescriptionForm.notes,
        medicines: validMedicines,
        status: 'pending'
      };

      // Create prescription
      const createResponse = await fetch(`${API_BASE_URL}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(prescriptionData)
      });

      if (!createResponse.ok) {
        throw new Error(`HTTP error! status: ${createResponse.status}`);
      }

      const createData = await createResponse.json();
      if (createData.status === 'success') {
        // Send to pharmacy
        await sendToPharmacy(createData.data._id);
      }
    } catch (error) {
      console.error('Error creating and sending prescription:', error);
      alert('Failed to create and send prescription. Please try again.');
    }
  };

  // Open prescription modal for a patient
  const openPrescriptionModal = (patient) => {
    setSelectedPatient(patient);
    setShowPrescriptionModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">My Patients</h2>
        <p className="text-gray-600">Manage your assigned patients and create prescriptions</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search patients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={fetchPatients}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {/* Patients Grid */}
      {filteredPatients.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 text-lg">No patients found</p>
          <p className="text-gray-500 text-sm mt-2">Patients will appear here after you confirm appointments</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div
              key={patient._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {patient.firstName} {patient.lastName}
                  </h3>
                  {patient.lastAppointment && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      patient.lastAppointment.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {patient.lastAppointment.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <Mail size={16} className="mr-2" />
                  <span className="text-sm">{patient.email}</span>
                </div>
                {patient.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone size={16} className="mr-2" />
                    <span className="text-sm">{patient.phone}</span>
                  </div>
                )}
                {patient.lastAppointment && (
                  <div className="flex items-center text-gray-600">
                    <Calendar size={16} className="mr-2" />
                    <span className="text-sm">
                      Last visit: {new Date(patient.lastAppointment.appointmentDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {patient.lastAppointment?.diagnosis && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Last Diagnosis:</p>
                  <p className="text-sm text-gray-700">{patient.lastAppointment.diagnosis}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => openPrescriptionModal(patient)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Pill size={16} />
                  New Prescription
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-bold text-gray-800">
                Create Prescription for {selectedPatient.firstName} {selectedPatient.lastName}
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={prescriptionForm.diagnosis}
                  onChange={(e) => handlePrescriptionChange('diagnosis', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter diagnosis..."
                />
              </div>

              {/* Medicines */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Medicines <span className="text-red-500">*</span>
                  </label>
                  <button
                    onClick={addMedicine}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1 text-sm"
                  >
                    <Plus size={16} />
                    Add Medicine
                  </button>
                </div>

                <div className="space-y-4">
                  {prescriptionForm.medicines.map((medicine, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Medicine Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={medicine.name}
                            onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="e.g., Paracetamol"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Dosage <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={medicine.dosage}
                            onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="e.g., 500mg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Frequency <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={medicine.frequency}
                            onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="e.g., 3 times daily"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Duration <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={medicine.duration}
                            onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="e.g., 7 days"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Instructions
                          </label>
                          <input
                            type="text"
                            value={medicine.instructions}
                            onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="e.g., Take after meals"
                          />
                        </div>
                      </div>
                      {prescriptionForm.medicines.length > 1 && (
                        <button
                          onClick={() => removeMedicine(index)}
                          className="mt-3 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={prescriptionForm.notes}
                  onChange={(e) => handlePrescriptionChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional instructions or notes..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPrescriptionModal(false);
                  setSelectedPatient(null);
                  setPrescriptionForm({
                    diagnosis: '',
                    notes: '',
                    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePrescription}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Save as Draft
              </button>
              <button
                onClick={handleCreateAndSend}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Create & Send to Pharmacy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPatients;
