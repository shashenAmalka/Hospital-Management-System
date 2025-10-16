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
    <aside className="w-64 bg-gradient-to-b from-blue-700 via-blue-600 to-teal-700 text-white flex-shrink-0 h-screen flex flex-col shadow-2xl relative overflow-hidden">
      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-teal-500/20 animate-pulse"></div>
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/10 relative z-10 bg-gradient-to-r from-blue-600/30 to-teal-600/30 backdrop-blur-sm">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-white/20 to-white/10 mr-3 shadow-lg backdrop-blur-md">
            <FlaskConicalIcon size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold drop-shadow-lg">HelaMed HMS</h1>
        </div>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden text-white/90 hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* User Info */}
      <div className="p-4 text-center border-b border-white/10 relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-white/20 to-white/5 mb-3 ring-4 ring-white/10 shadow-lg backdrop-blur-sm">
          <Package size={28} />
        </div>
        <p className="font-semibold text-white drop-shadow-md">{localStorage.getItem('user_name') || 'Pharmacist'}</p>
        <p className="text-xs text-blue-100 font-medium mt-1 drop-shadow-sm">{userRole || 'Pharmacist'}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 relative z-10">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  if (item.subMenu) {
                    // Toggle expansion
                    const newExpandedState = expandedMenu === item.id ? null : item.id;
                    setExpandedMenu(newExpandedState);
                    // Navigate to first submenu item when expanding
                    if (newExpandedState === item.id && item.subMenu.length > 0) {
                      setCurrentPage(item.subMenu[0].id);
                    }
                  } else {
                    setCurrentPage(item.id);
                    setExpandedMenu(null);
                    if (onClose) onClose(); // Close sidebar on mobile after selection
                  }
                }}
                className={`flex items-center px-4 py-3 w-full text-left rounded-xl transition-all duration-300 group ${
                  currentPage === item.id 
                    ? 'bg-gradient-to-r from-white/25 to-white/15 shadow-lg backdrop-blur-sm text-white font-semibold' 
                    : 'text-blue-50 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className={`mr-3 ${currentPage === item.id ? 'text-white drop-shadow-lg' : 'text-blue-100'}`}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
              {item.subMenu && expandedMenu === item.id && (
                <ul className="mt-1 ml-2 space-y-1 border-l-2 border-white/20 pl-2">
                  {item.subMenu.map((subItem) => (
                    <li key={subItem.id}>
                      <button
                        onClick={() => {
                          setCurrentPage(subItem.id);
                          if (onClose) onClose(); // Close sidebar on mobile after selection
                        }}
                        className={`flex items-center px-4 py-2.5 w-full text-left rounded-lg transition-all duration-200 ${
                          currentPage === subItem.id 
                            ? 'bg-gradient-to-r from-white/20 to-white/10 text-white border-l-2 border-white/40 shadow-sm font-medium' 
                            : 'text-blue-100 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="text-sm ml-1">{subItem.label}</span>
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
      <div className="border-t border-white/10 p-3 relative z-10">
        <button 
          onClick={handleLogout}
          className="flex items-center px-4 py-3 w-full text-left rounded-xl bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-400/30 text-red-100 hover:from-red-600 hover:to-rose-600 hover:text-white hover:shadow-lg transition-all duration-300 group"
        >
          <LogOutIcon size={20} className="mr-3 group-hover:rotate-12 transition-transform duration-200" />
          <span className="font-semibold text-sm">Logout</span>
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
