import React, { useState, useEffect } from 'react';
import { PharmacistSidebar } from './PharmacistSidebar';
import { PharmacistHeader } from './PharmacistHeader';
import PharmacistDashboard from './PharmacistDashboard';
import PharmacyItemForm from './PharmacyItemForm';

function PharmacistLayout() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userRole, setUserRole] = useState('Pharmacist');
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUserRole(user.role || 'Pharmacist');
    }

    // Add pharmacist layout class to body to prevent double scrollbars
    document.body.classList.add('pharmacist-layout');

    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('pharmacist-layout');
    };
  }, []);

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

  const handleNavigateToAdd = () => {
    setEditingItem(null);
    setCurrentPage('add-item');
  };

  const handleNavigateToEdit = (item) => {
    setEditingItem(item);
    setCurrentPage('edit-item');
  };

  const handleBackToDashboard = () => {
    setEditingItem(null);
    setCurrentPage('dashboard');
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <PharmacistDashboard 
          onNavigateToAdd={handleNavigateToAdd}
          onNavigateToEdit={handleNavigateToEdit}
        />;
      
      // Inventory Management
      case 'all-items':
        return <PharmacistDashboard 
          activeTab="all-items" 
          onNavigateToAdd={handleNavigateToAdd}
          onNavigateToEdit={handleNavigateToEdit}
        />;
      case 'low-stock':
        return <PharmacistDashboard 
          activeTab="low-stock" 
          onNavigateToAdd={handleNavigateToAdd}
          onNavigateToEdit={handleNavigateToEdit}
        />;
      case 'add-item':
        return <PharmacyItemForm onBack={handleBackToDashboard} />;
      case 'edit-item':
        return <PharmacyItemForm item={editingItem} onBack={handleBackToDashboard} />;
      case 'add-medication':
        return <PharmacyItemForm onBack={handleBackToDashboard} />;
      
      // Prescription Management
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
      case 'supplier-list':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Supplier Directory</h2>
            <p className="text-gray-600">Supplier management coming soon...</p>
          </div>
        );
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
      case 'inventory-reports':
        return <PharmacistDashboard activeTab="reports" reportType="inventory" />;
      case 'sales-reports':
        return <PharmacistDashboard activeTab="reports" reportType="sales" />;
      case 'expiry-reports':
        return <PharmacistDashboard activeTab="reports" reportType="expiry" />;
      
      default:
        return <PharmacistDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <PharmacistSidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        userRole={userRole} 
      />
      <div className="flex-1 flex flex-col">
        <PharmacistHeader 
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

export default PharmacistLayout;
