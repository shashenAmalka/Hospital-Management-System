import React, { useState, useEffect } from 'react';
import { PharmacistSidebar } from './PharmacistSidebar';
import { PharmacistHeader } from './PharmacistHeader';
import PharmacistDashboard from './PharmacistDashboard';
import PharmacyItemForm from './PharmacyItemForm';
import SupplierDashboard from './SupplierDashboard';
import PharmacyReports from './PharmacyReports';
import PharmacistPrescriptions from './PharmacistPrescriptions';

function PharmacistLayout() {
  const [currentPage, setCurrentPage] = useState('inventory');
  const [userRole, setUserRole] = useState('Pharmacist');
  const [editingItem, setEditingItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    
    // Dispatch custom logout event for other components
    window.dispatchEvent(new Event('logout'));
    
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

  const handleNavigateToInventory = () => {
    setCurrentPage('inventory');
  };

  const handleBackToDashboard = () => {
    setEditingItem(null);
    setCurrentPage('inventory');
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <PharmacistDashboard 
          onNavigateToAdd={handleNavigateToAdd}
          onNavigateToEdit={handleNavigateToEdit}
          onNavigateToInventory={handleNavigateToInventory}
        />;
      
      // Inventory Management
      case 'inventory':
        return <PharmacistDashboard 
          activeTab="all-items" 
          onNavigateToAdd={handleNavigateToAdd}
          onNavigateToEdit={handleNavigateToEdit}
          onNavigateToInventory={handleNavigateToInventory}
        />;
      case 'all-items':
        return <PharmacistDashboard 
          activeTab="all-items" 
          onNavigateToAdd={handleNavigateToAdd}
          onNavigateToEdit={handleNavigateToEdit}
          onNavigateToInventory={handleNavigateToInventory}
        />;
      case 'low-stock':
        return <PharmacistDashboard 
          activeTab="low-stock" 
          onNavigateToAdd={handleNavigateToAdd}
          onNavigateToEdit={handleNavigateToEdit}
          onNavigateToInventory={handleNavigateToInventory}
        />;
      case 'add-item':
        return <PharmacyItemForm onBack={handleBackToDashboard} />;
      case 'edit-item':
        return <PharmacyItemForm item={editingItem} onBack={handleBackToDashboard} />;
      case 'add-medication':
        return <PharmacyItemForm onBack={handleBackToDashboard} />;
      
      // Prescription Management
      case 'prescriptions':
        return <PharmacistPrescriptions />;
      case 'pending-prescriptions':
        return <PharmacistPrescriptions />;
      case 'completed-prescriptions':
        return <PharmacistPrescriptions />;
      case 'prescription-history':
        return <PharmacistPrescriptions />;
      
      // Supplier Management
      case 'suppliers':
        return <SupplierDashboard />;
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
      
      default:
        return (
          <PharmacistDashboard
            onNavigateToAdd={handleNavigateToAdd}
            onNavigateToEdit={handleNavigateToEdit}
            onNavigateToInventory={handleNavigateToInventory}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile, slides in when open */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        transform lg:transform-none transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <PharmacistSidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          userRole={userRole}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <PharmacistHeader 
          currentPage={currentPage}
          onLogout={handleLogout}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="py-4 px-4 sm:px-6 lg:px-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default PharmacistLayout;
