import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  HomeIcon,
  UsersIcon,
  PackageIcon,
  CalendarIcon,
  FlaskConicalIcon,
  UserCogIcon,
  ClipboardListIcon,
  LogOutIcon,
  BedIcon,
  CheckSquareIcon,
} from 'lucide-react';

export function Sidebar({ currentPage, setCurrentPage, userRole }) {
  const [expandedMenu, setExpandedMenu] = useState(() => {
    // Set default expanded menu based on role
    switch (userRole) {
      case 'doctor':
        return 'patientManagement';
      case 'nurse':
        return 'wardManagement';
      case 'lab_technician':
        return 'labOrders';
      case 'admin':
      case 'Admin':
        return 'staffManagement';
      default:
        return 'staffManagement';
    }
  });
  
  // Define role-specific menu items
  const getDoctorMenuItems = () => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <HomeIcon size={20} />,
    },
    {
      id: 'patientManagement',
      label: 'Patient Management',
      icon: <UsersIcon size={20} />,
      subMenu: [
        {
          id: 'patients',
          label: 'My Patients',
        },
        {
          id: 'patientRegistration',
          label: 'Patient Registration',
        },
      ],
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
        },
        {
          id: 'certifications',
          label: 'My Credentials',
        },
      ],
    },
  ];

  const getNurseMenuItems = () => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <HomeIcon size={20} />,
    },
    {
      id: 'wardManagement',
      label: 'Ward Management',
      icon: <BedIcon size={20} />,
      subMenu: [
        {
          id: 'wardBoard',
          label: 'Ward/Bed Board',
        },
        {
          id: 'discharges',
          label: 'Pending Discharges',
        },
      ],
    },
    {
      id: 'taskManagement',
      label: 'Task Management',
      icon: <CheckSquareIcon size={20} />,
      subMenu: [
        {
          id: 'taskList',
          label: 'Task List',
        },
        {
          id: 'vitalsRecording',
          label: 'Record Vitals',
        },
        {
          id: 'medicationAdmin',
          label: 'Medication Admin',
        },
      ],
    },
    {
      id: 'patientManagement',
      label: 'Patient Management',
      icon: <UsersIcon size={20} />,
      subMenu: [
        {
          id: 'patients',
          label: 'Patient List',
        },
        {
          id: 'nursingNotes',
          label: 'Nursing Notes',
        },
      ],
    },
    {
      id: 'handover',
      label: 'Handover',
      icon: <ClipboardListIcon size={20} />,
      subMenu: [
        {
          id: 'viewHandover',
          label: 'View Handover Notes',
        },
        {
          id: 'createHandover',
          label: 'Create Handover',
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
        },
      ],
    },
  ];

  const getLabTechMenuItems = () => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <HomeIcon size={20} />,
    },
    {
      id: 'labOrders',
      label: 'Lab Orders',
      icon: <ClipboardListIcon size={20} />,
      subMenu: [
        {
          id: 'pendingOrders',
          label: 'Pending Orders',
        },
        {
          id: 'specimenIntake',
          label: 'Patient Lab Requests',
        },
      ],
    },
    {
      id: 'testProcessing',
      label: 'Test Processing',
      icon: <FlaskConicalIcon size={20} />,
      subMenu: [
        {
          id: 'inProgress',
          label: 'Tests In Progress',
        },
        {
          id: 'resultEntry',
          label: 'Completed Tests',
        },
        // {
        //   id: 'verification',
        //   label: 'Pending Verification',
        // },
      ],
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <PackageIcon size={20} />,
      subMenu: [
        {
          id: 'labInventory',
          label: 'Lab Inventory',
        },
        {
          id: 'machineStatus',
          label: 'Equipment Status',
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
        },
      ],
    },
  ];

  const getAdminMenuItems = () => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <HomeIcon size={20} />,
    },
    {
      id: 'patientManagement',
      label: 'Patient Management',
      icon: <UsersIcon size={20} />,
      subMenu: [
        {
          id: 'patients',
          label: 'Patient List',
        },
        {
          id: 'patientRegistration',
          label: 'Patient Registration',
        },
      ],
    },
    {
      id: 'staffManagement',
      label: 'Doctor & Staff',
      icon: <UserCogIcon size={20} />,
      subMenu: [
        {
          id: 'staffProfiles',
          label: 'Staff Profiles',
        },
        {
          id: 'staffRoles',
          label: 'Roles & Departments',
        },
        {
          id: 'scheduling',
          label: 'Shift Scheduling',
        },
        {
          id: 'leaveManagement',
          label: 'Leave Management',
        },
        {
          id: 'certifications',
          label: 'Certifications',
        },
      ],
    },
    {
      id: 'inventory',
      label: 'Inventory & Pharmacy',
      icon: <PackageIcon size={20} />,
      subMenu: [
        {
          id: 'inventory',
          label: 'Inventory',
        },
        {
          id: 'prescription',
          label: 'Prescriptions',
        },
        {
          id: 'suppliers',
          label: 'Suppliers',
        },
        {
          id: 'reports',
          label: 'Reports',
        },
      ],
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: <CalendarIcon size={20} />,
      subMenu: [
        {
          id: 'appointmentScheduling',
          label: 'Schedule Appointment',
        },
        {
          id: 'doctorAllocation',
          label: 'Doctor Allocation',
        },
        {
          id: 'upcomingAppointments',
          label: 'My Appointments',
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
          label: 'Test Requests',
        },
        {
          id: 'testResults',
          label: 'Test Results',
        },
        {
          id: 'labReports',
          label: 'Lab Reports',
        },
      ],
    },
  ];

  // Get menu items based on role
  const getMenuItems = () => {
    switch (userRole) {
      case 'doctor':
        return getDoctorMenuItems();
      case 'nurse':
        return getNurseMenuItems();
      case 'lab_technician':
        return getLabTechMenuItems();
      case 'admin':
      case 'Admin':
        return getAdminMenuItems();
      default:
        return getAdminMenuItems();
    }
  };

  const menuItems = getMenuItems();
  
  // Auto-expand menu that contains the current page
  useEffect(() => {
    const parentMenu = menuItems.find(item => 
      item.subMenu && item.subMenu.some(subItem => subItem.id === currentPage)
    );
    
    if (parentMenu && expandedMenu !== parentMenu.id) {
      setExpandedMenu(parentMenu.id);
    }
  }, [currentPage, menuItems, expandedMenu]);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Function to get user display name
  const getUserDisplayName = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.name || 
               (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '') ||
               user.firstName || 
               user.email || 
               'User';
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return 'User';
  };

  // Function to get role display name
  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'lab_technician':
        return 'Lab Technician';
      case 'doctor':
        return 'Doctor';
      case 'nurse':
        return 'Nurse';
      case 'admin':
      case 'Admin':
        return 'Administrator';
      default:
        return userRole || 'User';
    }
  };

  return (
    <aside className="w-64 bg-blue-700 text-white flex-shrink-0 flex flex-col">
      <div className="p-4 flex items-center justify-center border-b border-blue-600">
        <FlaskConicalIcon className="mr-2" size={24} />
        <h1 className="text-xl font-bold">HelaMed HMS</h1>
      </div>
      <div className="p-4 text-center border-b border-blue-600">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 mb-2">
          <UserCogIcon size={24} />
        </div>
        <p className="font-medium">{getUserDisplayName()}</p>
        <p className="text-sm text-blue-300">{getRoleDisplayName()}</p>
      </div>
      <nav className="mt-2 overflow-y-auto flex-1">
        <ul>
          {menuItems.map((item) => {
            // Check if current page is in this item's submenu
            const isActiveParent = item.subMenu && item.subMenu.some(subItem => subItem.id === currentPage);
            const isActiveDirect = currentPage === item.id;
            
            return (
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
                    isActiveDirect ? 'bg-blue-800' : isActiveParent ? 'bg-blue-600' : ''
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
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-blue-600">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-3 w-full text-left rounded-xl hover:bg-red-600 text-slate-300 hover:text-white transition-all duration-200 group"
        >
          <LogOutIcon size={20} className="mr-3 text-red-400 group-hover:text-white" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  currentPage: PropTypes.string.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  userRole: PropTypes.string.isRequired
};

export default Sidebar;
