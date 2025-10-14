import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  SearchIcon, FilterIcon, UserPlusIcon, ChevronDownIcon, RefreshCwIcon, 
  FileTextIcon, EyeIcon, PencilIcon, Trash2Icon
} from 'lucide-react';

export function StaffDirectory({ onSelectStaff, onAddStaff }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const fetchStaffMembers = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:5000/api/staff', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch staff members');
      }

      const data = await response.json();
      setStaffMembers(data.data?.staff || []);
      setError('');
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Failed to load staff members. Please try again later.');
      setStaffMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fallback to sample data if API call fails or for development
  const sampleStaffMembers = [
    {
      _id: 'S-0001',
      firstName: 'John',
      lastName: 'Smith',
      role: 'Cardiologist',
      department: 'Cardiology',
      status: 'Active',
      phoneNumber: '202-555-0121',
      email: 'john.smith@hospital.com',
      hireDate: '2018-05-15'
    },
    {
      _id: 'S-0002',
      firstName: 'Emily',
      lastName: 'Johnson',
      role: 'Pediatrician',
      department: 'Pediatrics',
      status: 'Active',
      phoneNumber: '202-555-0122',
      email: 'emily.johnson@hospital.com',
      hireDate: '2019-02-20'
    },
    {
      _id: 'S-0003',
      firstName: 'Sarah',
      lastName: 'Williams',
      role: 'Head Nurse',
      department: 'Emergency',
      status: 'Active',
      phoneNumber: '202-555-0123',
      email: 'sarah.williams@hospital.com',
      hireDate: '2017-11-10'
    },
    {
      _id: 'S-0004',
      firstName: 'Michael',
      lastName: 'Brown',
      role: 'Surgeon',
      department: 'Surgery',
      status: 'On Leave',
      phoneNumber: '202-555-0124',
      email: 'michael.brown@hospital.com',
      hireDate: '2015-08-05'
    },
    {
      _id: 'S-0005',
      firstName: 'Robert',
      lastName: 'Davis',
      role: 'Registered Nurse',
      department: 'Pediatrics',
      status: 'Active',
      phoneNumber: '202-555-0125',
      email: 'robert.davis@hospital.com',
      hireDate: '2020-03-15'
    }
  ];

  // Use sample data if API call returns empty
  const displayStaff = staffMembers.length > 0 ? staffMembers : sampleStaffMembers;
  
  const filteredStaff = displayStaff.filter(staff => {
    const fullName = `${staff.firstName} ${staff.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesDepartment = 
      departmentFilter === 'all' || staff.department === departmentFilter;
      
    return matchesSearch && matchesDepartment;
  });

  const departments = Array.from(
    new Set(displayStaff.map(staff => staff.department))
  ).sort();

  const handleRefresh = () => {
    fetchStaffMembers();
  };

  const handleDeleteStaff = async (staffId, staffName) => {
    if (window.confirm(`Are you sure you want to delete ${staffName}? This action cannot be undone.`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/staff/${staffId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchStaffMembers();
          console.log('Staff member deleted successfully');
        } else {
          console.error('Failed to delete staff member');
        }
      } catch (error) {
        console.error('Error deleting staff member:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Staff Directory</h1>
        <button 
          onClick={onAddStaff}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <UserPlusIcon size={18} className="mr-2" />
          Add New Staff
        </button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">Total Staff</p>
          <p className="text-2xl font-bold">{displayStaff.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {displayStaff.filter(s => s.status === 'Active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">On Leave</p>
          <p className="text-2xl font-bold text-amber-600">
            {displayStaff.filter(s => s.status === 'On Leave').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">Inactive</p>
          <p className="text-2xl font-bold text-gray-500">
            {displayStaff.filter(s => s.status === 'Inactive').length}
          </p>
        </div>
      </div>
      
      {/* Today's Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-3 md:col-span-1 bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Today's Schedule</h2>
          </div>
          
          <div className="p-4">
            <div className="mb-4 pb-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-700 mb-1">Morning Shift (7AM - 3PM)</h3>
              <p className="text-sm text-gray-500">12 staff members</p>
            </div>
            
            <div className="mb-4 pb-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-700 mb-1">Evening Shift (3PM - 11PM)</h3>
              <p className="text-sm text-gray-500">10 staff members</p>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-1">Night Shift (11PM - 7AM)</h3>
              <p className="text-sm text-gray-500">8 staff members</p>
            </div>
            
            <button className="w-full mt-2 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors">
              View Full Schedule
            </button>
          </div>
        </div>
        
        {/* Pending Requests */}
        <div className="col-span-3 md:col-span-2 bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Pending Requests</h2>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-3 border rounded-lg bg-amber-50 border-amber-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-amber-800">Leave Requests</h3>
                  <span className="px-2 py-1 bg-amber-200 text-amber-800 rounded-full text-xs font-bold">5 Pending</span>
                </div>
                <button className="w-full mt-1 py-1 bg-white text-amber-700 border border-amber-300 rounded-md text-xs font-medium hover:bg-amber-100 transition-colors">
                  Review
                </button>
              </div>
              
              <div className="p-3 border rounded-lg bg-red-50 border-red-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-red-800">Credential Updates</h3>
                  <span className="px-2 py-1 bg-red-200 text-red-800 rounded-full text-xs font-bold">3 Expiring</span>
                </div>
                <button className="w-full mt-1 py-1 bg-white text-red-700 border border-red-300 rounded-md text-xs font-medium hover:bg-red-100 transition-colors">
                  Review
                </button>
              </div>
              
              <div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-blue-800">Shift Swaps</h3>
                  <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-bold">2 Pending</span>
                </div>
                <button className="w-full mt-1 py-1 bg-white text-blue-700 border border-blue-300 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors">
                  Review
                </button>
              </div>
            </div>
            
            <button className="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
              Review All Requests
            </button>
          </div>
        </div>
      </div>
      
      {/* Staff List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FilterIcon size={16} className="mr-2" />
                Department: {departmentFilter === 'all' ? 'All' : departmentFilter}
                <ChevronDownIcon size={16} className="ml-2" />
              </button>
              
              {filterOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setDepartmentFilter('all');
                        setFilterOpen(false);
                      }}
                      className={`block px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${
                        departmentFilter === 'all' ? 'bg-gray-100 text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      All Departments
                    </button>
                    {departments.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => {
                          setDepartmentFilter(dept);
                          setFilterOpen(false);
                        }}
                        className={`block px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${
                          departmentFilter === dept ? 'bg-gray-100 text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button 
              onClick={handleRefresh}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              <RefreshCwIcon size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-3 text-gray-500">Loading staff members...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((staff) => (
                      <tr key={staff._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {staff._id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
                                {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {staff.firstName} {staff.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {staff.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {staff.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {staff.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            staff.status === 'Active' ? 'bg-green-100 text-green-800' :
                            staff.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {staff.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {staff.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2 justify-end">
                            <button className="text-blue-600 hover:text-blue-900">
                              <EyeIcon size={16} />
                            </button>
                            <button 
                              onClick={() => onSelectStaff(staff)} 
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <PencilIcon size={16} />
                            </button>
                            <button className="text-blue-600 hover:text-blue-900">
                              <FileTextIcon size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteStaff(staff._id, `${staff.firstName} ${staff.lastName}`)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2Icon size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No staff members found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

StaffDirectory.propTypes = {
  onSelectStaff: PropTypes.func.isRequired,
  onAddStaff: PropTypes.func.isRequired
};

export default StaffDirectory;
