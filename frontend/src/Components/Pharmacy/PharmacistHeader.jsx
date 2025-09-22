import React from 'react';
import PropTypes from 'prop-types';
import {
  BellIcon,
  SearchIcon,
  UserIcon,
  ChevronDownIcon,
} from 'lucide-react';

export function PharmacistHeader({ currentPage }) {
  const pageTitle = {
    dashboard: 'Pharmacy Dashboard',
    // Inventory
    'all-items': 'All Medications',
    'low-stock': 'Low Stock Items',
    'add-medication': 'Add Medication',
    // Prescriptions
    'pending-prescriptions': 'Pending Prescriptions',
    'completed-prescriptions': 'Completed Prescriptions',
    'prescription-history': 'Prescription History',
    // Suppliers
    'supplier-list': 'Supplier Directory',
    'purchase-orders': 'Purchase Orders',
    'supplier-performance': 'Supplier Performance',
    // Reports
    'inventory-reports': 'Inventory Reports',
    'sales-reports': 'Sales Reports',
    'expiry-reports': 'Expiry Reports',
  };

  const userName = localStorage.getItem('user_name') || 'Pharmacist';

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {pageTitle[currentPage] || 'Pharmacy Portal'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {userName}
          </p>
        </div>

        {/* Right side - Search, Notifications, Profile */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search medications, suppliers..."
              className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md 
                       leading-5 bg-white placeholder-gray-500 focus:outline-none 
                       focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 
                       focus:border-blue-500 text-sm"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 text-gray-400 hover:text-gray-500 relative">
              <BellIcon className="h-6 w-6" />
              {/* Notification badge */}
              <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 
                             bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-blue-600" />
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {userName}
              </span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

PharmacistHeader.propTypes = {
  currentPage: PropTypes.string.isRequired,
};

export default PharmacistHeader;
