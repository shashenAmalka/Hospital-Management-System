import React from 'react'
import PropTypes from 'prop-types'
import { UserIcon, SearchIcon, LogOutIcon } from 'lucide-react'
import NotificationDropdown from '../Laboratory/NotificationDropdown'

export function Header({
  currentPage,
  selectedPatientId,
  onLogout,
}) {
  //const userName = localStorage.getItem('user_name') 
  const userRole = localStorage.getItem('user_role') 
  
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard'
      case 'patients':
        return 'Patient List'
      case 'patientRegistration':
        return 'Patient Registration'
      case 'patientProfile':
        return 'Patient Profile'
      case 'patientVisitHistory':
        return 'Visit History'
      case 'admissionDischarge':
        return 'Admission & Discharge'
      case 'clinicalDocuments':
        return 'Clinical Documents'
      // Staff Management Pages
      case 'staffProfiles':
        return 'Staff Directory'
      case 'staffProfile':
        return 'Staff Profile'
      case 'staffForm':
        return 'Staff Form'
      case 'staffRoles':
        return 'Role Management'
      case 'scheduling':
        return 'Scheduling & Rosters'
      case 'leaveManagement':
        return 'Leave Management'
      case 'certifications':
        return 'Credential Management'
      // Lab Technician Pages
      case 'pendingOrders':
        return 'Pending Lab Orders'
      case 'specimenIntake':
        return 'Specimen Intake'
      case 'inProgress':
        return 'Tests In Progress'
      case 'resultEntry':
        return 'Result Entry'
      case 'verification':
        return 'Pending Verification'
      case 'labInventory':
        return 'Laboratory Inventory'
      case 'machineStatus':
        return 'Equipment Status'
      default:
        return 'Dashboard'
    }
  }
  
  return (
    <header className="bg-gradient-to-r from-white to-slate-50 shadow-lg border-b border-slate-200 z-10">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            {getPageTitle()}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {selectedPatientId
              ? `Patient ID: ${selectedPatientId}`
              : 'Welcome to HelaMed Hospital Management System'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search patients, staff..."
              className="pl-10 pr-4 py-2 w-64 border border-slate-300 rounded-xl text-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         bg-white shadow-sm transition-all duration-200 hover:shadow-md"
            />
            <SearchIcon
              size={18}
              className="absolute left-3 top-2.5 text-slate-400"
            />
          </div>
          
          {/* Notifications */}
          <NotificationDropdown />
          
          {/* User Profile */}
          <div className="flex items-center space-x-3 bg-white rounded-xl p-2 shadow-sm border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <UserIcon size={18} />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-slate-800">{localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name || 'Admin' : 'Admin'}</p>
              <p className="text-slate-500 text-xs bg-slate-100 px-2 py-0.5 rounded-full">{userRole}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors duration-200 group"
              title="Logout"
            >
              <LogOutIcon size={18} className="text-slate-500 group-hover:text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

Header.propTypes = {
  currentPage: PropTypes.string.isRequired,
  selectedPatientId: PropTypes.number,
  onLogout: PropTypes.func.isRequired
}
