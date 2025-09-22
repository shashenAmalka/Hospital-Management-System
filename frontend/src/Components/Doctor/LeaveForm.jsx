import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Calendar, 
  FileText, 
  AlertCircle 
} from 'lucide-react';

const LeaveForm = ({ isOpen, onClose, onSubmit, editingLeave = null }) => {
  const [formData, setFormData] = useState({
    leaveType: editingLeave?.leaveType || '',
    startDate: editingLeave?.startDate ? new Date(editingLeave.startDate).toISOString().split('T')[0] : '',
    endDate: editingLeave?.endDate ? new Date(editingLeave.endDate).toISOString().split('T')[0] : '',
    reason: editingLeave?.reason || '',
    supportingDocuments: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const leaveTypes = [
    'Annual Leave',
    'Sick Leave',
    'Emergency Leave',
    'Maternity/Paternity Leave',
    'Study Leave',
    'Compassionate Leave',
    'Personal Leave'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      supportingDocuments: files
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.leaveType) {
      newErrors.leaveType = 'Leave type is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate < startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // For now, send as JSON without file uploads
      const submitData = {
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      };

      await onSubmit(submitData);
      onClose();
      
      // Reset form
      setFormData({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: '',
        supportingDocuments: []
      });
    } catch (error) {
      console.error('Error submitting leave request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {editingLeave ? 'Edit Leave Request' : 'Apply for Leave'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Leave Type */}
          <div>
            <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-2">
              Leave Type<span className="text-red-500">*</span>
            </label>
            <select
              id="leaveType"
              name="leaveType"
              value={formData.leaveType}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.leaveType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select leave type</option>
              {leaveTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.leaveType && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.leaveType}
              </p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.startDate}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason<span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={4}
              placeholder="Provide a reason for your leave request"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.reason ? (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.reason}
                </p>
              ) : (
                <span className="text-xs text-gray-500">
                  {formData.reason.length}/500 characters
                </span>
              )}
            </div>
          </div>

          {/* Supporting Documents */}
          <div>
            <label htmlFor="documents" className="block text-sm font-medium text-gray-700 mb-2">
              Supporting Documents
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Upload relevant documents
              </p>
              <p className="text-xs text-gray-500">(Optional)</p>
              <input
                type="file"
                id="documents"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="mt-2"
              />
            </div>
            {formData.supportingDocuments.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Selected files:</p>
                <ul className="text-xs text-gray-500">
                  {Array.from(formData.supportingDocuments).map((file, index) => (
                    <li key={index} className="flex items-center mt-1">
                      <FileText size={14} className="mr-1" />
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingLeave ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                editingLeave ? 'Update Leave Request' : 'Submit Leave Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveForm;