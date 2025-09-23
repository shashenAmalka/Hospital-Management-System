import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  FlaskConicalIcon,
  UserCogIcon,
  ClipboardListIcon,
  LogOutIcon,
} from 'lucide-react';

export function DoctorSidebar({ currentPage, setCurrentPage, userRole }) {
  const [expandedMenu, setExpandedMenu] = useState('patientManagement');

  // Define doctor-specific menu items
  const getDoctorMenuItems = () => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <HomeIcon size={20} />,
    },
    {
      id: 'patients',
      label: 'My Patients',
      icon: <UsersIcon size={20} />,
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: <CalendarIcon size={20} />,
      subMenu: [
        {
          id: 'appointmentScheduling',
          label: 'My Appointments',
        },
        {
          id: 'upcomingAppointments',
          label: 'Schedule Appointment',
        },
      ],
    },
    {
      id: 'laboratory',
      label: 'Laboratory',
      icon: <FlaskConicalIcon size={20} />,
      subMenu: [
        {
          id: 'labRequests',
          label: 'Order Tests',
        },
        {
          id: 'testResults',
          label: 'View Results',
        },
      ],
    },
    {
      id: 'selfService',
      label: 'Self Service',
      icon: <UserCogIcon size={20} />,
      subMenu: [
        {
          id: 'scheduling',
          label: 'My Roster',
        },
        {
          id: 'leaveManagement',
          label: 'Apply for Leave',
          href: '/doctor/apply-for-leave',
        },
        // {
        //   id: 'certifications',
        //   label: 'My Credentials',
        // },
      ],
    },
  ];

  const menuItems = getDoctorMenuItems();

  return (
    <aside className="w-64 bg-blue-700 text-white flex-shrink-0">
      <div className="p-4 flex items-center justify-center border-b border-blue-600">
        <FlaskConicalIcon className="mr-2" size={24} />
        <h1 className="text-xl font-bold">MediCare HMS</h1>
      </div>
      
      <div className="p-4 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 mb-2">
          <UserCogIcon size={24} />
        </div>
        <p className="font-medium">{localStorage.getItem('user_name') || 'Dr. User'}</p>
        <p className="text-sm text-blue-300">{userRole}</p>
      </div>

      <nav className="mt-2">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id} className="mb-1">
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
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('user_name');
            // Dispatch logout event before redirecting
            window.dispatchEvent(new Event('user-logout'));
            window.location.href = '/';
          }}
          className="flex items-center px-4 py-3 w-full text-left hover:bg-blue-800 transition-colors"
        >
          <LogOutIcon size={20} className="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

DoctorSidebar.propTypes = {
  currentPage: PropTypes.string.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  userRole: PropTypes.string.isRequired,
};

export default DoctorSidebar;