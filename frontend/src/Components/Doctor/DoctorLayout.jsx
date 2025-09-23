import React, { useState, useEffect } from 'react';
import { DoctorSidebar } from './DoctorSidebar';
import { DoctorHeader } from './DoctorHeader';
import { DoctorDashboard } from './DoctorDashboard';
import MyAppointments from './MyAppointments';
import LeaveManagement from './LeaveManagement';

function DoctorLayout() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userRole, setUserRole] = useState('Doctor');

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUserRole(user.role || 'Doctor');
    }

    // Add doctor layout class to body to prevent double scrollbars
    document.body.classList.add('doctor-layout');

    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('doctor-layout');
    };
  }, []);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_name');
    // Redirect to login page
    window.location.href = '/login';
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DoctorDashboard />;
      
      // Patient Management
      case 'patients':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">My Patients</h2>
            <p className="text-gray-600">Patient management coming soon...</p>
          </div>
        );
      case 'patientRegistration':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Patient Registration</h2>
            <p className="text-gray-600">Patient registration coming soon...</p>
          </div>
        );
      
      // Appointments
      case 'appointmentScheduling':
        return <MyAppointments />;
      case 'upcomingAppointments':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Schedule Appointment</h2>
            <p className="text-gray-600">Appointment scheduling coming soon...</p>
          </div>
        );
      
      // Laboratory
      case 'labRequests':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Order Tests</h2>
            <p className="text-gray-600">Lab test ordering coming soon...</p>
          </div>
        );
      case 'testResults':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">View Results</h2>
            <p className="text-gray-600">Lab results review coming soon...</p>
          </div>
        );
      
      // Self Service
      case 'scheduling':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">My Roster</h2>
            <p className="text-gray-600">Schedule management coming soon...</p>
          </div>
        );
      case 'leaveManagement':
        return <LeaveManagement />;
      case 'certifications':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">My Credentials</h2>
            <p className="text-gray-600">Credential management coming soon...</p>
          </div>
        );
      
      default:
        return <DoctorDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <DoctorSidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        userRole={userRole} 
      />
      <div className="flex-1 flex flex-col">
        <DoctorHeader 
          currentPage={currentPage}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="py-6 px-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DoctorLayout;