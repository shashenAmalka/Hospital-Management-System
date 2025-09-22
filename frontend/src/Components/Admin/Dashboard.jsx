import React from 'react';
import { 
  Users2Icon, CalendarIcon, ClipboardListIcon, BarChart3Icon, 
  ActivityIcon, BedIcon, ClockIcon, UserPlusIcon 
} from 'lucide-react';

export function Dashboard() {
  const stats = [
    {
      label: 'Total Patients',
      value: '2,453',
      icon: <Users2Icon size={20} />,
      gradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50'
    },
    {
      label: 'Appointments Today',
      value: '48',
      icon: <CalendarIcon size={20} />,
      gradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-50'
    },
    {
      label: 'Pending Lab Tests',
      value: '32',
      icon: <ClipboardListIcon size={20} />,
      gradient: 'from-yellow-500 to-yellow-600',
      bgLight: 'bg-yellow-50'
    },
    {
      label: 'Available Beds',
      value: '15/120',
      icon: <BedIcon size={20} />,
      gradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Dashboard Overview</h1>
          <p className="text-slate-500 mt-2">Monitor your hospital operations in real-time</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors duration-200 shadow-sm">
            Export Report
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg">
            View Analytics
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className={`bg-gradient-to-br ${stat.gradient} p-4 rounded-xl text-white shadow-lg`}>
                {stat.icon}
              </div>
              <div className={`${stat.bgLight} p-2 rounded-lg`}>
                <div className="w-2 h-2 bg-current rounded-full opacity-60"></div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activity + Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg lg:col-span-2 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-2xl">
            <h2 className="text-xl font-bold flex items-center text-slate-800">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg mr-3 text-white">
                <ActivityIcon size={18} />
              </div>
              Hospital Activity
            </h2>
            <p className="text-slate-500 text-sm mt-1">Real-time activity monitoring</p>
          </div>
          <div className="p-6 h-72 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3Icon size={24} className="text-slate-600" />
              </div>
              <p className="text-slate-500 font-medium">Activity chart will be displayed here</p>
              <p className="text-slate-400 text-sm mt-1">Integration with analytics system pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-green-50 rounded-t-2xl">
            <h2 className="text-xl font-bold flex items-center text-slate-800">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg mr-3 text-white">
                <ClockIcon size={18} />
              </div>
              Today's Schedule
            </h2>
            <p className="text-slate-500 text-sm mt-1">Upcoming appointments</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: 'Jane Cooper', type: 'General Checkup', time: '10:30 AM', doctor: 'Dr. Marcus Wilson', status: 'confirmed' },
                { name: 'Michael Brown', type: 'Follow-up', time: '2:15 PM', doctor: 'Dr. Sarah Lee', status: 'pending' },
                { name: 'Emma Davis', type: 'Lab Results', time: '4:00 PM', doctor: 'Dr. James Smith', status: 'confirmed' }
              ].map((appointment, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{appointment.name}</p>
                      <p className="text-sm text-slate-500">{appointment.type}</p>
                      <p className="text-xs text-slate-400 mt-1">{appointment.doctor}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-600 font-bold text-sm">{appointment.time}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        appointment.status === 'confirmed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg">
              View All Appointments
            </button>
          </div>
        </div>
      </div>

      {/* Department Stats + Admissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-purple-50 rounded-t-2xl">
            <h2 className="text-xl font-bold flex items-center text-slate-800">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg mr-3 text-white">
                <BarChart3Icon size={18} />
              </div>
              Department Statistics
            </h2>
            <p className="text-slate-500 text-sm mt-1">Performance by department</p>
          </div>
          <div className="p-6 h-72 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3Icon size={24} className="text-slate-600" />
              </div>
              <p className="text-slate-500 font-medium">Department statistics chart will be displayed here</p>
              <p className="text-slate-400 text-sm mt-1">Integrated analytics coming soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-teal-50 rounded-t-2xl">
            <h2 className="text-xl font-bold flex items-center text-slate-800">
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-2 rounded-lg mr-3 text-white">
                <UserPlusIcon size={18} />
              </div>
              Recent Admissions
            </h2>
            <p className="text-slate-500 text-sm mt-1">Latest patient admissions</p>
          </div>
          <div className="p-6">
            <div className="overflow-hidden">
              <div className="space-y-3">
                {[
                  { name: 'Michael Johnson', date: 'May 15, 2023', department: 'Cardiology', status: 'Active', statusColor: 'green' },
                  { name: 'Sarah Williams', date: 'May 14, 2023', department: 'Neurology', status: 'Observation', statusColor: 'yellow' },
                  { name: 'David Brown', date: 'May 14, 2023', department: 'Emergency', status: 'Critical', statusColor: 'red' },
                  { name: 'Lisa Davis', date: 'May 13, 2023', department: 'Pediatrics', status: 'Stable', statusColor: 'blue' }
                ].map((admission, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors duration-200">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{admission.name}</p>
                        <p className="text-sm text-slate-500">{admission.department}</p>
                        <p className="text-xs text-slate-400 mt-1">{admission.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        admission.statusColor === 'green' ? 'bg-green-100 text-green-700' :
                        admission.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                        admission.statusColor === 'red' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {admission.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="w-full mt-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl text-sm font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg">
              View All Admissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
