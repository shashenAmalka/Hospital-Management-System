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
import SupplierDashboard from '../Pharmacy/SupplierDashboard';
import PharmacyReports from '../Pharmacy/PharmacyReports';

function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userRole, setUserRole] = useState('admin');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedPharmacyItem, setSelectedPharmacyItem] = useState(null);

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUserRole(user.role || 'admin');
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
    setCurrentPage('inventory');
    setSelectedPharmacyItem(null);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      
      // Patient Management
      case 'patients':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Patient List</h2>
            <p className="text-gray-600">Patient list functionality will be implemented here.</p>
          </div>
        );
      case 'patientRegistration':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Patient Registration</h2>
            <p className="text-gray-600">Patient registration functionality will be implemented here.</p>
          </div>
        );
      
      // Staff Management
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
      
      // Inventory & Pharmacy - Same as PharmacistLayout
      case 'inventory':
        return <PharmacistDashboard 
          activeTab="all-items" 
          onNavigateToAdd={handleAddPharmacyItem}
          onNavigateToEdit={handleEditPharmacyItem}
        />;
      case 'all-items':
        return <PharmacistDashboard 
          activeTab="all-items" 
          onNavigateToAdd={handleAddPharmacyItem}
          onNavigateToEdit={handleEditPharmacyItem}
        />;
      case 'low-stock':
        return <PharmacistDashboard 
          activeTab="low-stock" 
          onNavigateToAdd={handleAddPharmacyItem}
          onNavigateToEdit={handleEditPharmacyItem}
        />;
      case 'add-item':
        return <PharmacyItemForm onBack={handlePharmacyItemAdded} />;
      case 'edit-item':
        return <PharmacyItemForm item={selectedPharmacyItem} onBack={handlePharmacyItemAdded} />;
      case 'addPharmacyItem':
        return <PharmacyItemForm onBack={handlePharmacyItemAdded} />;
      case 'editPharmacyItem':
        return <PharmacyItemForm item={selectedPharmacyItem} onBack={handlePharmacyItemAdded} />;
      case 'add-medication':
        return <PharmacyItemForm onBack={handlePharmacyItemAdded} />;
      
      // Prescription Management
      case 'prescription':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Prescriptions</h2>
            <p className="text-gray-600">Prescription management coming soon...</p>
          </div>
        );
      case 'pending-prescriptions':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Pending Prescriptions</h2>
            <p className="text-gray-600">Pending prescription management coming soon...</p>
          </div>
        );
      case 'completed-prescriptions':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Completed Prescriptions</h2>
            <p className="text-gray-600">Completed prescription management coming soon...</p>
          </div>
        );
      case 'prescription-history':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Prescription History</h2>
            <p className="text-gray-600">Prescription history coming soon...</p>
          </div>
        );
      
      // Supplier Management
      case 'suppliers':
        return <SupplierDashboard activeTab="list" />;
      case 'supplier-list':
        return <SupplierDashboard activeTab="list" />;
      case 'supplier-items':
        return <SupplierDashboard activeTab="items" />;
      case 'add-supplier':
        return <SupplierDashboard activeTab="add" />;
      case 'purchase-orders':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Purchase Orders</h2>
            <p className="text-gray-600">Purchase order management coming soon...</p>
          </div>
        );
      case 'supplier-performance':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Supplier Performance</h2>
            <p className="text-gray-600">Supplier performance tracking coming soon...</p>
          </div>
        );
      
      // Reports
      case 'reports':
        return <PharmacyReports />;
      case 'inventory-reports':
        return <PharmacyReports reportType="inventory" />;
      case 'sales-reports':
        return <PharmacyReports reportType="sales" />;
      case 'expiry-reports':
        return <PharmacyReports reportType="expiry" />;
      
      // Appointments
      case 'appointmentScheduling':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Schedule Appointment</h2>
            <p className="text-gray-600">Appointment scheduling functionality will be implemented here.</p>
          </div>
        );
      case 'doctorAllocation':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Doctor Allocation</h2>
            <p className="text-gray-600">Doctor allocation functionality will be implemented here.</p>
          </div>
        );
      case 'upcomingAppointments':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Appointments</h2>
            <p className="text-gray-600">Upcoming appointments functionality will be implemented here.</p>
          </div>
        );
      
      // Laboratory
      case 'labRequests':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Requests</h2>
            <p className="text-gray-600">Lab test requests functionality will be implemented here.</p>
          </div>
        );
      case 'testResults':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Results</h2>
            <p className="text-gray-600">Test results functionality will be implemented here.</p>
          </div>
        );
      case 'labReports':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Lab Reports</h2>
            <p className="text-gray-600">Lab reports functionality will be implemented here.</p>
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
    
    // Dispatch custom logout event for other components
    window.dispatchEvent(new Event('logout'));
    
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
