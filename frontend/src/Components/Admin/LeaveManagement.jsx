import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeftIcon, FilterIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [activeTab, setActiveTab] = useState('Pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const filterRequestsByStatus = useCallback(() => {
    const filtered = leaveRequests.filter(request => request.status === activeTab)
    setFilteredRequests(filtered)
  }, [leaveRequests, activeTab])

  useEffect(() => {
    filterRequestsByStatus()
  }, [leaveRequests, activeTab, filterRequestsByStatus])

  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/leave/test')
      const result = await response.text()
      console.log('Connection test result:', result)
      alert('Backend connection test: ' + result)
    } catch (error) {
      console.error('Connection test failed:', error)
      alert('Backend connection failed: ' + error.message)
    }
  }

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Authentication required - Please login first')
        return
      }

      console.log('Fetching leave requests with token:', token ? 'Token exists' : 'No token')
      
      const response = await fetch('http://localhost:5000/api/leave/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`Failed to fetch leave requests: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Fetched leave requests:', data)
      setLeaveRequests(data)
      setError('')
    } catch (error) {
      console.error('Error fetching leave requests:', error)
      setError(`Failed to load leave requests: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewLeaveRequest = async (requestId, status, comments = '') => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(`http://localhost:5000/api/leave/review/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          approvalComments: comments
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update leave request')
      }

      await response.json()
      
      // Refresh the data after successful update
      await fetchLeaveRequests()
      
      alert(`Leave request ${status.toLowerCase()} successfully`)
    } catch (error) {
      console.error('Error updating leave request:', error)
      alert('Failed to update leave request')
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLeaveTypeBadgeColor = (leaveType) => {
    switch (leaveType) {
      case 'Sick Leave':
        return 'bg-blue-100 text-blue-800'
      case 'Annual Leave':
        return 'bg-green-100 text-green-800'
      case 'Personal Leave':
        return 'bg-yellow-100 text-yellow-800'
      case 'Emergency Leave':
        return 'bg-red-100 text-red-800'
      case 'Maternity/Paternity Leave':
        return 'bg-purple-100 text-purple-800'
      case 'Study Leave':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getAvatarColor = (index) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500']
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8 text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/admin"
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <ChevronLeftIcon size={20} />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
        </div>
        <div className="flex space-x-2">
          <button 
            className="border border-red-300 bg-red-50 text-red-700 px-4 py-2 rounded-md hover:bg-red-100 flex items-center"
            onClick={testConnection}
          >
            🔗 Test Connection
          </button>
          <button 
            className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center"
            onClick={fetchLeaveRequests}
          >
            🔄 Refresh
          </button>
          <button className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center">
            <FilterIcon size={18} className="mr-2" />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <h2 className="text-lg font-medium">Leave Management</h2>
          <p className="text-sm text-gray-500 ml-2">
            Manage staff leave requests, approvals, and availability status
          </p>
        </div>

        <div className="mb-6">
          <div className="flex border-b">
            <button 
              className={`px-4 py-2 font-medium ${
                activeTab === 'Pending' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('Pending')}
            >
              Pending Requests ({leaveRequests.filter(req => req.status === 'Pending').length})
            </button>
            <button 
              className={`px-4 py-2 font-medium ${
                activeTab === 'Approved' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('Approved')}
            >
              Approved ({leaveRequests.filter(req => req.status === 'Approved').length})
            </button>
            <button 
              className={`px-4 py-2 font-medium ${
                activeTab === 'Rejected' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('Rejected')}
            >
              Rejected ({leaveRequests.filter(req => req.status === 'Rejected').length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-12"></th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Staff
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Leave Type
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Duration
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Reason
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    No {activeTab.toLowerCase()} leave requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request, index) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="py-4 px-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium">S{index + 1}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full ${getAvatarColor(index)} flex items-center justify-center text-white`}>
                          <span className="font-medium">{getInitials(request.doctorName)}</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {request.doctorName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {request.doctorId?.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLeaveTypeBadgeColor(request.leaveType)}`}>
                        {request.leaveType}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div>{formatDate(request.startDate)} - {formatDate(request.endDate)}</div>
                      <div className="text-xs text-gray-500">({request.totalDays} days)</div>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="text-sm text-gray-900 truncate" title={request.reason}>
                        {request.reason}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {request.status === 'Pending' ? (
                          <>
                            <button 
                              className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-sm"
                              onClick={() => handleReviewLeaveRequest(request._id, 'Approved')}
                            >
                              Approve
                            </button>
                            <button 
                              className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm"
                              onClick={() => handleReviewLeaveRequest(request._id, 'Rejected')}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm">
                            View Details
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredRequests.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {filteredRequests.length} of {leaveRequests.length} leave requests
            </div>
            <div className="flex space-x-1">
              <button
                className="border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button className="bg-blue-600 text-white rounded-md px-3 py-1 hover:bg-blue-700">
                1
              </button>
              <button
                className="border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
                disabled
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaveManagement
