import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X, Search, FileText } from 'lucide-react';
import { appointmentService } from '../../utils/api';
import { apiServices } from '../../utils/apiService';

const AppointmentsTab = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [searchError, setSearchError] = useState(null);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    patient: '',
    doctor: '',
    department: '',
    appointmentDate: '',
    appointmentTime: '',
    type: 'consultation',
    status: 'scheduled',
    reason: '',
    notes: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    prescriptions: [],
    followUpRequired: false,
    followUpDate: ''
  });
  const [prescriptionInput, setPrescriptionInput] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: ''
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAppointment, setEditAppointment] = useState(null);
  const [reportFormat, setReportFormat] = useState('csv');

  useEffect(() => {
    if (user && user._id) {
      console.log('User loaded:', user);
      fetchAppointments();
      fetchDepartments();
      fetchDoctors();
      setNewAppointment(prev => ({ ...prev, patient: user._id }));
    }
  }, [user]);

  useEffect(() => {
    if (newAppointment.department) {
      console.log('Department selected:', newAppointment.department);
      console.log('Doctors data type:', typeof doctors, Array.isArray(doctors) ? 'is array' : 'not array');
      console.log('Doctors count:', Array.isArray(doctors) ? doctors.length : 'N/A');

      // If doctors are loaded, filter by department
      if (Array.isArray(doctors) && doctors.length > 0) {
        const filtered = doctors.filter(doctor => {
          console.log(`Comparing doctor.department: ${doctor.department} with selected: ${newAppointment.department}`);
          return doctor.department === newAppointment.department;
        });
        
        console.log(`Filtered doctors: ${filtered.length}`);
        setFilteredDoctors(filtered);
      }
    } else {
      setFilteredDoctors([]);
    }
  }, [newAppointment.department, doctors]);

  useEffect(() => {
    if (searchTerm) {
      applySearch();
    } else {
      setFilteredAppointments(appointments);
      setSearchError(null);
    }
  }, [searchTerm, searchType, appointments]);

  const fetchAppointments = async () => {
    if (!user || !user._id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await appointmentService.getPatientAppointments(user._id);
      console.log('Appointments data:', data);
      
      if (Array.isArray(data)) {
        setAppointments(data);
        setFilteredAppointments(data);
      } else if (data && Array.isArray(data.data)) {
        setAppointments(data.data);
        setFilteredAppointments(data.data);
      } else {
        setAppointments([]);
        setFilteredAppointments([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again later.');
      setLoading(false);
      setAppointments([]);
      setFilteredAppointments([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const result = await apiServices.departments.getAll();
      setDepartments(result.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const fetchDoctors = async () => {
    try {
      console.log('Fetching doctors...');
      const data = await apiServices.staff.getByRole('doctor');
      console.log('Doctors fetched successfully');
      
      let doctorsArray = [];
      
      if (data && data.data && Array.isArray(data.data)) {
        doctorsArray = data.data;
        console.log('Doctors found in data.data array, count:', doctorsArray.length);
      } else if (Array.isArray(data)) {
        doctorsArray = data;
        console.log('Doctors found directly in data array, count:', doctorsArray.length);
      } else if (data && data.data) {
        console.log('Unexpected data structure:', data.data);
        
        if (typeof data.data === 'object') {
          const possibleArrays = Object.values(data.data).filter(Array.isArray);
          if (possibleArrays.length > 0) {
            doctorsArray = possibleArrays[0];
            console.log('Doctors found in nested data structure, count:', doctorsArray.length);
          }
        }
      }
      
      if (doctorsArray.length === 0) {
        console.warn('No doctors found in API response, using sample data');
        
        const deptIds = {};
        departments.forEach(dept => {
          if (dept._id && dept.name) {
            deptIds[dept.name.toLowerCase()] = dept._id;
          }
        });
        
        doctorsArray = [
          { 
            _id: 'doc1', 
            firstName: 'John', 
            lastName: 'Smith', 
            department: deptIds['cardiology'] || 'cardiology'
          },
          { 
            _id: 'doc2', 
            firstName: 'Sarah', 
            lastName: 'Johnson', 
            department: deptIds['cardiology'] || 'cardiology'
          },
          { 
            _id: 'doc3', 
            firstName: 'Robert', 
            lastName: 'Williams', 
            department: deptIds['neurology'] || 'neurology'
          },
          { 
            _id: 'doc4', 
            firstName: 'Emily', 
            lastName: 'Davis', 
            department: deptIds['pediatrics'] || 'pediatrics'
          }
        ];
      }
      
      doctorsArray.forEach(doctor => {
        console.log(`Doctor: ${doctor.firstName} ${doctor.lastName}, Department: ${doctor.department}`);
      });
      
      setDoctors(doctorsArray);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAppointment(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePrescriptionChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionInput(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addPrescription = () => {
    if (!prescriptionInput.medication || !prescriptionInput.dosage) {
      alert('Please enter medication name and dosage');
      return;
    }

    setNewAppointment(prev => ({
      ...prev,
      prescriptions: [
        ...prev.prescriptions,
        { ...prescriptionInput }
      ]
    }));

    // Clear the input fields
    setPrescriptionInput({
      medication: '',
      dosage: '',
      frequency: '',
      duration: ''
    });
  };

  const removePrescription = (index) => {
    setNewAppointment(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const appointmentToSubmit = {
        ...newAppointment,
        appointmentDate: new Date(newAppointment.appointmentDate).toISOString().split('T')[0],
        // Format time correctly if needed
        appointmentTime: newAppointment.appointmentTime
      };
      
      const result = await appointmentService.createAppointment(appointmentToSubmit);
      
      if (result && result._id) {
        alert('Appointment created successfully!');
        setShowForm(false);
        
        // Reset form
        setNewAppointment({
          patient: user._id,
          doctor: '',
          department: '',
          appointmentDate: '',
          appointmentTime: '',
          type: 'consultation',
          status: 'scheduled',
          reason: '',
          notes: '',
          symptoms: '',
          diagnosis: '',
          treatment: '',
          prescriptions: [],
          followUpRequired: false,
          followUpDate: ''
        });
        
        // Reload appointments
        fetchAppointments();
      } else {
        throw new Error('Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert(`Failed to create appointment: ${error.message || 'Unknown error'}`);
    }
  };

  const handleView = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const handleEdit = (appointment) => {
    setEditAppointment({
      ...appointment,
      appointmentDate: appointment.appointmentDate ? new Date(appointment.appointmentDate).toISOString().split('T')[0] : '',
      followUpDate: appointment.followUpDate ? new Date(appointment.followUpDate).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditAppointment(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await appointmentService.updateAppointment(
        editAppointment._id,
        editAppointment
      );
      
      if (result) {
        alert('Appointment updated successfully!');
        setShowEditModal(false);
        fetchAppointments();
      } else {
        throw new Error('Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert(`Failed to update appointment: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    
    try {
      const result = await appointmentService.updateAppointment(
        appointmentId,
        { status: 'canceled' }
      );
      
      if (result) {
        alert('Appointment canceled successfully!');
        fetchAppointments();
      } else {
        throw new Error('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
      alert(`Failed to cancel appointment: ${error.message || 'Unknown error'}`);
    }
  };

  const applySearch = () => {
    if (!searchTerm.trim()) {
      setFilteredAppointments(appointments);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    let filtered;
    
    try {
      switch (searchType) {
        case 'doctor':
          filtered = appointments.filter(appointment => {
            const doctorName = `${appointment.doctorName || ''}`.toLowerCase();
            return doctorName.includes(term);
          });
          break;
        case 'date':
          filtered = appointments.filter(appointment => {
            return appointment.appointmentDate && appointment.appointmentDate.includes(term);
          });
          break;
        case 'status':
          filtered = appointments.filter(appointment => {
            return appointment.status && appointment.status.toLowerCase().includes(term);
          });
          break;
        default: // 'all'
          filtered = appointments.filter(appointment => {
            const doctorName = `${appointment.doctorName || ''}`.toLowerCase();
            const status = (appointment.status || '').toLowerCase();
            const date = (appointment.appointmentDate || '').toLowerCase();
            const reason = (appointment.reason || '').toLowerCase();
            
            return doctorName.includes(term) || 
                  status.includes(term) || 
                  date.includes(term) || 
                  reason.includes(term);
          });
      }
      
      setFilteredAppointments(filtered);
      
      if (filtered.length === 0) {
        setSearchError(`No appointments found matching '${searchTerm}'`);
      } else {
        setSearchError(null);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchError('Error while searching. Please try again.');
      setFilteredAppointments([]);
    }
  };

  const generateReport = () => {
    if (appointments.length === 0) {
      alert('No appointments to generate report from!');
      return;
    }
    
    try {
      let content = '';
      const timestamp = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
      let filename = `appointments_${timestamp}`;
      
      if (reportFormat === 'csv') {
        // Generate CSV
        const headers = ['Date', 'Time', 'Doctor', 'Department', 'Type', 'Status', 'Reason'];
        content = headers.join(',') + '\n';
        
        appointments.forEach(app => {
          const row = [
            app.appointmentDate || '',
            app.appointmentTime || '',
            app.doctorName || '',
            app.departmentName || '',
            app.type || '',
            app.status || '',
            app.reason || ''
          ].map(field => `"${field.replace(/"/g, '""')}"`); // Escape quotes in CSV
          
          content += row.join(',') + '\n';
        });
        
        filename += '.csv';
      } else {
        // Generate JSON
        content = JSON.stringify(appointments, null, 2);
        filename += '.json';
      }
      
      // Create a downloadable link
      const blob = new Blob([content], { type: reportFormat === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate report. Please try again.');
    }
  };

  // Render appointment list or loading state
  const renderAppointments = () => {
    if (loading) {
      return <div className="text-center py-4">Loading appointments...</div>;
    }
    
    if (error) {
      return <div className="text-red-500 text-center py-4">{error}</div>;
    }
    
    if (filteredAppointments.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          {searchError || "No appointments found. Schedule your first appointment by clicking the 'New Appointment' button."}
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-4 text-left">Date & Time</th>
              <th className="py-3 px-4 text-left">Doctor</th>
              <th className="py-3 px-4 text-left">Department</th>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAppointments.map(appointment => (
              <tr key={appointment._id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="font-medium">{appointment.appointmentDate}</div>
                  <div className="text-sm text-gray-500">{appointment.appointmentTime}</div>
                </td>
                <td className="py-3 px-4">{appointment.doctorName}</td>
                <td className="py-3 px-4">{appointment.departmentName}</td>
                <td className="py-3 px-4">
                  <span className="capitalize">{appointment.type}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full capitalize
                    ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      appointment.status === 'canceled' ? 'bg-red-100 text-red-800' : 
                      appointment.status === 'rescheduled' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'}`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button 
                    onClick={() => handleView(appointment)}
                    className="text-blue-600 hover:text-blue-800 mr-2 text-sm font-medium"
                  >
                    View
                  </button>
                  
                  {appointment.status !== 'completed' && appointment.status !== 'canceled' && (
                    <>
                      <button 
                        onClick={() => handleEdit(appointment)}
                        className="text-indigo-600 hover:text-indigo-800 mr-2 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleCancel(appointment._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render appointment form
  const renderAppointmentForm = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Schedule New Appointment</h2>
            <button 
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  name="department"
                  value={newAppointment.department}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor
                </label>
                <select
                  name="doctor"
                  value={newAppointment.doctor}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!newAppointment.department}
                >
                  <option value="">Select Doctor</option>
                  {filteredDoctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
                {newAppointment.department && filteredDoctors.length === 0 && (
                  <p className="mt-1 text-sm text-red-500">
                    No doctors available for this department
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Date
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={newAppointment.appointmentDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Time
                </label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={newAppointment.appointmentTime}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Type
                </label>
                <select
                  name="type"
                  value={newAppointment.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="regular-checkup">Regular Checkup</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit
                </label>
                <textarea
                  name="reason"
                  value={newAppointment.reason}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={newAppointment.notes}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symptoms
                </label>
                <textarea
                  name="symptoms"
                  value={newAppointment.symptoms}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Schedule Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Render view modal
  const renderViewModal = () => {
    if (!selectedAppointment) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Appointment Details</h2>
            <button 
              onClick={() => {
                setSelectedAppointment(null);
                setShowViewModal(false);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700">Doctor</h3>
                <p>{selectedAppointment.doctorName}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Department</h3>
                <p>{selectedAppointment.departmentName}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Date</h3>
                <p>{selectedAppointment.appointmentDate}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Time</h3>
                <p>{selectedAppointment.appointmentTime}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Type</h3>
                <p className="capitalize">{selectedAppointment.type}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Status</h3>
                <span className={`inline-block px-2 py-1 text-xs rounded-full capitalize
                  ${selectedAppointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    selectedAppointment.status === 'canceled' ? 'bg-red-100 text-red-800' : 
                    selectedAppointment.status === 'rescheduled' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-blue-100 text-blue-800'}`}>
                  {selectedAppointment.status}
                </span>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium text-gray-700">Reason for Visit</h3>
              <p className="mt-1">{selectedAppointment.reason || 'Not provided'}</p>
            </div>
            
            {selectedAppointment.notes && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700">Additional Notes</h3>
                <p className="mt-1">{selectedAppointment.notes}</p>
              </div>
            )}
            
            {selectedAppointment.symptoms && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700">Symptoms</h3>
                <p className="mt-1">{selectedAppointment.symptoms}</p>
              </div>
            )}
            
            {selectedAppointment.diagnosis && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700">Diagnosis</h3>
                <p className="mt-1">{selectedAppointment.diagnosis}</p>
              </div>
            )}
            
            {selectedAppointment.treatment && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700">Treatment</h3>
                <p className="mt-1">{selectedAppointment.treatment}</p>
              </div>
            )}
            
            {selectedAppointment.prescriptions && selectedAppointment.prescriptions.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700">Prescriptions</h3>
                <div className="mt-2">
                  {selectedAppointment.prescriptions.map((prescription, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md mb-2">
                      <p className="font-medium">{prescription.medication}</p>
                      <p className="text-sm text-gray-600">
                        Dosage: {prescription.dosage} | 
                        Frequency: {prescription.frequency || 'Not specified'} | 
                        Duration: {prescription.duration || 'Not specified'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedAppointment.followUpRequired && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700">Follow-up Required</h3>
                <p className="mt-1">Yes, on {selectedAppointment.followUpDate}</p>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
            <button
              onClick={() => {
                setSelectedAppointment(null);
                setShowViewModal(false);
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render edit modal
  const renderEditModal = () => {
    if (!editAppointment) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Edit Appointment</h2>
            <button 
              onClick={() => {
                setEditAppointment(null);
                setShowEditModal(false);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleEditSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Date
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={editAppointment.appointmentDate}
                  onChange={handleEditChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Time
                </label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={editAppointment.appointmentTime}
                  onChange={handleEditChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Type
                </label>
                <select
                  name="type"
                  value={editAppointment.type}
                  onChange={handleEditChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="regular-checkup">Regular Checkup</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit
                </label>
                <textarea
                  name="reason"
                  value={editAppointment.reason}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={editAppointment.notes}
                  onChange={handleEditChange}
                  rows="2"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symptoms
                </label>
                <textarea
                  name="symptoms"
                  value={editAppointment.symptoms}
                  onChange={handleEditChange}
                  rows="2"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Update Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          My Appointments
        </h2>
        <div className="flex space-x-2">
          <div className="relative">
            <select
              value={reportFormat}
              onChange={(e) => setReportFormat(e.target.value)}
              className="mr-2 p-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
            <button
              onClick={generateReport}
              className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm flex items-center"
            >
              <FileText size={16} className="mr-1" />
              Export
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center"
          >
            <Plus size={16} className="mr-1" />
            New Appointment
          </button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 md:w-40"
        >
          <option value="all">All Fields</option>
          <option value="doctor">Doctor</option>
          <option value="date">Date</option>
          <option value="status">Status</option>
        </select>
      </div>
      
      {/* Appointment List */}
      {renderAppointments()}
      
      {/* New Appointment Form Modal */}
      {showForm && renderAppointmentForm()}
      
      {/* View Appointment Modal */}
      {showViewModal && renderViewModal()}
      
      {/* Edit Appointment Modal */}
      {showEditModal && renderEditModal()}
    </div>
  );
};

export default AppointmentsTab;