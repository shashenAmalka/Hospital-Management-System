import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download
} from 'lucide-react';
import LeaveForm from './LeaveForm';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const API_BASE_URL = 'http://localhost:5000/api';

  // Fetch leave requests
  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/leave/my-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeaves(data);
        setFilteredLeaves(data);
      } else {
        console.error('Failed to fetch leave requests');
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Filter leaves based on status and type
  useEffect(() => {
    let filtered = leaves;

    if (statusFilter !== 'All') {
      filtered = filtered.filter(leave => leave.status === statusFilter);
    }

    if (typeFilter !== 'All') {
      filtered = filtered.filter(leave => leave.leaveType === typeFilter);
    }

    setFilteredLeaves(filtered);
  }, [leaves, statusFilter, typeFilter]);

  // Submit new leave request
  const handleSubmitLeave = async (submitData) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingLeave 
        ? `${API_BASE_URL}/leave/request/${editingLeave._id}`
        : `${API_BASE_URL}/leave/request`;
      
      const method = editingLeave ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        await fetchLeaves();
        setIsFormOpen(false);
        setEditingLeave(null);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('An error occurred while submitting the leave request');
    }
  };

  // Delete leave request
  const handleDeleteLeave = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave request?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/leave/request/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchLeaves();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete leave request');
      }
    } catch (error) {
      console.error('Error deleting leave request:', error);
      alert('An error occurred while deleting the leave request');
    }
  };

  // Open edit form
  const handleEditLeave = (leave) => {
    setEditingLeave(leave);
    setIsFormOpen(true);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      'Approved': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Rejected': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig['Pending'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon size={12} className="mr-1" />
        {status}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get unique leave types for filter
  const leaveTypes = [...new Set(leaves.map(leave => leave.leaveType))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
          <p className="text-gray-600">Manage your leave requests</p>
        </div>
        <button
          onClick={() => {
            setEditingLeave(null);
            setIsFormOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Apply for Leave
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Types</option>
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredLeaves.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
            <p className="text-gray-500 mb-4">
              {leaves.length === 0 
                ? "You haven't submitted any leave requests yet." 
                : "No leave requests match your current filters."
              }
            </p>
            <button
              onClick={() => {
                setEditingLeave(null);
                setIsFormOpen(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply for Leave
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{leave.leaveType}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs" title={leave.reason}>
                        {leave.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{leave.totalDays} days</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(leave.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(leave.submittedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {leave.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleEditLeave(leave)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteLeave(leave._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        <button
                          className="text-gray-600 hover:text-gray-900 p-1 rounded"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaves.filter(l => l.status === 'Pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Approved Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaves.filter(l => l.status === 'Approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Days Requested</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaves.reduce((total, leave) => total + leave.totalDays, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Form Modal */}
      <LeaveForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingLeave(null);
        }}
        onSubmit={handleSubmitLeave}
        editingLeave={editingLeave}
      />
    </div>
  );
};

export default LeaveManagement;