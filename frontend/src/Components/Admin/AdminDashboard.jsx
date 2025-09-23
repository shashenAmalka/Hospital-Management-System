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
import { PharmacistDashboard, PharmacyItemForm } from '../Pharmacy';

function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userRole, setUserRole] = useState('Admin');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedPharmacyItem, setSelectedPharmacyItem] = useState(null);

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

  // Pharmacy handling functions
  const handleAddPharmacyItem = () => {
    setCurrentPage('addPharmacyItem');
    setSelectedPharmacyItem(null);
  };

  const handleEditPharmacyItem = (item) => {
    setSelectedPharmacyItem(item);
    setCurrentPage('editPharmacyItem');
  };

  const handlePharmacyItemAdded = () => {
    setCurrentPage('inventoryItems');
    setSelectedPharmacyItem(null);
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
      case 'inventoryItems':
        return (
          <PharmacistDashboard 
            activeTab="all-items"
            onNavigateToAdd={handleAddPharmacyItem}
            onNavigateToEdit={handleEditPharmacyItem}
          />
        );
      case 'addPharmacyItem':
        return (
          <PharmacyItemForm 
            onBack={handlePharmacyItemAdded}
          />
        );
      case 'editPharmacyItem':
        return (
          <PharmacyItemForm 
            onBack={handlePharmacyItemAdded}
            item={selectedPharmacyItem}
          />
        );
      case 'stockMonitoring':
        return (
          <PharmacistDashboard 
            activeTab="low-stock"
            onNavigateToAdd={handleAddPharmacyItem}
            onNavigateToEdit={handleEditPharmacyItem}
          />
        );
      case 'suppliers':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Suppliers Management</h2>
            <p className="text-gray-600">Supplier management functionality will be implemented here.</p>
          </div>
        );
      case 'medicineRecords':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Medicine Records</h2>
            <p className="text-gray-600">Medicine records functionality will be implemented here.</p>
          </div>
        );
      case 'inventoryReports':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Inventory Reports</h2>
            <p className="text-gray-600">Inventory reports functionality will be implemented here.</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_name');
    // Dispatch logout event before redirecting
    window.dispatchEvent(new Event('user-logout'));
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
