import React, { useState } from 'react';
import { Sidebar } from '../Admin/Sidebar';
import { Header } from '../Admin/Header';
import LabTechnicianDashboard from './LabTechnicianDashboard';
import LeaveManagement from '../Doctor/LeaveManagement';
import { NotificationProvider } from '../../context/NotificationContext';

const LabTechnicianLayout = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Function to render the appropriate content based on current page
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <LabTechnicianDashboard initialTab="pending" />;
      
      case 'pendingOrders':
        return <LabTechnicianDashboard initialTab="pending" />;
      
      case 'specimenIntake':
        return <LabTechnicianDashboard initialTab="lab-requests" />;
      
      case 'inProgress':
        return <LabTechnicianDashboard initialTab="in-progress" />;
      
      case 'resultEntry':
        return <LabTechnicianDashboard initialTab="completed" />;
      
      case 'verification':
        return <LabTechnicianDashboard initialTab="completed" />;
      
      case 'scheduling':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">My Roster</h2>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <p className="text-slate-600">Your work schedule and roster will be displayed here.</p>
            </div>
          </div>
        );
      
      case 'leaveManagement':
        return <LeaveManagement />;
      
      default:
        return <LabTechnicianDashboard initialTab="pending" />;
    }
  };

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-slate-50">
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          userRole="lab_technician"
          handleLogout={handleLogout}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            currentPage={currentPage}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default LabTechnicianLayout;