import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function PatientForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = 'http://localhost:5000';
  const patientId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    const fetchPatient = async () => {
      if (patientId) {
        setLoading(true);
        try {
          const response = await fetch(`${API_URL}/patients/${patientId}`);
          if (!response.ok) {
            throw new Error('Patient not found');
          }
          const data = await response.json();
          // Format date to YYYY-MM-DD for input type="date"
          if (data.dob) {
            data.dob = new Date(data.dob).toISOString().split('T')[0];
          }
          setFormData(data);
        } catch (error) {
          console.error('Error fetching patient:', error);
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
    try {
      const url = patientId 
        ? `${API_URL}/users/${patientId}`
        : `${API_URL}/users`;
      
      const method = patientId ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'patient' }),
      });
      
      navigate('/patients');
    } catch (error) {
      console.error('Error saving patient:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {patientId ? 'Edit Patient' : 'Add New Patient'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <input
              name="firstName"
              placeholder="First Name"
              onChange={handleChange}
              value={formData.firstName || ''}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            />
            <input
              name="lastName"
              placeholder="Last Name"
              onChange={handleChange}
              value={formData.lastName || ''}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            />
            <input
              name="dob"
              type="date"
              onChange={handleChange}
              value={formData.dob || ''}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            />
            <select
              name="gender"
              onChange={handleChange}
              value={formData.gender || ''}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input
              name="address"
              placeholder="Address"
              onChange={handleChange}
              value={formData.address || ''}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 sm:col-span-2"
            />
            <input
              name="city"
              placeholder="City"
              onChange={handleChange}
              value={formData.city || ''}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            />
            <input
              name="state"
              placeholder="State"
              onChange={handleChange}
              value={formData.state || ''}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            />
            <input
              name="zip"
              placeholder="Zip Code"
              onChange={handleChange}
              value={formData.zip || ''}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            />
            <input
              name="emergencyContactName"
              placeholder="Emergency Contact Name"
              onChange={handleChange}
              value={formData.emergencyContactName || ''}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 sm:col-span-2"
            />
            <input
              name="emergencyContactPhone"
              placeholder="Emergency Contact Phone"
              onChange={handleChange}
              value={formData.emergencyContactPhone || ''}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 sm:col-span-2"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
              {patientId ? 'Update Patient' : 'Save Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PatientForm;
