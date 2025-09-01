import React, { useState, useEffect } from 'react';
import { Calendar, Heart, Pill } from 'lucide-react';

const OverviewTab = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [visitCount, setVisitCount] = useState(0);
  const [medicationCount, setMedicationCount] = useState(0);
  const API_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchOverviewData();
  }, [user]);

  const fetchOverviewData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch upcoming appointments
      const appointmentsResponse = await fetch(`${API_URL}/appointments/upcoming`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData.slice(0, 1)); // Just show the next one
      }
      
      // Fetch visit count (you'll need to implement this endpoint)
      const visitsResponse = await fetch(`${API_URL}/patients/${user._id}/visits/count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (visitsResponse.ok) {
        const visitsData = await visitsResponse.json();
        setVisitCount(visitsData.count);
      }
      
      // Fetch medication count (you'll need to implement this endpoint)
      const medsResponse = await fetch(`${API_URL}/patients/${user._id}/medications/count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (medsResponse.ok) {
        const medsData = await medsResponse.json();
        setMedicationCount(medsData.count);
      }
    } catch (error) {
      console.error('Error fetching overview data:', error);
    }
  };

  const nextAppointment = appointments.length > 0 ? appointments[0] : null;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-medium">Next Appointment</p>
              {nextAppointment ? (
                <>
                  <p className="text-2xl font-bold text-blue-800">
                    {new Date(nextAppointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-blue-600">{nextAppointment.doctorName}</p>
                </>
              ) : (
                <p className="text-2xl font-bold text-blue-800">None</p>
              )}
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-medium">Total Visits</p>
              <p className="text-2xl font-bold text-green-800">{visitCount}</p>
              <p className="text-sm text-green-600">This year</p>
            </div>
            <Heart className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 font-medium">Active Medications</p>
              <p className="text-2xl font-bold text-orange-800">{medicationCount}</p>
              <p className="text-sm text-orange-600">Prescriptions</p>
            </div>
            <Pill className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {nextAppointment ? (
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-slate-600">
                Upcoming appointment with {nextAppointment.doctorName} on {new Date(nextAppointment.date).toLocaleDateString()}
              </span>
            </div>
          ) : (
            <p className="text-slate-500">No recent activity</p>
          )}
          {/* Add more activity items as needed */}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;