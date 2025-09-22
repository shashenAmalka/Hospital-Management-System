import React, { useState, useEffect } from 'react'
import { ChevronLeftIcon, FilterIcon, X, Eye, Download, Trash2, Calendar, AlertTriangle, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const Certifications = () => {
  const [certifications, setCertifications] = useState([])
  const [staffMembers, setStaffMembers] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    'expiring-soon': 0,
    expired: 0
  })
  const [formData, setFormData] = useState({
    staffId: '',
    certificationName: '',
    certificationType: '',
    issuingAuthority: '',
    issueDate: '',
    expiryDate: '',
    certificationNumber: '',
    notes: ''
  })
  const [selectedFile, setSelectedFile] = useState(null)

  // Handle file selection with validation
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        e.target.value = '';
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF, JPG, and PNG files are allowed');
        e.target.value = '';
        return;
      }
      
      setSelectedFile(file);
    }
  }

  // Fetch certifications based on active tab
  const fetchCertifications = async (status = 'all') => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/certifications?status=${status}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const certArray = data.data?.certifications || []
        setCertifications(Array.isArray(certArray) ? certArray : [])
        setStats(data.data?.statusSummary || {
          total: 0,
          valid: 0,
          'expiring-soon': 0,
          expired: 0
        })
      } else {
        console.error('Failed to fetch certifications')
        setCertifications([])
      }
    } catch (error) {
      console.error('Error fetching certifications:', error)
      setCertifications([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch staff members for dropdown
  const fetchStaffMembers = async () => {
    try {
      console.log('Fetching staff members...');
      const token = localStorage.getItem('token')
      console.log('Token found:', !!token);
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Making request to:', 'http://localhost:5000/api/staff');
      console.log('Headers:', headers);
      
      const response = await fetch('http://localhost:5000/api/staff', {
        headers: headers
      })
      
      console.log('Staff response status:', response.status);
      console.log('Staff response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json()
        console.log('Full Staff data received:', data);
        const staffArray = data.data?.staff || []
        console.log('Staff array length:', staffArray.length);
        console.log('First staff member:', staffArray[0]);
        setStaffMembers(Array.isArray(staffArray) ? staffArray : [])
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch staff members:', response.status, errorData)
        setStaffMembers([])
      }
    } catch (error) {
      console.error('Error fetching staff members:', error)
      setStaffMembers([])
    }
  }

  useEffect(() => {
    fetchCertifications(activeTab)
    fetchStaffMembers()
  }, [activeTab])

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get status badge
  const getStatusBadge = (certification) => {
    const daysUntilExpiry = getDaysUntilExpiry(certification.expiryDate)
    
    if (daysUntilExpiry < 0) {
      return (
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300 shadow-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
          Expired
        </span>
      )
    } else if (daysUntilExpiry <= 60) {
      return (
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-amber-100 to-yellow-200 text-amber-800 border border-amber-300 shadow-sm">
          <div className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></div>
          Expiring Soon
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 border border-green-300 shadow-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Valid
        </span>
      )
    }
  }

  // Get status icon
  const getStatusIcon = (certification) => {
    const daysUntilExpiry = getDaysUntilExpiry(certification.expiryDate)
    
    if (daysUntilExpiry < 0) {
      return <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-300 shadow-lg">
        <X className="h-6 w-6 text-red-600" />
      </div>
    } else if (daysUntilExpiry <= 60) {
      return <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-200 border-2 border-amber-300 shadow-lg">
        <AlertTriangle className="h-6 w-6 text-amber-600" />
      </div>
    } else {
      return <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-200 border-2 border-green-300 shadow-lg">
        <CheckCircle className="h-6 w-6 text-green-600" />
      </div>
    }
  }

  // Format expiry date display
  const formatExpiryDisplay = (expiryDate) => {
    const daysUntilExpiry = getDaysUntilExpiry(expiryDate)
    const formattedDate = new Date(expiryDate).toLocaleDateString()
    
    if (daysUntilExpiry < 0) {
      const monthsAgo = Math.abs(Math.floor(daysUntilExpiry / 30))
      return `${formattedDate} (${monthsAgo} months ago)`
    } else if (daysUntilExpiry <= 60) {
      return `${formattedDate} (${daysUntilExpiry} days remaining)`
    } else {
      return formattedDate
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      console.log('Submitting certification with data:', formData);
      
      // Validate staff selection
      if (!formData.staffId) {
        alert('Please select a staff member');
        return;
      }
      
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }
      
      // Create FormData object for file upload
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      // Add file if selected
      if (selectedFile) {
        submitData.append('certificationFile', selectedFile);
      }
      
      const response = await fetch('http://localhost:5000/api/certifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type header for FormData - browser will set it automatically with boundary
        },
        body: submitData
      })
      
      console.log('Certification response status:', response.status);
      console.log('Certification response headers:', response.headers);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Response:', responseData);
        
        setIsUploadModalOpen(false)
        setFormData({
          staffId: '',
          certificationName: '',
          certificationType: '',
          issuingAuthority: '',
          issueDate: '',
          expiryDate: '',
          certificationNumber: '',
          notes: ''
        })
        setSelectedFile(null)
        fetchCertifications(activeTab)
        alert('Certification uploaded successfully!')
      } else {
        let errorMessage = 'Failed to upload certification';
        try {
          const responseText = await response.text();
          console.log('Error response text:', responseText);
          
          // Try to parse as JSON
          try {
            const responseData = JSON.parse(responseText);
            errorMessage = responseData.message || errorMessage;
          } catch (jsonError) {
            // If not JSON, check if it's HTML error page
            if (responseText.includes('<!DOCTYPE')) {
              errorMessage = 'Server error - please check server logs';
            } else {
              errorMessage = responseText || errorMessage;
            }
          }
        } catch (textError) {
          console.error('Error reading response:', textError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error uploading certification:', error)
      alert('Error uploading certification: ' + error.message)
    }
  }

  // Delete certification
  const deleteCertification = async (id) => {
    if (window.confirm('Are you sure you want to delete this certification?')) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:5000/api/certifications/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          fetchCertifications(activeTab)
          alert('Certification deleted successfully!')
        } else {
          alert('Failed to delete certification')
        }
      } catch (error) {
        console.error('Error deleting certification:', error)
        alert('Error deleting certification')
      }
    }
  }

  // Get filtered certifications
  const getFilteredCertifications = () => {
    if (!Array.isArray(certifications)) return []
    if (activeTab === 'all') return certifications
    
    return certifications.filter(cert => {
      const daysUntilExpiry = getDaysUntilExpiry(cert.expiryDate)
      
      switch (activeTab) {
        case 'valid':
          return daysUntilExpiry > 60
        case 'expiring-soon':
          return daysUntilExpiry > 0 && daysUntilExpiry <= 60
        case 'expired':
          return daysUntilExpiry < 0
        default:
          return true
      }
    })
  }

  const filteredCertifications = getFilteredCertifications()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header Section - 60% Dominant (Light background) */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link
            to="/admin"
            className="flex items-center text-blue-600 hover:text-blue-800 mr-6 transition-colors duration-200 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
          >
            <ChevronLeftIcon size={20} />
            <span className="ml-1 font-medium">Back to Dashboard</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Certification Management</h1>
            <p className="text-slate-600 mt-1">Manage professional certifications and licenses</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="border border-slate-300 bg-white text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-50 flex items-center transition-all duration-200 shadow-sm hover:shadow-md">
            <FilterIcon size={18} className="mr-2" />
            Filter
          </button>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="mr-2">+</span>
            Upload Certification
          </button>
        </div>
      </div>

      {/* Main Content Card - 30% Secondary (White background with subtle color) */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-slate-100 to-blue-100 p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Professional Certifications</h2>
              <p className="text-slate-600 mt-1">
                Track, verify, and manage staff certifications and licenses
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="text-sm text-slate-600">Total Certifications</span>
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Tabs - 10% Accent */}
        <div className="px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'all' 
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white'
              }`}
            >
              All <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">{stats.total}</span>
            </button>
            <button 
              onClick={() => setActiveTab('valid')}
              className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'valid' 
                  ? 'bg-green-600 text-white shadow-lg transform scale-105' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white'
              }`}
            >
              Valid <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">{stats.valid}</span>
            </button>
            <button 
              onClick={() => setActiveTab('expiring-soon')}
              className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'expiring-soon' 
                  ? 'bg-amber-500 text-white shadow-lg transform scale-105' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white'
              }`}
            >
              Expiring Soon <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">{stats['expiring-soon']}</span>
            </button>
            <button 
              onClick={() => setActiveTab('expired')}
              className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'expired' 
                  ? 'bg-red-500 text-white shadow-lg transform scale-105' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white'
              }`}
            >
              Expired <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">{stats.expired}</span>
            </button>
          </div>
        </div>

        {/* Certifications List */}
        <div className="p-6 space-y-4">
          {filteredCertifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-slate-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-12 w-12 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg">No certifications found for the selected filter.</p>
              <p className="text-slate-400 text-sm mt-2">Try selecting a different tab or add new certifications.</p>
            </div>
          ) : (
            filteredCertifications.map((cert) => (
              <div key={cert._id} className="group border border-slate-200 rounded-xl hover:shadow-lg transition-all duration-200 hover:border-blue-200 bg-white overflow-hidden">
                <div className="p-6 flex items-start">
                  <div className="flex-shrink-0 w-12 text-center mr-6">
                    {getStatusIcon(cert)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 hover:text-blue-600 cursor-pointer transition-colors flex items-center">
                          {cert.certificationName}
                          {cert.documentUrl && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Download className="h-3 w-3 mr-1" />
                              Document
                            </span>
                          )}
                        </h3>
                        <p className="text-slate-600 mt-1 flex items-center">
                          <span className="font-medium">{cert.staffName}</span>
                          <span className="mx-2">•</span>
                          <span className="bg-slate-100 px-3 py-1 rounded-full text-sm">
                            {cert.certificationType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </p>
                      </div>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                          <Eye className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => {
                            if (cert.documentUrl) {
                              window.open(`http://localhost:5000${cert.documentUrl}`, '_blank');
                            } else {
                              alert('No document available for this certification');
                            }
                          }}
                          className={`p-2 transition-all duration-200 ${
                            cert.documentUrl 
                              ? 'text-slate-400 hover:text-green-600 hover:bg-green-50 cursor-pointer' 
                              : 'text-slate-300 cursor-not-allowed'
                          } rounded-lg`}
                          disabled={!cert.documentUrl}
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => deleteCertification(cert._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-slate-500 text-sm font-medium">Issue Date</p>
                        <p className="text-slate-800 font-semibold">{new Date(cert.issueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-slate-500 text-sm font-medium">Expiry Date</p>
                        <p className="text-slate-800 font-semibold">{formatExpiryDisplay(cert.expiryDate)}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-slate-500 text-sm font-medium">Issuing Authority</p>
                        <p className="text-slate-800 font-semibold">{cert.issuingAuthority}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      {getStatusBadge(cert)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Statistics and Expiring Soon Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Certification Status Overview */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-100 to-blue-100 p-6 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-800">Certification Overview</h3>
            <p className="text-slate-600 mt-1">Current status distribution</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="group hover:bg-green-50 p-4 rounded-xl transition-all duration-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="h-4 w-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3 shadow-sm"></div>
                    <span className="text-sm font-semibold text-slate-700">Valid Certifications</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{stats.valid}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${stats.total > 0 ? (stats.valid / stats.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="group hover:bg-amber-50 p-4 rounded-xl transition-all duration-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="h-4 w-4 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full mr-3 shadow-sm"></div>
                    <span className="text-sm font-semibold text-slate-700">Expiring Soon</span>
                  </div>
                  <span className="text-lg font-bold text-amber-600">{stats['expiring-soon']}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${stats.total > 0 ? (stats['expiring-soon'] / stats.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="group hover:bg-red-50 p-4 rounded-xl transition-all duration-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="h-4 w-4 bg-gradient-to-r from-red-400 to-red-500 rounded-full mr-3 shadow-sm"></div>
                    <span className="text-sm font-semibold text-slate-700">Expired</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">{stats.expired}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-400 to-red-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${stats.total > 0 ? (stats.expired / stats.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-200 pt-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                <span className="text-lg font-semibold text-slate-700">Total Certifications</span>
                <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expiring Soon Alert List */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-6 border-b border-slate-200">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-amber-600 mr-3" />
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Expiring Soon</h3>
                <p className="text-slate-600 mt-1">Certifications requiring attention</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {Array.isArray(certifications) && certifications
                .filter(cert => {
                  const daysUntilExpiry = getDaysUntilExpiry(cert.expiryDate)
                  return daysUntilExpiry > 0 && daysUntilExpiry <= 60
                })
                .slice(0, 5)
                .map(cert => (
                  <div key={cert._id} className="group hover:bg-amber-50 border border-slate-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:border-amber-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-4">
                        <div className="h-10 w-10 bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-amber-800 transition-colors">
                          {cert.certificationName}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{cert.staffName}</p>
                        <div className="flex items-center mt-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2 animate-pulse"></div>
                            Expires in {getDaysUntilExpiry(cert.expiryDate)} days
                          </span>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-all duration-200">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              {Array.isArray(certifications) && certifications.filter(cert => {
                const daysUntilExpiry = getDaysUntilExpiry(cert.expiryDate)
                return daysUntilExpiry > 0 && daysUntilExpiry <= 60
              }).length === 0 && (
                <div className="text-center py-8">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-slate-500 font-medium">All certifications are up to date!</p>
                  <p className="text-slate-400 text-sm mt-1">No certifications expiring soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal - Enhanced Design */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-white">Upload New Certification</h3>
                  <p className="text-blue-100 mt-1">Add a professional certification or license</p>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-blue-100 hover:text-white hover:bg-blue-800 p-2 rounded-lg transition-all duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Staff Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Staff Member<span className="text-red-500 ml-1">*</span>
                    {staffMembers.length > 0 && (
                      <span className="text-green-600 text-xs ml-2">({staffMembers.length} staff members loaded)</span>
                    )}
                    {staffMembers.length === 0 && (
                      <span className="text-red-600 text-xs ml-2">(No staff members found)</span>
                    )}
                  </label>
                  <select 
                    value={formData.staffId}
                    onChange={(e) => {
                      console.log('Selected staff ID:', e.target.value);
                      setFormData({...formData, staffId: e.target.value});
                    }}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
                    required
                  >
                    <option value="">Select staff member</option>
                    {Array.isArray(staffMembers) && staffMembers.map(staff => (
                      <option key={staff._id} value={staff._id}>
                        {staff.fullName || `${staff.firstName} ${staff.lastName}`} ({staff.role})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Certification Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Certification Name<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.certificationName}
                      onChange={(e) => setFormData({...formData, certificationName: e.target.value})}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
                      placeholder="Enter certification name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Certification Type<span className="text-red-500 ml-1">*</span>
                    </label>
                    <select 
                      value={formData.certificationType}
                      onChange={(e) => setFormData({...formData, certificationType: e.target.value})}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
                      required
                    >
                      <option value="">Select certification type</option>
                      <option value="medical-certificate">Medical Certificate</option>
                      <option value="nursing-license">Nursing License</option>
                      <option value="technical-license">Technical License</option>
                      <option value="professional-license">Professional License</option>
                      <option value="specialty-certification">Specialty Certification</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Issuing Authority<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.issuingAuthority}
                    onChange={(e) => setFormData({...formData, issuingAuthority: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
                    placeholder="Enter issuing authority"
                    required
                  />
                </div>
                
                {/* Date Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Issue Date<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Expiry Date<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                
                {/* Optional Fields */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Certification Number
                  </label>
                  <input
                    type="text"
                    value={formData.certificationNumber}
                    onChange={(e) => setFormData({...formData, certificationNumber: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
                    placeholder="Enter certification number (optional)"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
                    placeholder="Enter any additional notes (optional)"
                    rows="3"
                  />
                </div>
                
                {/* File Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Upload Document
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-blue-400 transition-colors duration-200">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="w-full"
                      id="fileUpload"
                    />
                    <div className="mt-2 text-sm text-slate-500">
                      Accepted formats: PDF, JPG, PNG (Max 10MB)
                    </div>
                    {selectedFile && (
                      <div className="mt-2 text-sm text-green-600">
                        Selected: {selectedFile.name}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="flex-1 border border-slate-300 bg-white text-slate-700 py-3 px-6 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Upload Certification
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Certifications;
