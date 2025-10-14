import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  HomeIcon,
  Package,
  FileText,
  Truck,
  BarChart3,
  LogOutIcon,
  FlaskConicalIcon,
  UserCogIcon,
  Pill,
} from 'lucide-react';

export function PharmacistSidebar({ currentPage, setCurrentPage, userRole, onClose }) {
  const [expandedMenu, setExpandedMenu] = useState('inventory');

  // Define pharmacist-specific menu items
  const getPharmacistMenuItems = () => [
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Package size={20} />,
      
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      icon: <Pill size={20} />,
    },
    {
      id: 'suppliers',
      label: 'Suppliers',
      icon: <Truck size={20} />,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 size={20} />,
      
    },
  ];

  const menuItems = getPharmacistMenuItems();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_name');
    
    // Dispatch custom logout event for other components
    window.dispatchEvent(new Event('logout'));
    
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-blue-700 text-white flex-shrink-0 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-blue-600">
        <div className="flex items-center">
          <FlaskConicalIcon className="mr-2" size={24} />
          <h1 className="text-xl font-bold">HelaMed HMS</h1>
        </div>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden text-white hover:text-gray-200"
          aria-label="Close menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* User Info */}
      <div className="p-4 text-center border-b border-blue-600">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 mb-2">
          <Package size={24} />
        </div>
        <p className="font-medium text-sm">{localStorage.getItem('user_name') || 'Pharmacist'}</p>
        <p className="text-xs text-blue-300">{userRole || 'Pharmacist'}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id} className="mb-1">
              <button
                onClick={() => {
                  if (item.subMenu) {
                    setExpandedMenu(expandedMenu === item.id ? null : item.id);
                  } else {
                    setCurrentPage(item.id);
                    if (onClose) onClose(); // Close sidebar on mobile after selection
                  }
                }}
                className={`flex items-center px-4 py-3 w-full text-left hover:bg-blue-800 transition-colors ${
                  currentPage === item.id ? 'bg-blue-800' : ''
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
              {item.subMenu && expandedMenu === item.id && (
                <ul className="bg-blue-800 py-2">
                  {item.subMenu.map((subItem) => (
                    <li key={subItem.id}>
                      <button
                        onClick={() => {
                          setCurrentPage(subItem.id);
                          if (onClose) onClose(); // Close sidebar on mobile after selection
                        }}
                        className={`flex items-center px-4 py-2 pl-12 w-full text-left text-sm hover:bg-blue-900 transition-colors ${
                          currentPage === subItem.id ? 'bg-blue-900' : ''
                        }`}
                      >
                        <span>{subItem.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="border-t border-blue-600">
        <button 
          onClick={handleLogout}
          className="flex items-center px-4 py-3 w-full text-left hover:bg-blue-800 transition-colors"
        >
          <LogOutIcon size={20} className="mr-3" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}

PharmacistSidebar.propTypes = {
  currentPage: PropTypes.string.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  userRole: PropTypes.string,
  onClose: PropTypes.func,
};

export default PharmacistSidebar;
