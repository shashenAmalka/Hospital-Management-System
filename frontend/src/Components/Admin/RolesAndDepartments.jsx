import React, { useState, useEffect } from 'react';
import { SearchIcon, FilterIcon, PlusIcon, EditIcon, Trash2Icon } from 'lucide-react';

const RolesAndDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [staff, setStaff] = useState([]);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchRoles();
    fetchStaff();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.data?.departments || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([
        { _id: '1', name: 'Cardiology', description: 'Heart and cardiovascular care', head: 'Dr. Sarah Johnson', positions: { 'Department Head': 1, 'Senior Cardiologist': 3, 'Cardiologist': 5, 'Cardiac Nurse': 8, 'Technician': 4 } },
        { _id: '2', name: 'Neurology', description: 'Brain and nervous system care', head: 'Dr. Michael Chen', positions: { 'Department Head': 1, 'Senior Neurologist': 2, 'Neurologist': 4, 'Neurology Nurse': 6, 'Technician': 3 } },
        { _id: '3', name: 'Pediatrics', description: 'Children healthcare', head: 'Dr. Robert Chen', positions: { 'Department Head': 1, 'Senior Pediatrician': 2, 'Pediatrician': 4, 'Pediatric Nurse': 6, 'Technician': 3 } },
        { _id: '4', name: 'Orthopedics', description: 'Bone and joint care', head: 'Dr. Maria Garcia', positions: { 'Department Head': 1, 'Senior Surgeon': 2, 'Orthopedic Surgeon': 4, 'Orthopedic Nurse': 6, 'Technician': 3 } },
        { _id: '5', name: 'Radiology', description: 'Medical imaging', head: 'Dr. David Wilson', positions: { 'Department Head': 1, 'Radiologist': 3, 'Head Nurse': 1, 'Radiology Nurse': 5, 'Technician': 4 } },
        { _id: '6', name: 'Emergency', description: 'Emergency medical services', head: 'Dr. Linda Brown', positions: { 'Department Head': 1, 'Senior Physician': 2, 'Emergency Physician': 4, 'Emergency Nurse': 8, 'Technician': 3 } }
      ]);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data.data?.roles || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([
        { _id: '1', name: 'Department Head', permissions: ['Full department access', 'Approve staff schedules', 'Approve leave requests', 'View department reports', 'Manage department budget'] },
        { _id: '2', name: 'Senior Specialist', permissions: ['Patient diagnosis and treatment', 'Supervise junior staff', 'Access to medical records', 'Limited budget approval'] }
      ]);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/staff');
      if (response.ok) {
        const data = await response.json();
        setStaff(data.data?.staff || []);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([
        { _id: '1', firstName: 'John', lastName: 'Smith', email: 'staff1@hospital.com', employeeId: 'EMP-1001', department: 'cardiology', role: 'cardiologist' },
        { _id: '2', firstName: 'Sarah', lastName: 'Johnson', email: 'staff2@hospital.com', employeeId: 'EMP-1002', department: 'neurology', role: 'neurologist' },
        { _id: '3', firstName: 'Robert', lastName: 'Chen', email: 'staff3@hospital.com', employeeId: 'EMP-1003', department: 'pediatrics', role: 'pediatrician' },
        { _id: '4', firstName: 'Maria', lastName: 'Garcia', email: 'staff4@hospital.com', employeeId: 'EMP-1004', department: 'orthopedics', role: 'orthopedic-surgeon' },
        { _id: '5', firstName: 'David', lastName: 'Wilson', email: 'staff5@hospital.com', employeeId: 'EMP-1005', department: 'radiology', role: 'head-nurse' },
        { _id: '6', firstName: 'Linda', lastName: 'Brown', email: 'staff6@hospital.com', employeeId: 'EMP-1006', department: 'emergency', role: 'emergency-physician' }
      ]);
    }
  };

  const handleSaveDepartment = async (departmentData) => {
    try {
      const url = editingDepartment 
        ? `http://localhost:5000/api/departments/${editingDepartment._id}`
        : 'http://localhost:5000/api/departments';
      
      const method = editingDepartment ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(departmentData)
      });

      if (response.ok) {
        fetchDepartments();
        setShowDepartmentForm(false);
        setEditingDepartment(null);
      }
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleSaveRole = async (roleData) => {
    try {
      const url = editingRole 
        ? `http://localhost:5000/api/roles/${editingRole._id}`
        : 'http://localhost:5000/api/roles';
      
      const method = editingRole ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleData)
      });

      if (response.ok) {
        fetchRoles();
        setShowRoleForm(false);
        setEditingRole(null);
      }
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleDeleteDepartment = async (departmentId, departmentName) => {
    if (window.confirm(`Are you sure you want to delete the ${departmentName} department? This action cannot be undone.`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/departments/${departmentId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchDepartments();
          console.log('Department deleted successfully');
        } else {
          console.error('Failed to delete department');
        }
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (window.confirm(`Are you sure you want to delete the ${roleName} role? This action cannot be undone.`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/roles/${roleId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchRoles();
          console.log('Role deleted successfully');
        } else {
          console.error('Failed to delete role');
        }
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const handleUpdateStaffAssignment = async (staffId, updates) => {
    try {
      const response = await fetch(`http://localhost:5000/api/staff/${staffId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        fetchStaff();
      }
    } catch (error) {
      console.error('Error updating staff assignment:', error);
    }
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || member.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
  };

  const formatDepartmentName = (dept) => dept.charAt(0).toUpperCase() + dept.slice(1);
  const formatRoleName = (role) => role.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800">Role Assignment</h1>
        </div>
        <div className="flex space-x-2">
          <button className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">
            Export
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-lg font-medium">Role Assignment</h2>
            <p className="text-sm text-gray-500">
              Assign staff to specific departments and roles within the hospital
            </p>
          </div>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-auto"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon size={16} className="text-gray-400" />
              </div>
            </div>
            <select 
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept.name.toLowerCase()}>
                  {dept.name}
                </option>
              ))}
            </select>
            <button className="border border-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 flex items-center">
              <FilterIcon size={16} className="mr-1" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Staff Member
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  ID
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Current Department
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Current Role
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Assign Department
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Assign Role
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50">
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <span className="font-medium">{getInitials(member.firstName, member.lastName)}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">{member.employeeId}</td>
                  <td className="py-4 px-4 whitespace-nowrap">{formatDepartmentName(member.department)}</td>
                  <td className="py-4 px-4 whitespace-nowrap">{formatRoleName(member.role)}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <select 
                      defaultValue={member.department}
                      onChange={(e) => handleUpdateStaffAssignment(member._id, { department: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept.name.toLowerCase()}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <select 
                      defaultValue={member.role}
                      onChange={(e) => handleUpdateStaffAssignment(member._id, { role: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="physician">Physician</option>
                      <option value="senior-physician">Senior Physician</option>
                      <option value="department-head">Department Head</option>
                      <option value="nurse">Nurse</option>
                      <option value="head-nurse">Head Nurse</option>
                      <option value="technician">Technician</option>
                      <option value="administrator">Administrator</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredStaff.length} staff members
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Department Structure</h3>
            <button 
              onClick={() => setShowDepartmentForm(true)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Department
            </button>
          </div>
          <div className="border rounded-lg">
            {departments.map((dept) => (
              <div key={dept._id} className="p-4 border-b last:border-b-0">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{dept.name} Department</h4>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setEditingDepartment(dept);
                        setShowDepartmentForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <EditIcon size={14} className="mr-1" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteDepartment(dept._id, dept.name)}
                      className="text-red-600 hover:text-red-800 text-sm flex items-center"
                    >
                      <Trash2Icon size={14} className="mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {dept.positions && Object.entries(dept.positions).map(([position, count]) => (
                    <div key={position} className="flex justify-between">
                      <span className="text-sm">{position}</span>
                      <span className="text-sm text-gray-500">{count} position{count !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Role Permissions</h3>
            <button 
              onClick={() => setShowRoleForm(true)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Role
            </button>
          </div>
          <div className="border rounded-lg">
            {roles.map((role) => (
              <div key={role._id} className="p-4 border-b last:border-b-0">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{role.name}</h4>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setEditingRole(role);
                        setShowRoleForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <EditIcon size={14} className="mr-1" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteRole(role._id, role.name)}
                      className="text-red-600 hover:text-red-800 text-sm flex items-center"
                    >
                      <Trash2Icon size={14} className="mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {role.permissions && role.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center">
                      <div className="h-4 w-4 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showDepartmentForm && (
        <DepartmentForm
          department={editingDepartment}
          onSave={handleSaveDepartment}
          onCancel={() => {
            setShowDepartmentForm(false);
            setEditingDepartment(null);
          }}
        />
      )}

      {showRoleForm && (
        <RoleForm
          role={editingRole}
          onSave={handleSaveRole}
          onCancel={() => {
            setShowRoleForm(false);
            setEditingRole(null);
          }}
        />
      )}
    </div>
  );
};

const DepartmentForm = ({ department, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: department?.name || '',
    description: department?.description || '',
    head: department?.head || '',
    positions: department?.positions || {}
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {department ? 'Edit Department' : 'Add New Department'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Head
            </label>
            <input
              type="text"
              value={formData.head}
              onChange={(e) => setFormData({...formData, head: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {department ? 'Update' : 'Add'} Department
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RoleForm = ({ role, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    permissions: role?.permissions || []
  });

  const availablePermissions = [
    'Full department access',
    'Approve staff schedules',
    'Approve leave requests',
    'View department reports',
    'Manage department budget',
    'Patient diagnosis and treatment',
    'Supervise junior staff',
    'Access to medical records',
    'Limited budget approval',
    'Equipment management',
    'Inventory management'
  ];

  const handlePermissionChange = (permission) => {
    const updatedPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission];
    setFormData({ ...formData, permissions: updatedPermissions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {role ? 'Edit Role' : 'Add New Role'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availablePermissions.map(permission => (
                <label key={permission} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission)}
                    onChange={() => handlePermissionChange(permission)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{permission}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {role ? 'Update' : 'Add'} Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RolesAndDepartments;