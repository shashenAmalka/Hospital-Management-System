import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { dashboardService } from '../../utils/api';

// Dynamically import Chart.js components to handle potential loading issues
const ChartComponent = React.lazy(() => import('./ChartComponent'));

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeStaff: 0,
    todayAppointments: 0,
    occupancyRate: 0,
    patientGrowth: 0,
    staffGrowth: 0,
    appointmentChange: 0,
    occupancyChange: 0,
    totalAdmissions: 0,
    averageStay: 0,
    readmissionRate: 0,
  });
  
  const [alerts, setAlerts] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('Last 7 days');

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getAdminStats();
      
      if (response.data) {
        setStats(response.data.stats || stats);
        setAlerts(response.data.alerts || []);
        setChartData(response.data.chartData || generateDummyChartData());
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      setChartData(generateDummyChartData());
    } finally {
      setLoading(false);
    }
  };

  // Fallback function to generate chart data when API fails
  const generateDummyChartData = () => {
    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Admissions',
          data: [12, 19, 8, 15, 12, 7, 10],
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
        {
          label: 'Discharges',
          data: [10, 15, 7, 12, 14, 6, 8],
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getAlertIcon = (type) => {
    if (type === 'warning') return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
    if (type === 'error') return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
    return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>; // info
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-slate-700">{error}</p>
          <button 
            onClick={fetchDashboardData} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
        
        {/* Metrics/KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Patients */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Total Patients</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalPatients}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-${stats.patientGrowth >= 0 ? 'green' : 'red'}-500 text-sm flex items-center`}>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stats.patientGrowth >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                    </svg>
                    {stats.patientGrowth >= 0 ? '+' : ''}{stats.patientGrowth}%
                  </span>
                  <span className="text-slate-400 text-xs ml-2">from last month</span>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Active Staff */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Active Staff</p>
                <p className="text-2xl font-bold text-slate-800">{stats.activeStaff}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-${stats.staffGrowth >= 0 ? 'green' : 'red'}-500 text-sm flex items-center`}>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stats.staffGrowth >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                    </svg>
                    {stats.staffGrowth >= 0 ? '+' : ''}{stats.staffGrowth}%
                  </span>
                  <span className="text-slate-400 text-xs ml-2">from last month</span>
                </div>
              </div>
              <div className="bg-teal-50 p-3 rounded-full">
                <User className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Today's Appointments</p>
                <p className="text-2xl font-bold text-slate-800">{stats.todayAppointments}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-${stats.appointmentChange >= 0 ? 'green' : 'red'}-500 text-sm flex items-center`}>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stats.appointmentChange >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                    </svg>
                    {stats.appointmentChange >= 0 ? '+' : ''}{stats.appointmentChange}%
                  </span>
                  <span className="text-slate-400 text-xs ml-2">from last month</span>
                </div>
              </div>
              <div className="bg-indigo-50 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Occupancy Rate</p>
                <p className="text-2xl font-bold text-slate-800">{stats.occupancyRate}%</p>
                <div className="flex items-center mt-2">
                  <span className={`text-${stats.occupancyChange >= 0 ? 'green' : 'red'}-500 text-sm flex items-center`}>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stats.occupancyChange >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                    </svg>
                    {stats.occupancyChange >= 0 ? '+' : ''}{stats.occupancyChange}%
                  </span>
                  <span className="text-slate-400 text-xs ml-2">from last month</span>
                </div>
              </div>
              <div className="bg-amber-50 p-3 rounded-full">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Admissions and Recent Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Admissions Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Patient Admissions</h3>
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Last 7 days">Last 7 days</option>
                  <option value="Last 30 days">Last 30 days</option>
                  <option value="Last 90 days">Last 90 days</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : chartData ? (
              <div className="h-64">
                <React.Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                    <p className="ml-2 text-gray-600">Loading chart...</p>
                  </div>
                }>
                  <ChartComponent data={chartData} />
                </React.Suspense>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-500">
                No data available
              </div>
            )}
            
            {/* Admission Metrics */}
            <div className="grid grid-cols-3 gap-4 mt-8 border-t border-slate-200 pt-6">
              <div>
                <p className="text-slate-500 text-sm">Total Admissions</p>
                <p className="text-xl font-bold text-slate-800">{stats.totalAdmissions}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Average Stay</p>
                <p className="text-xl font-bold text-slate-800">{stats.averageStay} days</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Readmission Rate</p>
                <p className="text-xl font-bold text-slate-800">{stats.readmissionRate}%</p>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Recent Alerts</h3>
            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start">
                    {alert.type === 'error' ? (
                      <div className="bg-red-100 rounded-full p-2 mr-3">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      </div>
                    ) : alert.type === 'warning' ? (
                      <div className="bg-yellow-100 rounded-full p-2 mr-3">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      </div>
                    ) : (
                      <div className="bg-blue-100 rounded-full p-2 mr-3">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-slate-800">{alert.message}</p>
                      <p className="text-xs text-slate-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500">
                  No alerts at this time
                </div>
              )}
            </div>
            <div className="mt-6 text-center">
              <button className="text-blue-600 text-sm hover:text-blue-800">
                View all alerts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
               