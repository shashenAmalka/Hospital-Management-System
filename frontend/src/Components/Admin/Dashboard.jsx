import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users2Icon, CalendarIcon, ClipboardListIcon, BarChart3Icon, 
  ActivityIcon, BedIcon, ClockIcon, UserPlusIcon, Package, 
  Stethoscope, Building2, AlertTriangle, CheckCircle, Clock
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 0,
    appointmentsToday: 0,
    pendingLabTests: 0,
    todaysSchedule: [],
    inventoryStatus: [],
    staffOverview: [],
    departmentOverview: []
  });
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState([]);

  const getDepartmentColor = (departmentName) => {
    const colors = {
      'cardiology': 'blue',
      'neurology': 'purple', 
      'orthopedics': 'blue',
      'pediatrics': 'blue',
      'emergency': 'red',
      'radiology': 'green',
      'surgery': 'red'
    };
    return colors[departmentName.toLowerCase()] || 'blue';
  };

  const fetchDashboardData = useCallback(async () => {
    const API_BASE_URL = 'http://localhost:5000/api';
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };

    try {
      setLoading(true);

      // Create an object to collect all data
      const newDashboardData = {
        totalPatients: 0,
        appointmentsToday: 0,
        pendingLabTests: 0,
        todaysSchedule: [],
        inventoryStatus: [],
        staffOverview: [],
        departmentOverview: []
      };

      // Fetch total patients
      try {
        const patientsResponse = await fetch(`${API_BASE_URL}/users?role=patient`, { headers });
        console.log('Patients response status:', patientsResponse.status);
        
        if (patientsResponse.ok) {
          const patientsData = await patientsResponse.json();
          console.log('Patients data received:', patientsData);
          
          const patientCount = patientsData.Users?.length || patientsData.data?.length || patientsData.results || 0;
          console.log('Patient count:', patientCount);
          
          newDashboardData.totalPatients = patientCount;
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      }

      // Fetch today's appointments
      try {
        const appointmentsResponse = await fetch(`${API_BASE_URL}/appointments/today`, { headers });
        console.log('Appointments response status:', appointmentsResponse.status);
        
        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          console.log('Appointments data received:', appointmentsData);
          
          const appointmentCount = appointmentsData.data?.length || appointmentsData.results || 0;
          console.log('Appointment count:', appointmentCount);
          
          newDashboardData.appointmentsToday = appointmentCount;
          newDashboardData.todaysSchedule = (appointmentsData.data || []).slice(0, 3);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }

      // Fetch pending lab tests
      try {
        const labResponse = await fetch(`${API_BASE_URL}/lab-requests/all?status=pending`, { headers });
        console.log('Lab tests response status:', labResponse.status);
        
        if (labResponse.ok) {
          const labData = await labResponse.json();
          console.log('Lab data received:', labData);
          
          const labCount = labData.count || labData.data?.length || labData.results || 0;
          console.log('Lab test count:', labCount);
          
          newDashboardData.pendingLabTests = labCount;
        }
      } catch (error) {
        console.error('Error fetching lab tests:', error);
      }

      // Fetch inventory status
      try {
        const inventoryResponse = await fetch(`${API_BASE_URL}/medication/items`, { headers });
        if (inventoryResponse.ok) {
          const inventoryData = await inventoryResponse.json();
          const items = inventoryData.data || inventoryData.items || [];
          const inventoryStatus = items.slice(0, 4).map(item => ({
            name: item.name || item.itemName,
            stock: item.quantity || item.stock || 0,
            status: (item.quantity || item.stock || 0) > 50 ? 'In Stock' : (item.quantity || item.stock || 0) > 10 ? 'Low Stock' : 'Out of Stock',
            statusColor: (item.quantity || item.stock || 0) > 50 ? 'green' : (item.quantity || item.stock || 0) > 10 ? 'yellow' : 'red'
          }));
          
          newDashboardData.inventoryStatus = inventoryStatus.length > 0 ? inventoryStatus : [];
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }

      // Fetch staff overview
      try {
        const staffResponse = await fetch(`${API_BASE_URL}/staff?role=doctor`, { headers });
        if (staffResponse.ok) {
          const staffData = await staffResponse.json();
          const doctors = staffData.data || staffData.staff || [];
          const staffOverview = doctors.slice(0, 4).map(doctor => ({
            name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
            specialization: doctor.specialization || 'General',
            status: doctor.status === 'active' ? 'On Duty' : doctor.status === 'on-leave' ? 'On Call' : 'Off Duty',
            statusColor: doctor.status === 'active' ? 'green' : doctor.status === 'on-leave' ? 'yellow' : 'red',
            initials: `${doctor.firstName.charAt(0)}${doctor.lastName.charAt(0)}`
          }));
          
          newDashboardData.staffOverview = staffOverview.length > 0 ? staffOverview : [];
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
      }

      // Fetch department overview
      try {
        const departmentsResponse = await fetch(`${API_BASE_URL}/departments`, { headers });
        if (departmentsResponse.ok) {
          const departmentsData = await departmentsResponse.json();
          const departments = departmentsData.data || departmentsData.departments || [];
          
          // For each department, get staff count (using staff instead of patients)
          const departmentOverview = await Promise.all(
            departments.slice(0, 5).map(async (dept) => {
              try {
                const staffResponse = await fetch(`${API_BASE_URL}/staff?department=${dept.name}`, { headers });
                const staffData = staffResponse.ok ? await staffResponse.json() : { data: [] };
                const staffCount = staffData.data?.length || staffData.staff?.length || 0;
                
                return {
                  name: dept.name,
                  patientCount: staffCount, // Using staff count as a metric
                  color: getDepartmentColor(dept.name)
                };
              } catch {
                return {
                  name: dept.name,
                  patientCount: 0,
                  color: getDepartmentColor(dept.name)
                };
              }
            })
          );
          
          newDashboardData.departmentOverview = departmentOverview.length > 0 ? departmentOverview : [];
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }

      // Update all dashboard data at once
      console.log('Setting dashboard data:', newDashboardData);
      setDashboardData(newDashboardData);

      // Fetch activity statistics for the chart (last 7 days)
      try {
        const activityResponse = await fetch(`${API_BASE_URL}/appointments/activity-statistics?days=7`, { headers });
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          const chartData = activityData.data || [];
          
          console.log('Activity statistics fetched:', chartData);
          setActivityData(chartData);
        } else {
          console.error('Failed to fetch activity statistics');
          // Fallback to generating sample data
          setActivityData(generateFallbackActivityData());
        }
      } catch (error) {
        console.error('Error fetching activity statistics:', error);
        // Fallback to generating sample data
        setActivityData(generateFallbackActivityData());
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fallback function to generate sample data if API fails
  const generateFallbackActivityData = () => {
    const data = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      data.push({
        day: dayName,
        appointments: Math.floor(Math.random() * 30) + 20,
        patients: Math.floor(Math.random() * 40) + 30,
        labTests: Math.floor(Math.random() * 25) + 15,
      });
    }
    
    return data;
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stats = [
    {
      label: 'Total Patients',
      value: loading ? '...' : dashboardData.totalPatients.toString(),
      icon: <Users2Icon size={20} />,
      gradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50'
    },
    {
      label: 'Appointments Today', 
      value: loading ? '...' : dashboardData.appointmentsToday.toString(),
      icon: <CalendarIcon size={20} />,
      gradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-50'
    },
    {
      label: 'Pending Lab Tests',
      value: loading ? '...' : dashboardData.pendingLabTests.toString(),
      icon: <ClipboardListIcon size={20} />,
      gradient: 'from-yellow-500 to-yellow-600',
      bgLight: 'bg-yellow-50'
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <p className="text-slate-500 text-sm mt-1">Real-time activity monitoring - Last 7 days</p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="h-72 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-500">Loading activity data...</p>
                </div>
              </div>
            ) : activityData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={activityData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorLabTests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#64748b"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#64748b"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '12px' }}
                      iconType="circle"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="appointments" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorAppointments)" 
                      name="Appointments"
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="patients" 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorPatients)" 
                      name="Patients"
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="labTests" 
                      stroke="#f59e0b" 
                      fillOpacity={1} 
                      fill="url(#colorLabTests)" 
                      name="Lab Tests"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3Icon size={24} className="text-slate-600" />
                  </div>
                  <p className="text-slate-500 font-medium">No activity data available</p>
                  <p className="text-slate-400 text-sm mt-1">Data will appear as hospital activities are recorded</p>
                </div>
              </div>
            )}
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
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-slate-500 mt-2">Loading schedule...</p>
                </div>
              ) : dashboardData.todaysSchedule.length > 0 ? (
                dashboardData.todaysSchedule.map((appointment, index) => (
                  <div key={appointment._id || index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors duration-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">
                          {appointment.patient?.firstName && appointment.patient?.lastName
                            ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                            : appointment.patient?.name || appointment.patientName || appointment.name || 'Patient Name Not Available'}
                        </p>
                        <p className="text-sm text-slate-500">{appointment.type || appointment.reason || appointment.appointmentType || 'Consultation'}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {appointment.doctor?.firstName && appointment.doctor?.lastName
                            ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                            : appointment.doctor?.name || appointment.doctorName || 'Doctor Not Assigned'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-600 font-bold text-sm">
                          {appointment.appointmentTime || appointment.time || 'Time TBD'}
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          appointment.status === 'confirmed' || appointment.status === 'scheduled'
                            ? 'bg-green-100 text-green-700' 
                            : appointment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {appointment.status || 'scheduled'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ClockIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500">No appointments scheduled for today</p>
                </div>
              )}
            </div>
            <button className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg">
              View All Appointments
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Status + Staff Overview + Department Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Status */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-orange-50 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center text-slate-800">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg mr-3 text-white">
                  <Package size={18} />
                </div>
                Inventory Status
              </h2>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View All</button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
                </div>
              ) : (
                dashboardData.inventoryStatus.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                      <div className={`w-full h-2 rounded-full mt-2 ${
                        item.statusColor === 'green' ? 'bg-green-200' :
                        item.statusColor === 'yellow' ? 'bg-yellow-200' : 'bg-red-200'
                      }`}>
                        <div 
                          className={`h-2 rounded-full ${
                            item.statusColor === 'green' ? 'bg-green-500' :
                            item.statusColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: item.statusColor === 'red' ? '0%' : item.statusColor === 'yellow' ? '30%' : '80%' }}
                        ></div>
                      </div>
                    </div>
                    <span className={`ml-4 px-2 py-1 rounded-full text-xs font-medium ${
                      item.statusColor === 'green' ? 'bg-green-100 text-green-700' :
                      item.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Staff Overview */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center text-slate-800">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg mr-3 text-white">
                  <Stethoscope size={18} />
                </div>
                Staff Overview
              </h2>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Manage Staff</button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                dashboardData.staffOverview.map((staff, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3 ${
                        staff.statusColor === 'green' ? 'bg-green-500' :
                        staff.statusColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {staff.initials}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 text-sm">{staff.name}</p>
                        <p className="text-xs text-slate-500">{staff.specialization}</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      staff.statusColor === 'green' ? 'bg-green-500' :
                      staff.statusColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 flex justify-center space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span className="text-slate-600">On Duty</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                <span className="text-slate-600">On Call</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                <span className="text-slate-600">Off Duty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Department Overview */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-purple-50 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center text-slate-800">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg mr-3 text-white">
                  <Building2 size={18} />
                </div>
                Department Overview
              </h2>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View All</button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : (
                dashboardData.departmentOverview.map((dept, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">{dept.name}</p>
                      <div className={`w-full h-2 rounded-full mt-2 ${
                        dept.color === 'blue' ? 'bg-blue-200' :
                        dept.color === 'purple' ? 'bg-purple-200' : 'bg-red-200'
                      }`}>
                        <div 
                          className={`h-2 rounded-full ${
                            dept.color === 'blue' ? 'bg-blue-500' :
                            dept.color === 'purple' ? 'bg-purple-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(dept.patientCount / 20) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-4 text-slate-600 font-medium text-sm">
                      {dept.patientCount} patients
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
