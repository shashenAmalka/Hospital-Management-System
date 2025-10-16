import React, { useState, useEffect } from 'react';
import { AlertCircle, Save, CheckCircle, FileText, Beaker, Info } from 'lucide-react';
import { 
  getTestConfig, 
  getTestComponents,
  validateComponentValue 
} from '../../utils/testTypeConfig';
import { 
  validateLabReportForm,
  isFormValid
} from '../../utils/formValidation';
import {
  validateValue,
  validateForm,
  getInputProps,
  getValidationIcon,
  getCharacterCount
} from '../../utils/inputValidation';

const DynamicLabReportForm = ({ labRequest, onSubmit }) => {
  const [formData, setFormData] = useState({
    labRequestId: labRequest?._id || '',
    testType: labRequest?.testType || '',
    patientId: labRequest?.patientId || '',
    components: {},
    technicianNotes: '',
    completedDate: new Date().toISOString().split('T')[0],
    completedTime: new Date().toTimeString().split(' ')[0].substring(0, 5)
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [validationStates, setValidationStates] = useState({}); // New: track validation status for each field
  const [formValidation, setFormValidation] = useState({ isValid: false, hasWarnings: false }); // New: overall form status
  const [testConfig, setTestConfig] = useState(null);
  const [testComponents, setTestComponents] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');

  // Load test configuration
  useEffect(() => {
    if (formData.testType) {
      const config = getTestConfig(formData.testType);
      const components = getTestComponents(formData.testType);
      setTestConfig(config);
      setTestComponents(components);

      // Set first category as active
      if (components.length > 0 && components[0].category) {
        setActiveCategory(components[0].category);
      }
    }
  }, [formData.testType]);

  // Handle component value change with real-time validation
  const handleComponentChange = (componentName, value) => {
    // Find the component definition
    const component = testComponents.find(c => c.name === componentName);
    
    setFormData(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [componentName]: value
      }
    }));

    // Real-time validation
    if (component) {
      const validation = validateValue(value, component);
      
      // Update validation state
      setValidationStates(prev => ({
        ...prev,
        [componentName]: validation
      }));

      // Update errors
      if (!validation.isValid) {
        setErrors(prev => ({
          ...prev,
          [componentName]: validation.message
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[componentName];
          return newErrors;
        });
      }
    }
  };

  // Handle component blur (mark as touched)
  const handleComponentBlur = (component) => {
    setTouched(prev => ({
      ...prev,
      [component.name]: true
    }));
  };

  // Real-time form validation
  useEffect(() => {
    if (testComponents.length > 0) {
      const validation = validateForm(formData, testComponents);
      setFormValidation(validation);
    }
  }, [formData, testComponents]);

  // Handle technician notes change with character count
  const handleNotesChange = (e) => {
    const value = e.target.value;
    const maxLength = 1000;
    
    if (value.length <= maxLength) {
      setFormData(prev => ({
        ...prev,
        technicianNotes: value
      }));
      
      // Clear error if value is valid
      if (errors.technicianNotes) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.technicianNotes;
          return newErrors;
        });
      }
    } else {
      setErrors(prev => ({
        ...prev,
        technicianNotes: `Notes cannot exceed ${maxLength} characters`
      }));
    }
  };

  // Handle other field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all as touched
    const allTouched = {};
    testComponents.forEach(component => {
      allTouched[component.name] = true;
    });
    setTouched(allTouched);

    // Validate form
    const validationErrors = validateLabReportForm(formData, testComponents);

    if (!isFormValid(validationErrors)) {
      setErrors(validationErrors);
      // Scroll to first error
      const firstErrorField = document.querySelector('.error-field');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Submit form
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to submit report' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group components by category
  const componentsByCategory = testComponents.reduce((acc, component) => {
    const category = component.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(component);
    return acc;
  }, {});

  const categories = Object.keys(componentsByCategory);

  // Enhanced component input renderer with real-time validation
  const renderComponentInput = (component) => {
    const value = formData.components[component.name] || '';
    const error = errors[component.name];
    const isTouched = touched[component.name];
    const validation = validationStates[component.name] || validateValue(value, component);
    const validationIcon = getValidationIcon(validation.status);

    // Get enhanced input props with validation styling
    const inputProps = getInputProps(
      component,
      value,
      (e) => handleComponentChange(component.name, e.target.value),
      () => handleComponentBlur(component)
    );

    const renderInput = () => {
      switch (component.type) {
        case 'number':
          return (
            <div className="relative">
              <input {...inputProps} />
              {component.unit && (
                <span className="absolute right-10 top-2.5 text-gray-500 text-sm pointer-events-none">
                  {component.unit}
                </span>
              )}
              {validation.status && (
                <span className={`absolute right-3 top-2.5 text-sm ${validationIcon.color}`}>
                  {validationIcon.icon}
                </span>
              )}
            </div>
          );

        case 'select':
          return (
            <div className="relative">
              <select {...inputProps}>
                <option value="">Select {component.name.toLowerCase()}...</option>
                {component.options?.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {validation.status && (
                <span className={`absolute right-8 top-2.5 text-sm ${validationIcon.color}`}>
                  {validationIcon.icon}
                </span>
              )}
            </div>
          );

        case 'textarea':
          const charCount = getCharacterCount(value, 500);
          return (
            <div>
              <textarea
                {...inputProps}
                rows={4}
                className={`${inputProps.className} resize-none`}
              />
              <div className="flex justify-between items-center mt-1">
                <span className={`text-xs ${charCount.colorClass}`}>
                  {charCount.text} characters
                </span>
                {validation.status && (
                  <span className={`text-sm ${validationIcon.color}`}>
                    {validationIcon.icon}
                  </span>
                )}
              </div>
            </div>
          );

        default:
          return (
            <div className="relative">
              <input {...inputProps} />
              {validation.status && (
                <span className={`absolute right-3 top-2.5 text-sm ${validationIcon.color}`}>
                  {validationIcon.icon}
                </span>
              )}
            </div>
          );
      }
    };

    return (
      <div className="space-y-2">
        {renderInput()}
        
        {/* Reference range display */}
        {component.referenceRange && (
          <div className="text-xs text-gray-600">
            <span className="font-medium">Reference:</span> {component.referenceRange} {component.unit}
          </div>
        )}
        
        {/* Validation message */}
        {(validation.message && isTouched) && (
          <div className={`text-xs ${
            validation.status === 'error' ? 'text-red-600' :
            validation.status === 'warning' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {validation.message}
          </div>
        )}
        
        {/* Warning message for component */}
        {component.warning && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
            <Info className="h-3 w-3 inline mr-1" />
            {component.warning}
          </div>
        )}
      </div>
    );
  };

  if (!testConfig || !testComponents.length) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No test configuration found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Beaker className="h-6 w-6 mr-2" />
              {testConfig.name} Report
            </h2>
            <p className="text-blue-100 text-sm mt-1">{testConfig.description}</p>
          </div>
          {labRequest && (
            <div className="text-right text-sm">
              <p className="text-blue-100">Request ID: {labRequest._id}</p>
              <p className="text-blue-100">Patient: {labRequest.patientName}</p>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Category Tabs (if multiple categories) */}
        {categories.length > 1 && (
          <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeCategory === category
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Test Components */}
        <div className="space-y-6">
          {categories.map(category => (
            <div
              key={category}
              className={category !== activeCategory && categories.length > 1 ? 'hidden' : ''}
            >
              {categories.length > 1 && (
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{category}</h3>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {componentsByCategory[category].map(component => (
                  <div
                    key={component.name}
                    className={`${
                      component.type === 'textarea' ? 'md:col-span-2' : ''
                    }`}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {component.name}
                      {component.required && <span className="text-red-500 ml-1">*</span>}
                      {component.unit && (
                        <span className="text-gray-500 ml-1">({component.unit})</span>
                      )}
                    </label>

                    <div className="relative">
                      {renderComponentInput(component)}
                    </div>

                    {/* Reference Range */}
                    {component.referenceRange && (
                      <p className="mt-1 text-xs text-gray-500 flex items-center">
                        <Info className="h-3 w-3 mr-1" />
                        Reference: {component.referenceRange}
                      </p>
                    )}

                    {/* Warning */}
                    {component.warning && (
                      <p className="mt-1 text-xs text-yellow-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {component.warning}
                      </p>
                    )}

                    {/* Error Message */}
                    {errors[component.name] && touched[component.name] && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors[component.name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Technician Notes */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Technician Notes
          </label>
          <div className="relative">
            <textarea
              name="technicianNotes"
              value={formData.technicianNotes}
              onChange={handleNotesChange}
              rows={4}
              placeholder="Add any additional observations, quality control notes, or comments..."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.technicianNotes ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              maxLength={1000}
            />
            {formData.technicianNotes && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-1 rounded">
                {(() => {
                  const charCount = getCharacterCount(formData.technicianNotes, 1000);
                  return (
                    <span className={charCount.colorClass}>
                      {charCount.text}
                    </span>
                  );
                })()}
              </div>
            )}
          </div>
          {errors.technicianNotes && (
            <p className="mt-1 text-sm text-red-600">{errors.technicianNotes}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Optional: Maximum 1000 characters. Use for quality control notes, observations, or additional comments.
          </p>
        </div>

        {/* Completion Date and Time */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Completion Date
            </label>
            <input
              type="date"
              name="completedDate"
              value={formData.completedDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Completion Time
            </label>
            <input
              type="time"
              name="completedTime"
              value={formData.completedTime}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {errors.general}
            </p>
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {errors.submit}
            </p>
          </div>
        )}

        {/* Form Status Summary */}
        {Object.keys(validationStates).length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Form Status</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {Object.values(validationStates).filter(v => v.status === 'normal').length}
                  </div>
                  <div className="text-xs text-gray-600">Normal</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-yellow-600">
                    {Object.values(validationStates).filter(v => v.status === 'warning').length}
                  </div>
                  <div className="text-xs text-gray-600">Warnings</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-red-600">
                    {Object.values(validationStates).filter(v => v.status === 'error').length}
                  </div>
                  <div className="text-xs text-gray-600">Errors</div>
                </div>
              </div>
              {formValidation.hasWarnings && !formValidation.hasErrors && (
                <div className="mt-3 text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  Some values are outside normal ranges but can still be submitted.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Required fields
            </p>
            {!formValidation.isValid && (
              <p className="text-xs text-red-600 mt-1">
                Please correct all errors before submitting
              </p>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formValidation.isValid}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                formValidation.isValid && !isSubmitting
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-400 text-gray-300 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving Report...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {formData.saved && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Report saved successfully!
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default DynamicLabReportForm;
