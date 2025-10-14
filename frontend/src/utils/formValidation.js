/**
 * Form Validation Utilities
 * Provides comprehensive validation for lab test forms
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (various formats)
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate date is not in the past
 */
export const validateFutureDate = (dateString) => {
  const selectedDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
};

/**
 * Validate date is within allowed range
 */
export const validateDateRange = (dateString, minDays = 0, maxDays = 90) => {
  const selectedDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + minDays);
  
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxDays);
  
  return selectedDate >= minDate && selectedDate <= maxDate;
};

/**
 * Validate time is during working hours
 */
export const validateWorkingHours = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;
  
  const startTime = 8 * 60; // 8:00 AM
  const endTime = 17 * 60; // 5:00 PM
  
  return timeInMinutes >= startTime && timeInMinutes <= endTime;
};

/**
 * Validate priority level
 */
export const validatePriority = (priority) => {
  const validPriorities = ['normal', 'urgent', 'stat', 'routine'];
  return validPriorities.includes(priority?.toLowerCase());
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName) => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate text length
 */
export const validateLength = (value, fieldName, min, max) => {
  const errors = [];
  
  if (min && value.length < min) {
    errors.push(`${fieldName} must be at least ${min} characters`);
  }
  
  if (max && value.length > max) {
    errors.push(`${fieldName} must not exceed ${max} characters`);
  }
  
  return errors;
};

/**
 * Validate number range
 */
export const validateNumberRange = (value, fieldName, min, max, decimalPlaces = 0) => {
  const errors = [];
  
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) {
    errors.push(`${fieldName} must be a valid number`);
    return errors;
  }
  
  if (min !== undefined && numValue < min) {
    errors.push(`${fieldName} must be at least ${min}`);
  }
  
  if (max !== undefined && numValue > max) {
    errors.push(`${fieldName} must not exceed ${max}`);
  }
  
  // Check decimal places
  const decimalCount = (value.toString().split('.')[1] || '').length;
  if (decimalCount > decimalPlaces) {
    errors.push(`${fieldName} can have at most ${decimalPlaces} decimal places`);
  }
  
  return errors;
};

/**
 * Validate test request form based on test type
 */
export const validateTestRequestForm = (formData, requiredFields, testConfig) => {
  const errors = {};
  
  // Validate test type
  if (!formData.testType) {
    errors.testType = 'Test type is required';
  }
  
  // Validate required fields based on test type
  requiredFields.forEach(field => {
    const error = validateRequired(formData[field], field);
    if (error) {
      errors[field] = error;
    }
  });
  
  // Validate preferred date
  if (formData.preferredDate) {
    if (!validateFutureDate(formData.preferredDate)) {
      errors.preferredDate = 'Date cannot be in the past';
    }
    
    if (!validateDateRange(formData.preferredDate, 0, 90)) {
      errors.preferredDate = 'Date must be within the next 90 days';
    }
  }
  
  // Validate preferred time
  if (formData.preferredTime) {
    if (!validateWorkingHours(formData.preferredTime)) {
      errors.preferredTime = 'Time must be between 8:00 AM and 5:00 PM';
    }
  }
  
  // Validate priority
  if (formData.priority && !validatePriority(formData.priority)) {
    errors.priority = 'Invalid priority level';
  }
  
  // Validate notes length
  if (formData.notes) {
    const lengthErrors = validateLength(formData.notes, 'Notes', 0, 500);
    if (lengthErrors.length > 0) {
      errors.notes = lengthErrors[0];
    }
  }
  
  // Test-specific validations
  if (testConfig) {
    // Validate fasting requirement acknowledgment
    if (testConfig.fastingRequired && !formData.fastingAcknowledged) {
      errors.fastingAcknowledged = 'Please acknowledge fasting requirements';
    }
    
    // Validate body part selection for imaging tests
    if (testConfig.bodyParts && !formData.bodyPart) {
      errors.bodyPart = 'Body part selection is required';
    }
    
    // Validate contrast requirement for MRI/CT
    if (['mri', 'ct-scan'].includes(formData.testType) && formData.withContrast === undefined) {
      errors.withContrast = 'Please specify if contrast is required';
    }
    
    // Validate clinical indication
    if (requiredFields.includes('clinicalIndication') && formData.clinicalIndication) {
      const lengthErrors = validateLength(formData.clinicalIndication, 'Clinical Indication', 10, 500);
      if (lengthErrors.length > 0) {
        errors.clinicalIndication = lengthErrors[0];
      }
    }
  }
  
  return errors;
};

/**
 * Validate lab report form based on test type
 */
export const validateLabReportForm = (formData, testComponents) => {
  const errors = {};
  
  // Validate that at least one component has a value
  let hasAtLeastOneValue = false;
  
  testComponents.forEach(component => {
    const value = formData.components?.[component.name];
    
    // Check if component is required
    if (component.required && (!value || value === '')) {
      errors[component.name] = `${component.name} is required`;
    }
    
    // Validate component value if present
    if (value && value !== '') {
      hasAtLeastOneValue = true;
      
      const componentErrors = validateComponentValue(component, value);
      if (componentErrors.length > 0) {
        errors[component.name] = componentErrors[0];
      }
    }
  });
  
  if (!hasAtLeastOneValue) {
    errors.general = 'At least one test component must have a value';
  }
  
  // Validate technician notes
  if (formData.technicianNotes) {
    const lengthErrors = validateLength(formData.technicianNotes, 'Technician Notes', 10, 1000);
    if (lengthErrors.length > 0) {
      errors.technicianNotes = lengthErrors[0];
    }
  }
  
  // Validate interpretation/impression for imaging tests
  if (formData.testType && ['x-ray', 'mri', 'ct-scan', 'ultrasound'].includes(formData.testType)) {
    const impressionValue = formData.components?.['Impression'];
    if (!impressionValue || impressionValue.length < 20) {
      errors.Impression = 'Impression must be at least 20 characters for imaging reports';
    }
    
    const findingsValue = formData.components?.['Findings'];
    if (!findingsValue || findingsValue.length < 30) {
      errors.Findings = 'Findings must be at least 30 characters for imaging reports';
    }
  }
  
  // Validate completed date
  if (formData.completedDate) {
    const completedDate = new Date(formData.completedDate);
    const now = new Date();
    if (completedDate > now) {
      errors.completedDate = 'Completion date cannot be in the future';
    }
  }
  
  return errors;
};

/**
 * Validate component value (helper for lab report validation)
 */
const validateComponentValue = (component, value) => {
  const errors = [];
  
  switch (component.type) {
    case 'number':
      const numErrors = validateNumberRange(
        value,
        component.name,
        component.minValue,
        component.maxValue,
        component.decimalPlaces || 0
      );
      errors.push(...numErrors);
      break;
      
    case 'text':
      const textErrors = validateLength(
        value,
        component.name,
        component.minLength || 0,
        component.maxLength || 500
      );
      errors.push(...textErrors);
      break;
      
    case 'textarea':
      const areaErrors = validateLength(
        value,
        component.name,
        component.minLength || 0,
        component.maxLength || 2000
      );
      errors.push(...areaErrors);
      break;
      
    case 'select':
      if (component.options && !component.options.includes(value)) {
        errors.push(`${component.name} must be one of: ${component.options.join(', ')}`);
      }
      break;
  }
  
  return errors;
};

/**
 * Get validation message for a field
 */
export const getValidationMessage = (fieldName, errorType) => {
  const messages = {
    required: `${fieldName} is required`,
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    date: 'Please enter a valid date',
    time: 'Please enter a valid time',
    number: 'Please enter a valid number',
    minLength: `${fieldName} is too short`,
    maxLength: `${fieldName} is too long`,
    minValue: `${fieldName} is below minimum value`,
    maxValue: `${fieldName} exceeds maximum value`,
    pastDate: 'Date cannot be in the past',
    futureDate: 'Date cannot be in the future',
    workingHours: 'Time must be during working hours (8:00 AM - 5:00 PM)',
    invalidPriority: 'Please select a valid priority level'
  };
  
  return messages[errorType] || `Invalid ${fieldName}`;
};

/**
 * Real-time validation helper
 */
export const validateFieldOnChange = (fieldName, value, validationRules) => {
  const rules = validationRules[fieldName];
  if (!rules) return null;
  
  const errors = [];
  
  if (rules.required && !value) {
    errors.push('This field is required');
  }
  
  if (rules.type === 'email' && value && !validateEmail(value)) {
    errors.push('Please enter a valid email address');
  }
  
  if (rules.type === 'phone' && value && !validatePhone(value)) {
    errors.push('Please enter a valid phone number');
  }
  
  if (rules.minLength && value && value.length < rules.minLength) {
    errors.push(`Minimum ${rules.minLength} characters required`);
  }
  
  if (rules.maxLength && value && value.length > rules.maxLength) {
    errors.push(`Maximum ${rules.maxLength} characters allowed`);
  }
  
  if (rules.type === 'number' && value) {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      errors.push('Please enter a valid number');
    } else {
      if (rules.min !== undefined && numValue < rules.min) {
        errors.push(`Minimum value is ${rules.min}`);
      }
      if (rules.max !== undefined && numValue > rules.max) {
        errors.push(`Maximum value is ${rules.max}`);
      }
    }
  }
  
  return errors.length > 0 ? errors[0] : null;
};

/**
 * Check if form is valid
 */
export const isFormValid = (errors) => {
  return Object.keys(errors).length === 0;
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors) => {
  return Object.entries(errors).map(([field, error]) => ({
    field,
    message: error
  }));
};

export default {
  validateEmail,
  validatePhone,
  validateFutureDate,
  validateDateRange,
  validateWorkingHours,
  validatePriority,
  validateRequired,
  validateLength,
  validateNumberRange,
  validateTestRequestForm,
  validateLabReportForm,
  getValidationMessage,
  validateFieldOnChange,
  isFormValid,
  formatValidationErrors
};
