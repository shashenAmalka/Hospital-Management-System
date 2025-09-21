import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pharmacyService } from '../../utils/api';
import { ArrowLeft, Save } from 'lucide-react';

const PharmacyItemForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Medicine',
    quantity: 0,
    minRequired: 10,
    unitPrice: 0,
    expiryDate: '',
    manufacturer: '',
    description: ''
  });
  
  useEffect(() => {
    if (isEditMode) {
      fetchItem();
    }
  }, [id]);
  
  const fetchItem = async () => {
    try {
      setLoading(true);
      const response = await pharmacyService.getPharmacyItemById(id);
      
      if (response.data) {
        const item = response.data.data;
        // Format date for input field
        const formattedItem = {
          ...item,
          expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ''
        };
        setFormData(formattedItem);
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      setError('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        minRequired: Number(formData.minRequired),
        unitPrice: Number(formData.unitPrice)
      };
      
      console.log('Submitting form data:', payload);
      
      if (isEditMode) {
        const response = await pharmacyService.updatePharmacyItem(id, payload);
        console.log('Update response:', response);
        setSuccess('Item updated successfully!');
      } else {
        // Add more detailed error handling for debugging
        try {
          const response = await pharmacyService.createPharmacyItem(payload);
          console.log('Create response:', response);
          setSuccess('Item created successfully!');
          setFormData({
            name: '',
            category: 'Medicine',
            quantity: 0,
            minRequired: 10,
            unitPrice: 0,
            expiryDate: '',
            manufacturer: '',
            description: ''
          });
          
          // Navigate back after short delay
          setTimeout(() => {
            navigate('/pharmacist-dashboard');
          }, 2000);
        } catch (apiError) {
          console.error('API Error:', apiError);
          if (apiError.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error data:', apiError.response.data);
            setError(`Server error: ${apiError.response.data.message || apiError.message}`);
          } else if (apiError.request) {
            // The request was made but no response was received
            console.error('No response received:', apiError.request);
            setError('No response received from server. Please check your connection.');
          } else {
            // Something happened in setting up the request that triggered an Error
            setError(`Error: ${apiError.message}`);
          }
        }
      }
    } catch (error) {
      console.error('Error saving item:', error);
      setError(`Failed to save item: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && isEditMode) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading item data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/pharmacist-dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Dashboard
          </button>
          
          <h1 className="text-2xl font-bold text-slate-800 mt-4">
            {isEditMode ? 'Edit Pharmacy Item' : 'Add New Pharmacy Item'}
          </h1>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
            {success}
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter item name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Medicine">Medicine</option>
                  <option value="Supply">Supply</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Lab Supplies">Lab Supplies</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Current Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Minimum Required *
                </label>
                <input
                  type="number"
                  name="minRequired"
                  value={formData.minRequired}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Unit Price (Rs.) *
                </label>
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Manufacturer
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter manufacturer name"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter item description"
                ></textarea>
              </div>
            </div>
            
            {isEditMode && (
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  <span className="font-medium">Item ID:</span> {formData.itemId}
                </p>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/pharmacist-dashboard')}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 mr-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                {loading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>}
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Update Item' : 'Save Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PharmacyItemForm;
