import React, { useState, useEffect, useCallback } from 'react';
import {
  Users2Icon,
  CalendarIcon,
  ClipboardListIcon,
  AlertCircleIcon,
  FileTextIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  FlaskConicalIcon,
  User,
  Calendar,
  Phone,
  MapPin
} from 'lucide-react';
import LeaveForm from './LeaveForm';
import { appointmentService } from '../../utils/api';

export function DoctorDashboard() {
  const [isLeaveFormOpen, setIsLeaveFormOpen] = useState(false);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock user data
  const doctorName = localStorage.getItem('user_name') || 'Dr. John Smith';
  const currentStatus = "On-duty"; // This would be determined from the roster system
  const doctorId = localStorage.getItem('user_id') || '1'; // Get from localStorage

  const fetchTodaysAppointments = useCallback(async () => {
    if (!doctorId) {
      console.error('No doctor ID found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching appointments for doctor:', doctorId);
      
      // Fetch real appointments from the backend
      const response = await appointmentService.getByDoctorId(doctorId);
      
      if (response && response.data) {
        // Filter for today's appointments
        const today = new Date().toISOString().split('T')[0];
        const todaysAppointments = response.data.filter(appointment => {
          const appointmentDate = new Date(appointment.appointmentDate).toISOString().split('T')[0];
          return appointmentDate === today;
        });
        
        setTodaysAppointments(todaysAppointments);
      } else {
        // Fallback to mock data if no appointments found
        const mockAppointments = [
          { 
            _id: 1, 
            appointmentTime: "09:00", 
            patient: { firstName: "Emma", lastName: "Wilson", phone: "+1234567890" }, 
            type: "Follow-up", 
            status: "scheduled",
            reason: "Regular check-up",
            appointmentDate: new Date().toISOString().split('T')[0]
          },
          { 
            _id: 2, 
            appointmentTime: "11:30", 
            patient: { firstName: "Michael", lastName: "Johnson", phone: "+1234567891" }, 
            type: "Consultation", 
            status: "confirmed",
            reason: "Chest pain evaluation",
            appointmentDate: new Date().toISOString().split('T')[0]
          }
        ];
        setTodaysAppointments(mockAppointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Use mock data as fallback
      const today = new Date().toISOString().split('T')[0];
      const mockAppointments = [
        { 
          _id: 1, 
          appointmentTime: "09:00", 
          patient: { name: "Emma Wilson", phone: "+1234567890" }, 
          type: "Follow-up", 
          status: "scheduled",
          reason: "Regular check-up",
          appointmentDate: today
        },
        { 
          _id: 2, 
          appointmentTime: "10:30", 
          patient: { name: "James Brown", phone: "+1234567891" }, 
          type: "Consultation", 
          status: "scheduled",
          reason: "Heart palpitations",
          appointmentDate: today
        },
        { 
          _id: 3, 
          appointmentTime: "11:45", 
          patient: { name: "Olivia Martinez", phone: "+1234567892" }, 
          type: "Pre-op Assessment", 
          status: "confirmed",
          reason: "Surgery preparation",
          appointmentDate: today
        },
        { 
          _id: 4, 
          appointmentTime: "14:15", 
          patient: { name: "William Johnson", phone: "+1234567893" }, 
          type: "Results Review", 
          status: "scheduled",
          reason: "Lab results discussion",
          appointmentDate: today
        }
      ];
      
      setTodaysAppointments(mockAppointments);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchTodaysAppointments();
  }, [fetchTodaysAppointments]);

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      setTodaysAppointments(prev => 
        prev.map(appointment => 
          appointment._id === appointmentId 
            ? { ...appointment, status: newStatus }
            : appointment
        )
      );
      
      // Here you would make an API call to update the status
      // await appointmentService.updateStatus(appointmentId, newStatus);
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const assignedPatients = [
    { id: 101, name: "Sophia Lee", room: "Ward A, Room 12", status: "Stable", lastChecked: "Today, 8:30 AM" },
    { id: 102, name: "Benjamin Taylor", room: "Ward B, Room 5", status: "Critical", lastChecked: "Today, 9:15 AM" },
    { id: 103, name: "Isabella Garcia", room: "Ward A, Room 7", status: "Improving", lastChecked: "Today, 7:45 AM" },
  ];

  const pendingResults = [
    { id: 201, patient: "Lucas Rodriguez", test: "Complete Blood Count", ordered: "Yesterday", status: "Ready for Review", priority: "Normal" },
    { id: 202, patient: "Sophia Lee", test: "Chest X-Ray", ordered: "Yesterday", status: "Ready for Review", priority: "Urgent" },
    { id: 203, patient: "Emma Wilson", test: "Lipid Panel", ordered: "2 days ago", status: "Ready for Review", priority: "Normal" },
  ];

  const upcomingShifts = [
    { date: "Tomorrow", time: "8:00 AM - 5:00 PM", department: "Cardiology OPD" },
    { date: "May 25, 2023", time: "8:00 AM - 5:00 PM", department: "Cardiology OPD" },
    { date: "May 26, 2023", time: "8:00 AM - 12:00 PM", department: "Cardiac Cath Lab" },
  ];

  // Handle leave form submission
  const handleLeaveSubmit = async (submitData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/leave/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        await response.json();
        alert('Leave request submitted successfully!');
        setIsLeaveFormOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('An error occurred while submitting the leave request');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {doctorName}</h1>
          <p className="text-gray-500">Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatus === "On-duty" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
            {currentStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="bg-blue-500 p-3 rounded-full mr-4 text-white">
            <CalendarIcon size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Today's Appointments</p>
            <p className="text-2xl font-bold">{todaysAppointments.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="bg-teal-500 p-3 rounded-full mr-4 text-white">
            <Users2Icon size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Assigned Patients</p>
            <p className="text-2xl font-bold">{assignedPatients.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className={`${pendingResults.some(r => r.priority === "Urgent") ? "bg-red-500" : "bg-yellow-500"} p-3 rounded-full mr-4 text-white`}>
            <AlertCircleIcon size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Pending Results</p>
            <p className="text-2xl font-bold">{pendingResults.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center">
              <CalendarIcon size={18} className="mr-2 text-blue-700" />
              Today's Appointments
            </h2>
            <button 
              onClick={fetchTodaysAppointments}
              className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-800"
            >
              Refresh <ArrowRightIcon size={16} className="ml-1" />
            </button>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading appointments...</div>
            ) : todaysAppointments.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No appointments for today</div>
            ) : (
              todaysAppointments.map(appointment => (
                <div key={appointment._id} className="mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                  <div className="space-y-3">
                    {/* Header with time and status */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-lg text-sm">
                          {appointment.appointmentTime}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </div>
                      </div>
                    </div>
                    
                    {/* Patient info */}
                    <div className="flex items-start space-x-3">
                      <div className="bg-gray-100 rounded-full p-2">
                        <User size={16} className="text-gray-600" />
                      </div>
                      <div className="flex-1">

                        <h4 className="font-medium text-gray-900">{appointment.patient.name}</h4>

                        <h4 className="font-medium text-gray-900">
                          {appointment.patient.firstName && appointment.patient.lastName 
                            ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                            : appointment.patient.name || 'Patient Name Unavailable'
                          }
                        </h4>

                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Phone size={12} className="mr-1" />
                          {appointment.patient.phone}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Type:</span> {appointment.type}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Reason:</span> {appointment.reason}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex space-x-2 pt-2">
                      {appointment.status === 'scheduled' && (
                        <button
                          onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                        <button
                          onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            <button className="w-full mt-2 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors">
              View All Appointments
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center">
              <Users2Icon size={18} className="mr-2 text-blue-700" />
              Assigned Patients
            </h2>
            <button className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-800">
              View All <ArrowRightIcon size={16} className="ml-1" />
            </button>
          </div>
          <div className="p-4">
            {assignedPatients.map(patient => (
              <div key={patient.id} className="mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-gray-500">{patient.room}</p>
                  </div>
                  <div className="text-sm text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      patient.status === "Stable" ? "bg-green-100 text-green-800" : 
                      patient.status === "Critical" ? "bg-red-100 text-red-800" : 
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {patient.status}
                    </span>
                    <p className="text-gray-500 mt-1">{patient.lastChecked}</p>
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full mt-2 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors">
              View Patient List
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold flex items-center">
              <FlaskConicalIcon size={18} className="mr-2 text-blue-700" />
              Pending Lab Results
            </h2>
          </div>
          <div className="p-4">
            {pendingResults.map(result => (
              <div key={result.id} className="mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{result.patient}</p>
                    <p className="text-sm text-gray-500">{result.test}</p>
                    <p className="text-xs text-gray-500">Ordered: {result.ordered}</p>
                  </div>
                  <div className="text-sm text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      result.priority === "Urgent" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {result.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full mt-2 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors">
              Review All Results
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold flex items-center">
              <ClockIcon size={18} className="mr-2 text-blue-700" />
              Upcoming Shifts
            </h2>
          </div>
          <div className="p-4">
            {upcomingShifts.map((shift, index) => (
              <div key={index} className="mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{shift.date}</p>
                    <p className="text-sm text-gray-500">{shift.department}</p>
                  </div>
                  <div className="text-sm text-right">
                    <p className="text-blue-600">{shift.time}</p>
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full mt-2 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors">
              View My Roster
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center">
            <FileTextIcon size={18} className="mr-2 text-blue-700" />
            Quick Actions
          </h2>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-50 rounded-lg text-blue-700 font-medium hover:bg-blue-100 transition-colors flex flex-col items-center">
            <CalendarIcon size={24} className="mb-2" />
            My Appointments
          </button>
          <button className="p-4 bg-blue-50 rounded-lg text-blue-700 font-medium hover:bg-blue-100 transition-colors flex flex-col items-center">
            <ClipboardListIcon size={24} className="mb-2" />
            Add Patient Notes
          </button>
          <button 
            onClick={() => setIsLeaveFormOpen(true)}
            className="p-4 bg-blue-50 rounded-lg text-blue-700 font-medium hover:bg-blue-100 transition-colors flex flex-col items-center"
          >
            <FileTextIcon size={24} className="mb-2" />
            Apply for Leave
          </button>
        </div>
      </div>

      {/* Leave Form Modal */}
      <LeaveForm
        isOpen={isLeaveFormOpen}
        onClose={() => setIsLeaveFormOpen(false)}
        onSubmit={handleLeaveSubmit}
      />
    </div>
  );
}

export default DoctorDashboard;