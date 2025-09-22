import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X } from 'lucide-react';
import { appointmentService } from '../../utils/api';

const AppointmentsTab = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
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

  useEffect(() => {
    if (user && user._id) {
      console.log('User loaded:', user);
      fetchAppointments();
      setNewAppointment(prev => ({ ...prev, patient: user._id }));
    }
  }, [user]);

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
      console.log('Submitting appointment data:', newAppointment);
      const response = await appointmentService.create(newAppointment);
      console.log('API response:', response);
      
      // Add the new appointment to the list
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
      alert(`Failed to book appointment: ${err.message || 'Unknown error'}`);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        console.log(`Attempting to cancel appointment with ID: ${id}`, {
          idType: typeof id,
          idLength: id ? id.length : 'N/A'
        });
        
        if (!id || typeof id !== 'string') {
          throw new Error('Invalid appointment ID');
        }
        
        // For debugging only - get the appointment details first
        try {
          const appointmentDetails = await appointmentService.getById(id);
          console.log('Found appointment to cancel:', appointmentDetails);
        } catch (lookupError) {
          console.warn('Could not find appointment details before deletion:', lookupError);
          // Continue with deletion attempt even if lookup fails
        }
        
        // Proceed with deletion
        await appointmentService.delete(id);
        console.log('Appointment cancelled successfully');
        
        // Update the UI by removing the cancelled appointment
        setAppointments(prevAppointments => 
          prevAppointments.filter(a => a._id !== id)
        );
        
        // Show success message
        alert('Appointment cancelled successfully');
      } catch (err) {
        console.error('Error cancelling appointment:', err);
        
        // Show a more detailed error message
        const errorMessage = err.message || 'An unknown error occurred';
        alert(`Failed to cancel appointment: ${errorMessage}`);
      }
    }
  };

  if (loading) return <div className="py-8 text-center">Loading appointments...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" /> Book Appointment
        </button>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {!Array.isArray(appointments) || appointments.length === 0 ? (
          <p className="text-center text-slate-500">No upcoming appointments</p>
        ) : (
          appointments.map(a => (
            <div key={a._id} className="bg-slate-50 p-4 rounded border">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">
                    {a.doctor ? `${a.doctor.firstName || ''} ${a.doctor.lastName || ''}` : 'No doctor assigned'}
                  </h4>
                  <p>{a.department?.name || 'No department'} • {a.type || 'N/A'}</p>
                  <p>{new Date(a.appointmentDate || Date.now()).toLocaleDateString()} at {a.appointmentTime || 'N/A'}</p>
                  <p>Reason: {a.reason || 'No reason specified'}</p>
                </div>
                <button
                  onClick={() => {
                    console.log('Cancel button clicked for appointment:', {
                      id: a._id,
                      type: typeof a._id
                    });
                    handleCancel(a._id);
                  }}
                  title={`Cancel appointment ID: ${a._id}`}
                  className="text-red-600 hover:text-red-700 px-3 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Appointment Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">New Appointment</h2>
              <button onClick={() => setShowForm(false)}><X className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Doctor & Department */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Select Doctor</label>
                  <select
                    name="doctor"
                    value={newAppointment.doctor}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select a Doctor (Optional)</option>
                    <option value="64f5d3770166f2b8c05e4b16">Dr. John Smith - Cardiology</option>
                    <option value="64f5d3770166f2b8c05e4b17">Dr. Sarah Johnson - Neurology</option>
                    <option value="64f5d3770166f2b8c05e4b18">Dr. Michael Brown - Pediatrics</option>
                    <option value="64f5d3770166f2b8c05e4b19">Dr. Emily Davis - Dermatology</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    You can proceed without selecting a doctor and one will be assigned later
                  </p>
                </div>
                <div>
                  <label className="block font-medium mb-1">Select Department *</label>
                  <select
                    name="department"
                    value={newAppointment.department}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select a Department</option>
                    <option value="64f5d3770166f2b8c05e4c01">Cardiology</option>
                    <option value="64f5d3770166f2b8c05e4c02">Neurology</option>
                    <option value="64f5d3770166f2b8c05e4c03">Pediatrics</option>
                    <option value="64f5d3770166f2b8c05e4c04">Dermatology</option>
                    <option value="64f5d3770166f2b8c05e4c05">Orthopedics</option>
                    <option value="64f5d3770166f2b8c05e4c06">ENT</option>
                  </select>
                </div>
              </div>

              {/* Appointment Date & Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={newAppointment.appointmentDate}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Time *</label>
                  <input
                    type="time"
                    name="appointmentTime"
                    value={newAppointment.appointmentTime}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>

              {/* Type & Reason */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Type</label>
                  <select
                    name="type"
                    value={newAppointment.type}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="emergency">Emergency</option>
                    <option value="routine">Routine</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Reason *</label>
                  <textarea
                    name="reason"
                    value={newAppointment.reason}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded p-2"
                    rows="2"
                  />
                </div>
              </div>

              {/* Optional Medical Fields */}
              <div>
                <label className="block font-medium mb-1">Symptoms</label>
                <textarea
                  name="symptoms"
                  value={newAppointment.symptoms}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  rows="2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Diagnosis</label>
                <textarea
                  name="diagnosis"
                  value={newAppointment.diagnosis}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  rows="2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Treatment</label>
                <textarea
                  name="treatment"
                  value={newAppointment.treatment}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  rows="2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={newAppointment.notes}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  rows="2"
                />
              </div>

              {/* Prescriptions */}
              <div className="space-y-2">
                <h3 className="font-semibold">Prescriptions</h3>
                {newAppointment.prescriptions.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded">
                    <div>{p.medication} - {p.dosage} ({p.frequency}) for {p.duration}</div>
                    <button type="button" onClick={() => removePrescription(idx)} className="text-red-600">
                      <X className="h-4 w-4"/>
                    </button>
                  </div>
                ))}
                <div className="grid md:grid-cols-4 gap-2">
                  <input type="text" name="medication" placeholder="Medication" value={prescriptionInput.medication} onChange={handlePrescriptionChange} className="border rounded p-2"/>
                  <input type="text" name="dosage" placeholder="Dosage" value={prescriptionInput.dosage} onChange={handlePrescriptionChange} className="border rounded p-2"/>
                  <input type="text" name="frequency" placeholder="Frequency" value={prescriptionInput.frequency} onChange={handlePrescriptionChange} className="border rounded p-2"/>
                  <input type="text" name="duration" placeholder="Duration" value={prescriptionInput.duration} onChange={handlePrescriptionChange} className="border rounded p-2"/>
                </div>
                <button type="button" onClick={addPrescription} className="bg-slate-200 px-3 py-1 rounded mt-2">Add Prescription</button>
              </div>

              {/* Follow-up */}
              <div className="flex items-center space-x-2 mt-4">
                <input type="checkbox" name="followUpRequired" checked={newAppointment.followUpRequired} onChange={handleInputChange} />
                <label>Follow-up Required</label>
              </div>
              {newAppointment.followUpRequired && (
                <input type="date" name="followUpDate" value={newAppointment.followUpDate} onChange={handleInputChange} className="border rounded p-2 mt-2"/>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsTab;
