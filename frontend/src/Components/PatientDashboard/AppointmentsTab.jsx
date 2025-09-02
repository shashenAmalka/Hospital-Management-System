import React, { useState, useEffect } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { appointmentService } from '../../utils/api';

const AppointmentsTab = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user._id) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAll();
      
      // Filter appointments for this patient if needed
      const patientAppointments = response.data.filter(
        appointment => appointment.patientId === user._id
      );
      
      setAppointments(patientAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (appointmentId) => {
    // Implement reschedule functionality
    alert('Reschedule functionality would be implemented here');
  };

  const handleCancel = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentService.delete(appointmentId);
        setAppointments(appointments.filter(a => a._id !== appointmentId));
      } catch (error) {
        console.error('Error canceling appointment:', error);
        alert('Failed to cancel appointment. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading appointments...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p>{error}</p>
        <button 
          onClick={fetchAppointments} 
          className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Upcoming Appointments</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No upcoming appointments
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment._id} className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{appointment.doctorName}</h4>
                    <p className="text-slate-600">{appointment.department} • {appointment.type}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">Reason: {appointment.reason}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleReschedule(appointment._id)}
                    className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    Reschedule
                  </button>
                  <button 
                    onClick={() => handleCancel(appointment._id)}
                    className="text-red-600 hover:text-red-700 px-3 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AppointmentsTab;