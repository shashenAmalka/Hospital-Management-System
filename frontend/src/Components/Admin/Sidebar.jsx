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
      id: 'inventoryPharmacy',
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
      id: 'appointmentsMenu',
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
      id: 'laboratoryMenu',
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
    <aside className="w-64 bg-gradient-to-b from-blue-700 via-blue-600 to-teal-700 text-white flex-shrink-0 flex flex-col shadow-2xl relative overflow-hidden">
      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-teal-500/20 animate-pulse"></div>
      
      {/* Header with gradient accent */}
      <div className="p-4 flex items-center justify-center border-b border-white/10 relative z-10 bg-gradient-to-r from-blue-600/30 to-teal-600/30 backdrop-blur-sm">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-white/20 to-white/10 mr-3 shadow-lg backdrop-blur-md">
          <FlaskConicalIcon size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold drop-shadow-lg">HelaMed HMS</h1>
      </div>
      
      {/* User Profile Section */}
      <div className="p-4 text-center border-b border-white/10 relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-white/20 to-white/5 mb-3 ring-4 ring-white/10 shadow-lg backdrop-blur-sm">
          <UserCogIcon size={28} />
        </div>
        <p className="font-semibold text-white drop-shadow-md">{getUserDisplayName()}</p>
        <p className="text-xs text-blue-100 font-medium mt-1 drop-shadow-sm">{getRoleDisplayName()}</p>
      </div>
      
      {/* Navigation Menu */}
      <nav className="mt-2 overflow-y-auto flex-1 px-2 py-2 relative z-10">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            // Check if current page is in this item's submenu
            const isActiveParent = item.subMenu && item.subMenu.some(subItem => subItem.id === currentPage);
            const isActiveDirect = currentPage === item.id;
            
            return (
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
                    }
                  }}
                  className={`flex items-center px-4 py-3 w-full text-left rounded-xl transition-all duration-300 group ${
                    isActiveDirect 
                      ? 'bg-gradient-to-r from-white/25 to-white/15 shadow-lg backdrop-blur-sm text-white font-semibold' 
                      : isActiveParent 
                      ? 'bg-white/10 text-white' 
                      : 'text-blue-50 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className={`mr-3 ${isActiveDirect ? 'text-white drop-shadow-lg' : 'text-blue-100'}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
                {item.subMenu && expandedMenu === item.id && (
                  <ul className="mt-1 ml-2 space-y-1 border-l-2 border-white/20 pl-2">
                    {item.subMenu.map((subItem) => (
                      <li key={subItem.id}>
                        <button
                          onClick={() => setCurrentPage(subItem.id)}
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
            );
          })}
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

Sidebar.propTypes = {
  currentPage: PropTypes.string.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  userRole: PropTypes.string.isRequired
};

export default Sidebar;
