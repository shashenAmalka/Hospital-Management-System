import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X } from 'lucide-react';
import { appointmentService } from '../../utils/api';

const AppointmentsTab = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
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

  useEffect(() => {
    if (user && user._id) {
      console.log('User loaded:', user);
      fetchAppointments();
      fetchDepartments();
      fetchDoctors();
      setNewAppointment(prev => ({ ...prev, patient: user._id }));
    }
  }, [user]);

  // Update the department filtering logic
  useEffect(() => {
    if (newAppointment.department) {
      console.log('Department selected:', newAppointment.department);
      console.log('Doctors data type:', typeof doctors, Array.isArray(doctors) ? 'is array' : 'not array');
      console.log('Doctors count:', Array.isArray(doctors) ? doctors.length : 'N/A');
      
      // Ensure doctors is an array before filtering
      if (Array.isArray(doctors)) {
        // Get the selected department ID or name
        const selectedDeptId = newAppointment.department;
        console.log('Selected department ID:', selectedDeptId);
        
        const relevantDoctors = doctors.filter(doctor => {
          if (!doctor) return false;
          
          // Debug each doctor's department
          console.log('Doctor:', doctor.firstName, doctor.lastName, '- Department:', doctor.department);
          
          // Check if department exists
          if (!doctor.department) return false;
          
          // Handle different ways the doctor's department might be stored
          if (typeof doctor.department === 'string') {
            // If using sample data with string department names
            // Try to find a matching department in our departments list
            const matchingDept = departments.find(dept => 
              dept.name && dept.name.toLowerCase() === doctor.department.toLowerCase());
            return matchingDept && matchingDept._id === selectedDeptId;
          } else if (typeof doctor.department === 'object') {
            if (doctor.department._id) {
              // Department is an object with ID (from populated query)
              return doctor.department._id === selectedDeptId;
            } else if (doctor.department.name) {
              // Department is an object with name but no ID
              const matchingDept = departments.find(dept => 
                dept.name && dept.name.toLowerCase() === doctor.department.name.toLowerCase());
              return matchingDept && matchingDept._id === selectedDeptId;
            }
          }
          
          // Direct comparison if department is stored as ID string
          return doctor.department === selectedDeptId;
        });
        
        console.log('Filtered doctors count:', relevantDoctors.length);
        if (relevantDoctors.length === 0) {
          console.log('No doctors matched the selected department');
        } else {
          console.log('Matching doctors:', relevantDoctors.map(d => `${d.firstName} ${d.lastName}`));
        }
        
        setFilteredDoctors(relevantDoctors);
      } else {
        console.error('Doctors data is not an array:', doctors);
        setFilteredDoctors([]);
      }
      
      // Reset doctor selection when department changes
      setNewAppointment(prev => ({
        ...prev,
        doctor: ''
      }));
    } else {
      setFilteredDoctors([]);
    }
  }, [newAppointment.department, doctors, departments]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAll();
      console.log('All appointments from API:', response);
      
      // Filter appointments for this patient with safer object traversal
      const patientAppointments = response.data.filter(appointment => {
        // Check if patient exists and has an _id that matches user._id
        const patientMatch = appointment.patient && 
              ((typeof appointment.patient === 'object' && appointment.patient._id === user._id) || 
               (typeof appointment.patient === 'string' && appointment.patient === user._id));
        
        if (patientMatch) {
          // Log each matching appointment to debug ID format
          console.log('Patient appointment found:', {
            id: appointment._id,
            type: typeof appointment._id,
            doctor: appointment.doctor,
            date: appointment.appointmentDate
          });
        }
        
        return patientMatch;
      });
      
      console.log('Filtered appointments for current patient:', patientAppointments);
      
      setAppointments(patientAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/departments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.data?.departments || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching doctors...');
      const response = await fetch('http://localhost:5000/api/staff?role=doctor', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Doctors API response status:', response.status);
        
        // Extract the doctors array more carefully
        let doctorsArray = [];
        
        if (data && data.data && Array.isArray(data.data)) {
          doctorsArray = data.data;
          console.log('Doctors found in data.data array, count:', doctorsArray.length);
        } else if (Array.isArray(data)) {
          doctorsArray = data;
          console.log('Doctors found directly in data array, count:', doctorsArray.length);
        } else if (data && data.data) {
          console.log('Unexpected data structure:', data.data);
          
          // Try to extract from nested object if it exists
          if (typeof data.data === 'object') {
            const possibleArrays = Object.values(data.data).filter(Array.isArray);
            if (possibleArrays.length > 0) {
              doctorsArray = possibleArrays[0];
              console.log('Doctors found in nested data structure, count:', doctorsArray.length);
            }
          }
        }
        
        if (doctorsArray.length === 0) {
          // Create sample data for development purposes
          // Update sample data to include department IDs matching the loaded departments
          console.warn('No doctors found in API response, using sample data');
          
          // Get actual department IDs from fetched departments if available
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
              // Use actual department ID if available, otherwise string
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
        
        // Log each doctor's department for debugging
        doctorsArray.forEach(doctor => {
          console.log(`Doctor: ${doctor.firstName} ${doctor.lastName}, Department: ${doctor.department}`);
        });
        
        setDoctors(doctorsArray);
      } else {
        console.error('Error fetching doctors, status:', response.status);
        setDoctors([]);
      }
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
    setPrescriptionInput(prev => ({ ...prev, [name]: value }));
  };

  const addPrescription = () => {
    if (prescriptionInput.medication && prescriptionInput.dosage) {
      setNewAppointment(prev => ({
        ...prev,
        prescriptions: [...prev.prescriptions, prescriptionInput]
      }));
      setPrescriptionInput({ medication: '', dosage: '', frequency: '', duration: '' });
    }
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
      // Validate required fields
      if (!newAppointment.doctor || !newAppointment.department || 
          !newAppointment.appointmentDate || !newAppointment.appointmentTime || 
          !newAppointment.reason) {
        alert('Please fill all required fields');
        return;
      }

      // Create a properly formatted appointment object matching the MongoDB schema
      const appointmentToSubmit = {
        patient: user._id,
        doctor: newAppointment.doctor,
        department: newAppointment.department, // Now using department ID
        appointmentDate: new Date(newAppointment.appointmentDate).toISOString(), // Format date properly
        appointmentTime: newAppointment.appointmentTime,
        type: newAppointment.type,
        status: 'scheduled',
        reason: newAppointment.reason
      };

      // Only add optional fields if they have values
      if (newAppointment.symptoms) {
        appointmentToSubmit.symptoms = newAppointment.symptoms;
      }
      
      console.log('Submitting appointment data:', appointmentToSubmit);
      
      const response = await appointmentService.create(appointmentToSubmit);
      console.log('API response:', response);
      
      // Add the new appointment to the list and reset form
      if (response && response.data) {
        setAppointments([...appointments, response.data]);
        setShowForm(false);
        
        // Reset the form
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
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error creating appointment:', err);
      
      // More detailed error message
      let errorMessage = err.message || 'Unknown error';
      if (errorMessage.includes('500')) {
        errorMessage = 'Server error: Please check if all fields are properly filled.';
      }
      
      alert(`Failed to book appointment: ${errorMessage}`);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentService.delete(id);
        // Update the local state after successful deletion
        setAppointments(appointments.filter(appointment => appointment._id !== id));
      } catch (err) {
        console.error('Error cancelling appointment:', err);
        alert(`Failed to cancel appointment: ${err.message || 'Unknown error'}`);
      }
    }
  };

  // View appointment details
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  // Edit appointment
  const handleEdit = (appointment) => {
    // Clone the appointment to avoid mutating the original
    const appointmentToEdit = { ...appointment };
    
    // Format date for the input field (YYYY-MM-DD)
    if (appointmentToEdit.appointmentDate) {
      const date = new Date(appointmentToEdit.appointmentDate);
      const formattedDate = date.toISOString().split('T')[0];
      appointmentToEdit.appointmentDate = formattedDate;
    }
    
    setEditAppointment(appointmentToEdit);
    setShowEditModal(true);
  };

  // Update appointment
  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!editAppointment.doctor || !editAppointment.department || 
          !editAppointment.appointmentDate || !editAppointment.appointmentTime || 
          !editAppointment.reason) {
        alert('Please fill all required fields');
        return;
      }

      // Format appointment data for update
      const appointmentToUpdate = {
        ...editAppointment,
        appointmentDate: new Date(editAppointment.appointmentDate).toISOString()
      };
      
      // Remove any nested patient/doctor/department objects that might have been populated
      if (typeof appointmentToUpdate.patient === 'object' && appointmentToUpdate.patient !== null) {
        appointmentToUpdate.patient = appointmentToUpdate.patient._id || user._id;
      }
      
      if (typeof appointmentToUpdate.doctor === 'object' && appointmentToUpdate.doctor !== null) {
        appointmentToUpdate.doctor = appointmentToUpdate.doctor._id;
      }
      
      if (typeof appointmentToUpdate.department === 'object' && appointmentToUpdate.department !== null) {
        appointmentToUpdate.department = appointmentToUpdate.department._id;
      }
      
      console.log('Updating appointment:', appointmentToUpdate);
      
      const response = await appointmentService.update(appointmentToUpdate._id, appointmentToUpdate);
      console.log('Update response:', response);
      
      if (response && response.data) {
        // Update the appointments list with the updated appointment
        setAppointments(appointments.map(appt => 
          appt._id === response.data._id ? response.data : appt
        ));
        
        // Close the edit modal
        setShowEditModal(false);
        setEditAppointment(null);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert(`Failed to update appointment: ${err.message || 'Unknown error'}`);
    }
  };

  const handleInputChangeForEdit = (e) => {
    const { name, value, type, checked } = e.target;
    setEditAppointment(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) return <div className="p-4 text-center">Loading appointments...</div>;
  
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">My Appointments</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Book Appointment
        </button>
      </div>

      {/* Appointment List */}
      {appointments.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">You don't have any appointments yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Book Your First Appointment
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Calendar className="mr-3 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-lg">
                      {appointment.type || 'Consultation'}
                    </h3>
                    <p className="text-gray-500">
                      {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}{' '}
                      at {appointment.appointmentTime}
                    </p>
                  </div>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'scheduled'
                        ? 'bg-yellow-100 text-yellow-800'
                        : appointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : appointment.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-sm">
                  <span className="font-medium">Doctor:</span>{' '}
                  {typeof appointment.doctor === 'object' 
                    ? `Dr. ${appointment.doctor.firstName || ''} ${appointment.doctor.lastName || ''}` 
                    : 'Assigned Doctor'}
                </p>
                
                {appointment.department && (
                  <p className="text-sm mt-1">
                    <span className="font-medium">Department:</span>{' '}
                    {typeof appointment.department === 'object'
                      ? appointment.department.name
                      : appointment.department}
                  </p>
                )}
                
                {appointment.reason && (
                  <p className="text-sm mt-1">
                    <span className="font-medium">Reason:</span> {appointment.reason}
                  </p>
                )}
              </div>

              {/* Add action buttons */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-3">
                <button
                  onClick={() => handleViewDetails(appointment)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </button>
                
                {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                  <>
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleCancel(appointment._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Cancel Appointment
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Appointment Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Book an Appointment</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Department Selection */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Department
                </label>
                <select
                  name="department"
                  value={newAppointment.department}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
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

              {/* Doctor Selection - now depends on department */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Doctor
                </label>
                <select
                  name="doctor"
                  value={newAppointment.doctor}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!newAppointment.department || !Array.isArray(filteredDoctors) || filteredDoctors.length === 0}
                >
                  <option value="">Select Doctor</option>
                  {Array.isArray(filteredDoctors) && filteredDoctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
                {!newAppointment.department && (
                  <p className="text-sm text-gray-500 mt-1">Please select a department first</p>
                )}
                {newAppointment.department && (!Array.isArray(filteredDoctors) || filteredDoctors.length === 0) && (
                  <p className="text-sm text-gray-500 mt-1">No doctors available for this department</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={newAppointment.appointmentDate}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Time
                </label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={newAppointment.appointmentTime}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Appointment Type */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Appointment Type
                </label>
                <select
                  name="type"
                  value={newAppointment.type}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="routine-checkup">Routine Checkup</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Reason for Visit
                </label>
                <textarea
                  name="reason"
                  value={newAppointment.reason}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  required
                ></textarea>
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Symptoms (Optional)
                </label>
                <textarea
                  name="symptoms"
                  value={newAppointment.symptoms}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Appointment Modal */}
      {showViewModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Appointment Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Calendar className="text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold">
                    {selectedAppointment.type || 'Consultation'}
                  </h3>
                </div>
                
                <p className="text-gray-600">
                  {new Date(selectedAppointment.appointmentDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}{' '}
                  at {selectedAppointment.appointmentTime}
                </p>
                
                <div className="mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedAppointment.status === 'scheduled'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedAppointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : selectedAppointment.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedAppointment.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedAppointment.status}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium mb-2">Appointment Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Doctor</p>
                    <p className="font-medium">
                      {typeof selectedAppointment.doctor === 'object' 
                        ? `Dr. ${selectedAppointment.doctor.firstName || ''} ${selectedAppointment.doctor.lastName || ''}` 
                        : 'Assigned Doctor'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">
                      {typeof selectedAppointment.department === 'object'
                        ? selectedAppointment.department.name
                        : selectedAppointment.department}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Reason for Visit</p>
                  <p className="font-medium">{selectedAppointment.reason}</p>
                </div>
                
                {selectedAppointment.symptoms && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Symptoms</p>
                    <p className="font-medium">{selectedAppointment.symptoms}</p>
                  </div>
                )}
                
                {selectedAppointment.diagnosis && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Diagnosis</p>
                    <p className="font-medium">{selectedAppointment.diagnosis}</p>
                  </div>
                )}
                
                {selectedAppointment.treatment && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Treatment</p>
                    <p className="font-medium">{selectedAppointment.treatment}</p>
                  </div>
                )}
                
                {selectedAppointment.prescriptions && selectedAppointment.prescriptions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Prescriptions</p>
                    {selectedAppointment.prescriptions.map((prescription, index) => (
                      <div key={index} className="bg-blue-50 p-3 rounded-lg mb-2">
                        <p className="font-medium">{prescription.medication}</p>
                        <p className="text-sm">Dosage: {prescription.dosage}</p>
                        {prescription.frequency && <p className="text-sm">Frequency: {prescription.frequency}</p>}
                        {prescription.duration && <p className="text-sm">Duration: {prescription.duration}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                
                {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                  <>
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleEdit(selectedAppointment);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Edit Appointment
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleCancel(selectedAppointment._id);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Cancel Appointment
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Appointment Modal */}
      {showEditModal && editAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Edit Appointment</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateAppointment} className="space-y-6">
              {/* Department Selection */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Department
                </label>
                <select
                  name="department"
                  value={editAppointment.department && typeof editAppointment.department === 'object' 
                    ? editAppointment.department._id 
                    : editAppointment.department}
                  onChange={handleInputChangeForEdit}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
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

              {/* Doctor Selection */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Doctor
                </label>
                <select
                  name="doctor"
                  value={editAppointment.doctor && typeof editAppointment.doctor === 'object' 
                    ? editAppointment.doctor._id 
                    : editAppointment.doctor}
                  onChange={handleInputChangeForEdit}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Doctor</option>
                  {Array.isArray(doctors) && doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={editAppointment.appointmentDate}
                  onChange={handleInputChangeForEdit}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Time
                </label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={editAppointment.appointmentTime}
                  onChange={handleInputChangeForEdit}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Appointment Type */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Appointment Type
                </label>
                <select
                  name="type"
                  value={editAppointment.type}
                  onChange={handleInputChangeForEdit}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="routine-checkup">Routine Checkup</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Reason for Visit
                </label>
                <textarea
                  name="reason"
                  value={editAppointment.reason}
                  onChange={handleInputChangeForEdit}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  required
                ></textarea>
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Symptoms (Optional)
                </label>
                <textarea
                  name="symptoms"
                  value={editAppointment.symptoms || ''}
                  onChange={handleInputChangeForEdit}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsTab;
