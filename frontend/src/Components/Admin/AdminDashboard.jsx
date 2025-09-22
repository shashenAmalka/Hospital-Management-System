import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Dashboard } from './Dashboard';
import { StaffDirectory } from './StaffDirectory';
import { StaffForm } from './StaffForm';
import RolesAndDepartments from './RolesAndDepartments';
import ShiftScheduling from './ShiftScheduling';
import LeaveManagement from './LeaveManagement';
import Certifications from './Certifications';

function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userRole, setUserRole] = useState('Admin');
  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUserRole(user.role || 'Admin');
    }

    // Add admin layout class to body to prevent double scrollbars
    document.body.classList.add('admin-layout');

    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('admin-layout');
    };
  }, []);

  const handleAddStaff = () => {
    setCurrentPage('addStaff');
    setSelectedStaff(null);
  };

  const handleEditStaff = (staff) => {
    setSelectedStaff(staff);
    setCurrentPage('addStaff');
  };

  const handleStaffAdded = () => {
    setCurrentPage('staffProfiles');
    setSelectedStaff(null);
  };

  const handleStaffSubmit = async (staffData) => {
    try {
      const url = selectedStaff 
        ? `http://localhost:5000/api/staff/${selectedStaff._id}`
        : 'http://localhost:5000/api/staff';
      
      const method = selectedStaff ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(staffData)
      });

      if (!response.ok) {
        throw new Error('Failed to save staff member');
      }

      const result = await response.json();
      console.log('Staff saved successfully:', result);
      
      // Navigate back to staff directory
      handleStaffAdded();
    } catch (error) {
      console.error('Error saving staff:', error);
      throw error; // Re-throw to let StaffForm handle the error display
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'staffProfiles':
        return <StaffDirectory onSelectStaff={handleEditStaff} onAddStaff={handleAddStaff} />;
      case 'addStaff':
        return (
          <StaffForm 
            onSubmit={handleStaffSubmit} 
            onCancel={handleStaffAdded} 
            staffData={selectedStaff}
            editMode={!!selectedStaff}
          />
        );
      case 'staffRoles':
        return <RolesAndDepartments />;
      case 'scheduling':
        return <ShiftScheduling />;
      case 'leaveManagement':
        return <LeaveManagement />;
      case 'certifications':
        return <Certifications />;
      default:
        return <Dashboard />;
    }
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} userRole={userRole} />
      <div className="flex-1 flex flex-col">
        <Header 
          currentPage={currentPage}
          selectedPatientId={selectedStaff?._id}
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

export default AdminDashboard;
