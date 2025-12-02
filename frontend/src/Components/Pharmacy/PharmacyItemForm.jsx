import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pharmacyService, supplierService } from '../../utils/api';
import { ArrowLeft, Save } from 'lucide-react';

const PharmacyItemForm = ({ onBack, item: propItem }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id || !!propItem;
  const itemId = id || (propItem && propItem._id); // Get ID from URL params or prop item
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Medicine',
    quantity: 0,
    minRequired: 10,
    unitPrice: 0,
    expiryDate: '',
    manufacturer: '',
    description: '',
    supplier: ''
  });
  
  const fetchItem = useCallback(async () => {
    try {
      setLoading(true);
      const response = await pharmacyService.getPharmacyItemById(itemId);
      
      if (response.data) {
        const item = response.data.data;
        // Format date for input field
        const formattedItem = {
          ...item,
          expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
          supplier: item.supplier?._id || item.supplier || ''
        };
        setFormData(formattedItem);
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      setError('Failed to load item details');
    } finally {
      setLoading(false);
    }
  }, [itemId]);
  
  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await supplierService.getActiveSuppliers();
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  }, []);
  
  useEffect(() => {
    // Fetch suppliers when component mounts
    fetchSuppliers();
    
    if (propItem) {
      // If item is passed as prop, use it directly
      const formattedItem = {
        ...propItem,
        expiryDate: propItem.expiryDate ? new Date(propItem.expiryDate).toISOString().split('T')[0] : '',
        supplier: propItem.supplier?._id || propItem.supplier || ''
      };
      setFormData(formattedItem);
    } else if (itemId) {
      // If ID is from URL params, fetch the item
      fetchItem();
    }
  }, [itemId, propItem, fetchItem, fetchSuppliers]);
  
  const validateField = (fieldName, value) => {
    let error = '';
    
    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          error = 'Item name is required';
        } else if (value.trim().length < 3) {
          error = 'Item name must be at least 3 characters';
        } else if (value.trim().length > 100) {
          error = 'Item name must not exceed 100 characters';
        } else if (!/^[a-zA-Z0-9\s\-().]+$/.test(value)) {
          error = 'Item name can only contain letters, numbers, spaces, hyphens, and parentheses';
        }
        break;
        
      case 'category':
        if (!value) {
          error = 'Category is required';
        } else if (!['Medicine', 'Supply', 'Equipment', 'Lab Supplies'].includes(value)) {
          error = 'Invalid category selected';
        }
        break;
        
      case 'quantity':
        const quantity = Number(value);
        if (value === '' || value === null) {
          error = 'Quantity is required';
        } else if (isNaN(quantity)) {
          error = 'Quantity must be a number';
        } else if (quantity < 0) {
          error = 'Quantity cannot be negative';
        } else if (!Number.isInteger(quantity)) {
          error = 'Quantity must be a whole number';
        } else if (quantity > 1000000) {
          error = 'Quantity cannot exceed 1,000,000';
        }
        break;
        
      case 'minRequired':
        const minRequired = Number(value);
        const currentQuantity = Number(formData.quantity);
        if (value === '' || value === null) {
          error = 'Minimum required is required';
        } else if (isNaN(minRequired)) {
          error = 'Minimum required must be a number';
        } else if (minRequired < 1) {
          error = 'Minimum required must be at least 1';
        } else if (!Number.isInteger(minRequired)) {
          error = 'Minimum required must be a whole number';
        } else if (minRequired > currentQuantity && currentQuantity > 0) {
          error = 'Minimum required should not exceed current quantity';
        } else if (minRequired > 100000) {
          error = 'Minimum required cannot exceed 100,000';
        }
        break;
        
      case 'unitPrice':
        const unitPrice = Number(value);
        if (value === '' || value === null) {
          error = 'Unit price is required';
        } else if (isNaN(unitPrice)) {
          error = 'Unit price must be a number';
        } else if (unitPrice < 0) {
          error = 'Unit price cannot be negative';
        } else if (unitPrice === 0) {
          error = 'Unit price must be greater than 0';
        } else if (unitPrice > 1000000) {
          error = 'Unit price cannot exceed Rs. 1,000,000';
        } else if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
          error = 'Unit price can have maximum 2 decimal places';
        }
        break;
        
      case 'expiryDate':
        if (value) {
          const expiryDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (isNaN(expiryDate.getTime())) {
            error = 'Invalid date format';
          } else if (expiryDate < today) {
            error = 'Expiry date cannot be in the past';
          }
          
          const tenYearsFromNow = new Date();
          tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
          if (expiryDate > tenYearsFromNow) {
            error = 'Expiry date seems too far in the future';
          }
        }
        break;
        
      case 'manufacturer':
        if (value && value.trim()) {
          if (value.trim().length < 2) {
            error = 'Manufacturer name must be at least 2 characters';
          } else if (value.trim().length > 100) {
            error = 'Manufacturer name must not exceed 100 characters';
          } else if (!/^[a-zA-Z0-9\s\-&.,()]+$/.test(value)) {
            error = 'Manufacturer name contains invalid characters';
          }
        }
        break;
        
      case 'description':
        if (value && value.trim()) {
          if (value.trim().length > 500) {
            error = 'Description must not exceed 500 characters';
          }
        }
        break;
    }
    
    return error;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent invalid input before setting state
    let sanitizedValue = value;
    
    // Restrict input based on field type
    switch (name) {
      case 'name':
        // Only allow letters, numbers, spaces, hyphens, periods, and parentheses
        sanitizedValue = value.replace(/[^a-zA-Z0-9\s\-().]/g, '');
        break;
        
      case 'quantity':
      case 'minRequired':
        // Only allow positive integers (no negative, no decimals)
        sanitizedValue = value.replace(/[^0-9]/g, '');
        break;
        
      case 'unitPrice':
        // Only allow positive numbers with up to 2 decimal places
        // Remove any non-numeric characters except decimal point
        sanitizedValue = value.replace(/[^0-9.]/g, '');
        // Ensure only one decimal point
        const parts = sanitizedValue.split('.');
        if (parts.length > 2) {
          sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
        }
        // Limit to 2 decimal places
        if (parts.length === 2 && parts[1].length > 2) {
          sanitizedValue = parts[0] + '.' + parts[1].substring(0, 2);
        }
        break;
        
      case 'manufacturer':
        // Allow letters, numbers, spaces, and common business characters
        sanitizedValue = value.replace(/[^a-zA-Z0-9\s\-&.,()]/g, '');
        break;
        
      case 'description':
        // Allow most characters but limit length
        if (value.length > 500) {
          sanitizedValue = value.substring(0, 500);
        }
        break;
    }
    
    // Update form data
    setFormData({
      ...formData,
      [name]: sanitizedValue
    });
    
    // Validate field in real-time
    const fieldError = validateField(name, sanitizedValue);
    setValidationErrors({
      ...validationErrors,
      [name]: fieldError
    });
  };
  
  const handleKeyDown = (e) => {
    const { name } = e.target;
    
    // Prevent minus sign, plus sign, and 'e' for number inputs
    if ((name === 'quantity' || name === 'minRequired' || name === 'unitPrice') && 
        (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E')) {
      e.preventDefault();
    }
    
    // Prevent decimal point for integer fields
    if ((name === 'quantity' || name === 'minRequired') && e.key === '.') {
      e.preventDefault();
    }
  };
  
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Validate on blur for better UX
    const fieldError = validateField(name, value);
    setValidationErrors({
      ...validationErrors,
      [name]: fieldError
    });
  };
  
  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Item name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Item name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Item name must not exceed 100 characters';
    } else if (!/^[a-zA-Z0-9\s\-().]+$/.test(formData.name)) {
      errors.name = 'Item name can only contain letters, numbers, spaces, hyphens, and parentheses';
    }
    
    // Category validation
    if (!formData.category) {
      errors.category = 'Category is required';
    } else if (!['Medicine', 'Supply', 'Equipment', 'Lab Supplies'].includes(formData.category)) {
      errors.category = 'Invalid category selected';
    }
    
    // Quantity validation
    const quantity = Number(formData.quantity);
    if (formData.quantity === '' || formData.quantity === null) {
      errors.quantity = 'Quantity is required';
    } else if (isNaN(quantity)) {
      errors.quantity = 'Quantity must be a number';
    } else if (quantity < 0) {
      errors.quantity = 'Quantity cannot be negative';
    } else if (!Number.isInteger(quantity)) {
      errors.quantity = 'Quantity must be a whole number';
    } else if (quantity > 1000000) {
      errors.quantity = 'Quantity cannot exceed 1,000,000';
    }
    
    // Minimum Required validation
    const minRequired = Number(formData.minRequired);
    if (formData.minRequired === '' || formData.minRequired === null) {
      errors.minRequired = 'Minimum required is required';
    } else if (isNaN(minRequired)) {
      errors.minRequired = 'Minimum required must be a number';
    } else if (minRequired < 1) {
      errors.minRequired = 'Minimum required must be at least 1';
    } else if (!Number.isInteger(minRequired)) {
      errors.minRequired = 'Minimum required must be a whole number';
    } else if (minRequired > quantity && quantity > 0) {
      errors.minRequired = 'Minimum required should not exceed current quantity';
    } else if (minRequired > 100000) {
      errors.minRequired = 'Minimum required cannot exceed 100,000';
    }
    
    // Unit Price validation
    const unitPrice = Number(formData.unitPrice);
    if (formData.unitPrice === '' || formData.unitPrice === null) {
      errors.unitPrice = 'Unit price is required';
    } else if (isNaN(unitPrice)) {
      errors.unitPrice = 'Unit price must be a number';
    } else if (unitPrice < 0) {
      errors.unitPrice = 'Unit price cannot be negative';
    } else if (unitPrice === 0) {
      errors.unitPrice = 'Unit price must be greater than 0';
    } else if (unitPrice > 1000000) {
      errors.unitPrice = 'Unit price cannot exceed Rs. 1,000,000';
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.unitPrice.toString())) {
      errors.unitPrice = 'Unit price can have maximum 2 decimal places';
    }
    
    // Expiry Date validation
    if (formData.expiryDate) {
      const expiryDate = new Date(formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(expiryDate.getTime())) {
        errors.expiryDate = 'Invalid date format';
      } else if (expiryDate < today) {
        errors.expiryDate = 'Expiry date cannot be in the past';
      }
      
      // Check if expiry date is too far in the future (e.g., more than 10 years)
      const tenYearsFromNow = new Date();
      tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
      if (expiryDate > tenYearsFromNow) {
        errors.expiryDate = 'Expiry date seems too far in the future';
      }
    }
    
    // Manufacturer validation (optional but if provided, validate)
    if (formData.manufacturer && formData.manufacturer.trim()) {
      if (formData.manufacturer.trim().length < 2) {
        errors.manufacturer = 'Manufacturer name must be at least 2 characters';
      } else if (formData.manufacturer.trim().length > 100) {
        errors.manufacturer = 'Manufacturer name must not exceed 100 characters';
      } else if (!/^[a-zA-Z0-9\s\-&.,()]+$/.test(formData.manufacturer)) {
        errors.manufacturer = 'Manufacturer name contains invalid characters';
      }
    }
    
    // Description validation (optional but if provided, validate)
    if (formData.description && formData.description.trim()) {
      if (formData.description.trim().length > 500) {
        errors.description = 'Description must not exceed 500 characters';
      }
    }
    
    return errors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setSuccess('');
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please fix the validation errors before submitting');
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setValidationErrors({});
      
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        minRequired: Number(formData.minRequired),
        unitPrice: Number(formData.unitPrice)
      };
      
      console.log('Submitting form data:', payload);
      console.log('Is edit mode:', isEditMode);
      console.log('Item ID for update:', itemId);
      
      if (isEditMode) {
        if (!itemId) {
          throw new Error('No item ID available for update');
        }
        console.log('Updating item with ID:', itemId);
        const response = await pharmacyService.updatePharmacyItem(itemId, payload);
        console.log('Update response:', response);
        setSuccess('Item updated successfully!');
        
        // Navigate back after short delay
        setTimeout(() => {
          if (onBack) {
            onBack();
          } else {
            navigate('/pharmacist-dashboard');
          }
        }, 2000);
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
            if (onBack) {
              onBack();
            } else {
              navigate('/pharmacist-dashboard');
            }
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
            onClick={() => onBack ? onBack() : navigate('/pharmacist-dashboard')}
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
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.name 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter item name"
                  maxLength="100"
                  required
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.category 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 focus:ring-blue-500'
                  }`}
                  required
                >
                  <option value="Medicine">Medicine</option>
                  <option value="Supply">Supply</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Lab Supplies">Lab Supplies</option>
                </select>
                {validationErrors.category && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Supplier
                </label>
                <select
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Supplier (Optional)</option>
                  {suppliers.map(supplier => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.supplierId} - {supplier.supplierName}
                    </option>
                  ))}
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
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.quantity 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 focus:ring-blue-500'
                  }`}
                  min="0"
                  step="1"
                  required
                />
                {validationErrors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.quantity}</p>
                )}
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
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.minRequired 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 focus:ring-blue-500'
                  }`}
                  min="1"
                  step="1"
                  required
                />
                {validationErrors.minRequired && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.minRequired}</p>
                )}
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
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.unitPrice 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 focus:ring-blue-500'
                  }`}
                  min="0.01"
                  step="0.01"
                  required
                />
                {validationErrors.unitPrice && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.unitPrice}</p>
                )}
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
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.expiryDate 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 focus:ring-blue-500'
                  }`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {validationErrors.expiryDate && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.expiryDate}</p>
                )}
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
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.manufacturer 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter manufacturer name"
                  maxLength="100"
                />
                {validationErrors.manufacturer && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.manufacturer}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.description 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 focus:ring-blue-500'
                  }`}
                  rows="3"
                  placeholder="Enter item description (max 500 characters)"
                  maxLength="500"
                ></textarea>
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  {formData.description.length}/500 characters
                </p>
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
                onClick={() => onBack ? onBack() : navigate('/pharmacist-dashboard')}
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
