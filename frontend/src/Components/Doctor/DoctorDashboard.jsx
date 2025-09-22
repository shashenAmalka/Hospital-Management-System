import React, { useState } from 'react';
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
} from 'lucide-react';
import LeaveForm from './LeaveForm';

export function DoctorDashboard() {
  const [isLeaveFormOpen, setIsLeaveFormOpen] = useState(false);

  // Mock user data
  const doctorName = localStorage.getItem('user_name') || 'Dr. John Smith';
  const currentStatus = "On-duty"; // This would be determined from the roster system

  // Mock data for dashboard
  const todaysAppointments = [
    { id: 1, time: "09:00 AM", patient: "Emma Wilson", type: "Follow-up", room: "Room 203" },
    { id: 2, time: "10:30 AM", patient: "James Brown", type: "Consultation", room: "Room 205" },
    { id: 3, time: "11:45 AM", patient: "Olivia Martinez", type: "Pre-op Assessment", room: "Room 203" },
    { id: 4, time: "02:15 PM", patient: "William Johnson", type: "Results Review", room: "Room 204" },
  ];

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
            <button className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-800">
              View All <ArrowRightIcon size={16} className="ml-1" />
            </button>
          </div>
          <div className="p-4">
            {todaysAppointments.map(appointment => (
              <div key={appointment.id} className="mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="bg-blue-100 text-blue-800 font-medium px-2.5 py-1 rounded text-sm mr-3">
                      {appointment.time}
                    </div>
                    <div>
                      <p className="font-medium">{appointment.patient}</p>
                      <p className="text-sm text-gray-500">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="text-sm text-right">
                    <p className="text-gray-500">{appointment.room}</p>
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full mt-2 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors">
              Go to My Appointments
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