import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Info, CheckCircle2, FileText } from 'lucide-react';
import { 
  getTestTypes, 
  getTestConfig, 
  getRequiredFields,
  isFastingRequired,
  getPreparationInstructions
} from '../../utils/testTypeConfig';
import { 
  validateTestRequestForm,
  validateFieldOnChange,
  isFormValid
} from '../../utils/formValidation';

const DynamicTestRequestForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    testType: '',
    preferredDate: '',
    preferredTime: '',
    priority: 'normal',
    notes: '',
    fastingRequired: false,
    fastingAcknowledged: false,
    bodyPart: '',
    withContrast: false,
    clinicalIndication: '',
    specimenType: '',
    collectionMethod: '',
    previousStudy: false,
    previousStudyDate: '',
    allergies: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [testConfig, setTestConfig] = useState(null);
  const [showPreparation, setShowPreparation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const testTypes = getTestTypes();

  // Update test config when test type changes
  useEffect(() => {
    if (formData.testType) {
      const config = getTestConfig(formData.testType);
      setTestConfig(config);
      setFormData(prev => ({
        ...prev,
        fastingRequired: isFastingRequired(formData.testType)
      }));
    } else {
      setTestConfig(null);
    }
  }, [formData.testType]);

  // Handle field change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle blur (for touched state)
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field on blur
    if (testConfig) {
      const requiredFields = getRequiredFields(formData.testType);
      const validationErrors = validateTestRequestForm(formData, requiredFields, testConfig);
      
      if (validationErrors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: validationErrors[name]
        }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!testConfig) {
      setErrors({ testType: 'Please select a test type' });
      return;
    }

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate form
    const requiredFields = getRequiredFields(formData.testType);
    const validationErrors = validateTestRequestForm(formData, requiredFields, testConfig);

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
      setErrors({ submit: error.message || 'Failed to submit request' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (90 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Laboratory Test Request</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Test Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Type <span className="text-red-500">*</span>
          </label>
          <select
            name="testType"
            value={formData.testType}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.testType && touched.testType ? 'border-red-500 error-field' : 'border-gray-300'
            }`}
          >
            <option value="">Select a test type...</option>
            {testTypes.map(test => (
              <option key={test.value} value={test.value}>
                {test.label}
              </option>
            ))}
          </select>
          {errors.testType && touched.testType && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.testType}
            </p>
          )}
          {formData.testType && testConfig && (
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <Info className="h-4 w-4 mr-1" />
              {testConfig.description}
            </p>
          )}
        </div>

        {/* Dynamic fields based on test type */}
        {testConfig && (
          <>
            {/* Fasting Requirement Alert */}
            {testConfig.fastingRequired && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Fasting Required</h3>
                    <p className="mt-1 text-sm text-yellow-700">
                      This test requires fasting. Please read the preparation instructions carefully.
                    </p>
                    <div className="mt-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="fastingAcknowledged"
                          checked={formData.fastingAcknowledged}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          I acknowledge the fasting requirements
                        </span>
                      </label>
                      {errors.fastingAcknowledged && touched.fastingAcknowledged && (
                        <p className="mt-1 text-sm text-red-600">{errors.fastingAcknowledged}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preparation Instructions */}
            {testConfig.preparationInstructions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <button
                  type="button"
                  onClick={() => setShowPreparation(!showPreparation)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-sm font-medium text-blue-800 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Preparation Instructions
                  </h3>
                  <span className="text-blue-600">{showPreparation ? '−' : '+'}</span>
                </button>
                {showPreparation && (
                  <ul className="mt-3 space-y-2">
                    {testConfig.preparationInstructions.map((instruction, index) => (
                      <li key={index} className="text-sm text-blue-700 flex items-start">
                        <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        {instruction}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Preferred Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className={`w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.preferredDate && touched.preferredDate ? 'border-red-500 error-field' : 'border-gray-300'
                  }`}
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.preferredDate && touched.preferredDate && (
                <p className="mt-1 text-sm text-red-600">{errors.preferredDate}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select a date within the next 90 days
              </p>
            </div>

            {/* Preferred Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min="08:00"
                  max="17:00"
                  className={`w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.preferredTime && touched.preferredTime ? 'border-red-500 error-field' : 'border-gray-300'
                  }`}
                />
                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.preferredTime && touched.preferredTime && (
                <p className="mt-1 text-sm text-red-600">{errors.preferredTime}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Working hours: 8:00 AM - 5:00 PM
              </p>
            </div>

            {/* Body Part Selection (for imaging tests) */}
            {testConfig.bodyParts && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body Part <span className="text-red-500">*</span>
                </label>
                <select
                  name="bodyPart"
                  value={formData.bodyPart}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.bodyPart && touched.bodyPart ? 'border-red-500 error-field' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select body part...</option>
                  {testConfig.bodyParts.map(part => (
                    <option key={part} value={part}>{part}</option>
                  ))}
                </select>
                {errors.bodyPart && touched.bodyPart && (
                  <p className="mt-1 text-sm text-red-600">{errors.bodyPart}</p>
                )}
              </div>
            )}

            {/* With Contrast (for MRI/CT) */}
            {['mri', 'ct-scan'].includes(formData.testType) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contrast Required <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="withContrast"
                      value="true"
                      checked={formData.withContrast === true}
                      onChange={(e) => setFormData(prev => ({ ...prev, withContrast: true }))}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="withContrast"
                      value="false"
                      checked={formData.withContrast === false}
                      onChange={(e) => setFormData(prev => ({ ...prev, withContrast: false }))}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
                {errors.withContrast && touched.withContrast && (
                  <p className="mt-1 text-sm text-red-600">{errors.withContrast}</p>
                )}
              </div>
            )}

            {/* Specimen Type (for urine test) */}
            {formData.testType === 'urine-test' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specimen Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="specimenType"
                    value={formData.specimenType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.specimenType && touched.specimenType ? 'border-red-500 error-field' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select specimen type...</option>
                    <option value="random">Random</option>
                    <option value="first-morning">First Morning</option>
                    <option value="midstream">Midstream</option>
                    <option value="24-hour">24-Hour Collection</option>
                  </select>
                  {errors.specimenType && touched.specimenType && (
                    <p className="mt-1 text-sm text-red-600">{errors.specimenType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="collectionMethod"
                    value={formData.collectionMethod}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.collectionMethod && touched.collectionMethod ? 'border-red-500 error-field' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select collection method...</option>
                    <option value="clean-catch">Clean Catch</option>
                    <option value="catheter">Catheterization</option>
                    <option value="suprapubic">Suprapubic Aspiration</option>
                  </select>
                  {errors.collectionMethod && touched.collectionMethod && (
                    <p className="mt-1 text-sm text-red-600">{errors.collectionMethod}</p>
                  )}
                </div>
              </>
            )}

            {/* Clinical Indication (for imaging tests) */}
            {['x-ray', 'mri', 'ct-scan', 'ultrasound'].includes(formData.testType) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinical Indication <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="clinicalIndication"
                  value={formData.clinicalIndication}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={3}
                  placeholder="Please describe symptoms, reason for test, or clinical history..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.clinicalIndication && touched.clinicalIndication ? 'border-red-500 error-field' : 'border-gray-300'
                  }`}
                />
                {errors.clinicalIndication && touched.clinicalIndication && (
                  <p className="mt-1 text-sm text-red-600">{errors.clinicalIndication}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 10 characters, maximum 500 characters
                </p>
              </div>
            )}

            {/* Priority Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="routine">Routine</option>
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="stat">STAT (Immediate)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                STAT requests will be processed immediately
              </p>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={4}
                placeholder="Any additional information or special requests..."
                maxLength={500}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.notes && touched.notes ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.notes && touched.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.notes.length}/500 characters
              </p>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || Object.keys(errors).length > 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default DynamicTestRequestForm;
