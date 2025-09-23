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
} from 'lucide-react';

export function PharmacistSidebar({ currentPage, setCurrentPage, userRole }) {
  const [expandedMenu, setExpandedMenu] = useState('inventory');

  // Define pharmacist-specific menu items
  const getPharmacistMenuItems = () => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <HomeIcon size={20} />,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Package size={20} />,
      
    },
    {
      id: 'prescription',
      label: 'Prescriptions',
      icon: <FileText size={20} />,
      
    },
    {
      id: 'suppliers',
      label: 'Suppliers',
      icon: <Truck size={20} />,
      subMenu: [
        {
          id: 'supplier-list',
          label: 'Supplier Directory'
        },
        {
          id: 'supplier-items',
          label: 'Supplier Items'
        }
      ]
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
    <aside className="w-64 bg-blue-700 text-white flex-shrink-0">
      <div className="p-4 flex items-center justify-center border-b border-blue-600">
        <FlaskConicalIcon className="mr-2" size={24} />
        <h1 className="text-xl font-bold">HelaMed HMS</h1>
      </div>
      
      <div className="p-4 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 mb-2">
          <Package size={24} />
        </div>
        <p className="font-medium">{localStorage.getItem('user_name') || 'Pharmacist'}</p>
        <p className="text-sm text-blue-300">{userRole || 'Pharmacist'}</p>
      </div>

      <nav className="mt-2">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id} className="mb-1">
              {item.id === 'dashboard' ? (
                <div className="flex items-center px-4 py-3 w-full text-left bg-blue-800 cursor-default">
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (item.subMenu) {
                      setExpandedMenu(expandedMenu === item.id ? null : item.id);
                    } else {
                      setCurrentPage(item.id);
                    }
                  }}
                  className={`flex items-center px-4 py-3 w-full text-left hover:bg-blue-800 transition-colors ${
                    currentPage === item.id ? 'bg-blue-800' : ''
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              )}
              {item.subMenu && expandedMenu === item.id && (
                <ul className="bg-blue-800 py-2">
                  {item.subMenu.map((subItem) => (
                    <li key={subItem.id}>
                      <button
                        onClick={() => setCurrentPage(subItem.id)}
                        className={`flex items-center px-4 py-2 pl-12 w-full text-left hover:bg-blue-900 transition-colors ${
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

      <div className="absolute bottom-0 w-64 border-t border-blue-600">
        <button 
          onClick={handleLogout}
          className="flex items-center px-4 py-3 w-full text-left hover:bg-blue-800 transition-colors"
        >
          <LogOutIcon size={20} className="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

PharmacistSidebar.propTypes = {
  currentPage: PropTypes.string.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  userRole: PropTypes.string,
};

export default PharmacistSidebar;
