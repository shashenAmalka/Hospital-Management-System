import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function PatientForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = 'http://localhost:5000';
  const patientId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    const fetchPatient = async () => {
      if (patientId) {
        setLoading(true);
        try {
          // Get auth token from localStorage
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication required');
          }

          const response = await fetch(`${API_URL}/users/${patientId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch patient data');
          }
          
          const data = await response.json();
          console.log('Fetched patient data:', data);
          
          // Format date to YYYY-MM-DD for input type="date"
          if (data.dob) {
            data.dob = new Date(data.dob).toISOString().split('T')[0];
          }
          
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            dob: data.dob || '',
            gender: data.gender || '',
            address: data.address || ''
          });
          
          setError(null);
        } catch (error) {
          console.error('Error fetching patient:', error);
          setError(error.message || 'Failed to load patient data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPatient();
  }, [patientId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const url = patientId 
        ? `${API_URL}/users/${patientId}`
        : `${API_URL}/users`;
      
      const method = patientId ? 'PUT' : 'POST';
      
      console.log(`${method} request to ${url} with data:`, formData);
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          ...formData, 
          role: 'patient' 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${patientId ? 'update' : 'create'} patient`);
      }
      
      const data = await response.json();
      console.log('Success:', data);
      
      navigate('/patients');
    } catch (error) {
      console.error('Error saving patient:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {patientId ? 'Edit Patient' : 'Add New Patient'}
        </h2>
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                name="firstName"
                placeholder="First Name"
                onChange={handleChange}
                value={formData.firstName}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                name="lastName"
                placeholder="Last Name"
                onChange={handleChange}
                value={formData.lastName}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                placeholder="Email"
                onChange={handleChange}
                value={formData.email}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                name="phone"
                placeholder="Phone Number"
                onChange={handleChange}
                value={formData.phone}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                name="dob"
                type="date"
                onChange={handleChange}
                value={formData.dob}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                onChange={handleChange}
                value={formData.gender}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                name="address"
                placeholder="Address"
                onChange={handleChange}
                value={formData.address}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/patients')}
              className="px-6 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Saving...' : patientId ? 'Update Patient' : 'Save Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PatientForm;
