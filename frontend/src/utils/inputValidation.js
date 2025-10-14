/**
 * Enhanced Input Validation and Restriction Utilities
 * Provides real-time input control, validation, and feedback
 */

// Input restriction handlers
export const handleNumericInput = (event, component) => {
  const input = event.target;
  let value = input.value;
  
  // Only allow numbers, single decimal point, and minus sign
  value = value.replace(/[^0-9.-]/g, '');
  
  // Ensure only one decimal point
  const decimalCount = (value.match(/\./g) || []).length;
  if (decimalCount > 1) {
    const parts = value.split('.');
    value = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Ensure only one minus sign at the beginning
  if (value.includes('-')) {
    const minusIndex = value.indexOf('-');
    if (minusIndex !== 0) {
      value = value.replace(/-/g, '');
    }
    // Only allow one minus sign
    const minusCount = (value.match(/-/g) || []).length;
    if (minusCount > 1) {
      value = '-' + value.replace(/-/g, '');
    }
  }
  
  // Restrict decimal places
  if (component.decimalPlaces !== undefined) {
    const parts = value.split('.');
    if (parts.length > 1 && parts[1].length > component.decimalPlaces) {
      value = parts[0] + '.' + parts[1].substring(0, component.decimalPlaces);
    }
  }
  
  input.value = value;
};

export const handleTextInput = (event, component) => {
  const input = event.target;
  let value = input.value;
  
  // Allow letters, numbers, spaces, and basic punctuation
  value = value.replace(/[^a-zA-Z0-9\s.,;:!?'"()-]/g, '');
  
  // Enforce max length if specified
  if (component.maxLength && value.length > component.maxLength) {
    value = value.substring(0, component.maxLength);
  }
  
  input.value = value;
};

export const handleKeyPress = (event, component) => {
  const { type } = component;
  const key = event.key;
  
  // Always allow control keys
  const controlKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End'
  ];
  
  if (controlKeys.includes(key) || event.ctrlKey || event.metaKey) {
    return;
  }
  
  if (type === 'number') {
    // For numeric inputs, only allow numbers, decimal point, and minus
    const allowedKeys = /[0-9.-]/;
    if (!allowedKeys.test(key)) {
      event.preventDefault();
    }
    
    // Prevent multiple decimal points
    if (key === '.' && event.target.value.includes('.')) {
      event.preventDefault();
    }
    
    // Prevent minus sign if not at the beginning
    if (key === '-' && event.target.selectionStart !== 0) {
      event.preventDefault();
    }
    
    // Prevent multiple minus signs
    if (key === '-' && event.target.value.includes('-')) {
      event.preventDefault();
    }
  } else if (type === 'text') {
    // For text inputs, only allow letters, numbers, spaces, and basic punctuation
    const allowedKeys = /[a-zA-Z0-9\s.,;:!?'"()-]/;
    if (!allowedKeys.test(key)) {
      event.preventDefault();
    }
  }
};

// Validation functions
export const validateValue = (value, component) => {
  const result = {
    isValid: true,
    status: 'normal', // normal, warning, error
    message: '',
    color: 'border-gray-300'
  };
  
  if (!value || value.trim() === '') {
    if (component.required) {
      result.isValid = false;
      result.status = 'error';
      result.message = 'This field is required';
      result.color = 'border-red-500 bg-red-50';
    }
    return result;
  }
  
  if (component.type === 'number') {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      result.isValid = false;
      result.status = 'error';
      result.message = 'Please enter a valid number';
      result.color = 'border-red-500 bg-red-50';
      return result;
    }
    
    // Parse reference range for normal values
    const normalRange = parseReferenceRange(component.referenceRange);
    
    // Check physiological limits (error range)
    if (component.minValue !== undefined && numValue < component.minValue) {
      result.isValid = false;
      result.status = 'error';
      result.message = `Value must be at least ${component.minValue}`;
      result.color = 'border-red-500 bg-red-50';
    } else if (component.maxValue !== undefined && numValue > component.maxValue) {
      result.isValid = false;
      result.status = 'error';
      result.message = `Value must not exceed ${component.maxValue}`;
      result.color = 'border-red-500 bg-red-50';
    }
    // Check normal range (warning if outside)
    else if (normalRange && (numValue < normalRange.min || numValue > normalRange.max)) {
      result.status = 'warning';
      result.message = `Outside normal range (${component.referenceRange} ${component.unit})`;
      result.color = 'border-yellow-500 bg-yellow-50';
    }
    // Normal range
    else if (normalRange && numValue >= normalRange.min && numValue <= normalRange.max) {
      result.status = 'normal';
      result.message = `Normal (${component.referenceRange} ${component.unit})`;
      result.color = 'border-green-500 bg-green-50';
    }
  }
  
  return result;
};

// Helper function to parse reference ranges
const parseReferenceRange = (referenceRange) => {
  if (!referenceRange) return null;
  
  // Handle different formats: "12.0-17.5", "< 200", "> 100", "4,000-11,000"
  const cleanRange = referenceRange.replace(/,/g, '');
  
  // Range format: "min-max"
  const rangeMatch = cleanRange.match(/^([\d.]+)-([\d.]+)$/);
  if (rangeMatch) {
    return {
      min: parseFloat(rangeMatch[1]),
      max: parseFloat(rangeMatch[2])
    };
  }
  
  // Less than format: "< value"
  const lessThanMatch = cleanRange.match(/^<\s*([\d.]+)$/);
  if (lessThanMatch) {
    return {
      min: 0,
      max: parseFloat(lessThanMatch[1])
    };
  }
  
  // Greater than format: "> value"
  const greaterThanMatch = cleanRange.match(/^>\s*([\d.]+)$/);
  if (greaterThanMatch) {
    return {
      min: parseFloat(greaterThanMatch[1]),
      max: Infinity
    };
  }
  
  return null;
};

// Get validation icon and color
export const getValidationIcon = (status) => {
  switch (status) {
    case 'normal':
      return { icon: '✓', color: 'text-green-500' };
    case 'warning':
      return { icon: '⚠', color: 'text-yellow-500' };
    case 'error':
      return { icon: '✗', color: 'text-red-500' };
    default:
      return { icon: '', color: '' };
  }
};

// Character count utility
export const getCharacterCount = (value, maxLength) => {
  const currentLength = value ? value.length : 0;
  const percentage = maxLength ? (currentLength / maxLength) * 100 : 0;
  
  let colorClass = 'text-gray-500';
  if (percentage > 90) {
    colorClass = 'text-red-500';
  } else if (percentage > 75) {
    colorClass = 'text-yellow-500';
  }
  
  return {
    current: currentLength,
    max: maxLength,
    percentage,
    colorClass,
    text: maxLength ? `${currentLength}/${maxLength}` : `${currentLength}`
  };
};

// Form validation helper
export const validateForm = (formData, components) => {
  const errors = {};
  let hasErrors = false;
  let hasWarnings = false;
  
  components.forEach(component => {
    const value = formData.components[component.name];
    const validation = validateValue(value, component);
    
    if (!validation.isValid) {
      errors[component.name] = validation.message;
      hasErrors = true;
    } else if (validation.status === 'warning') {
      hasWarnings = true;
    }
  });
  
  // Validate required form fields
  if (formData.technicianNotes && formData.technicianNotes.length > 1000) {
    errors.technicianNotes = 'Notes cannot exceed 1000 characters';
    hasErrors = true;
  }
  
  return {
    errors,
    hasErrors,
    hasWarnings,
    isValid: !hasErrors
  };
};

// Enhanced input props generator
export const getInputProps = (component, value, onChange, onBlur) => {
  const validation = validateValue(value, component);
  
  const baseProps = {
    value: value || '',
    onChange,
    onBlur,
    className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${validation.color}`,
    required: component.required
  };
  
  if (component.type === 'number') {
    return {
      ...baseProps,
      type: 'text', // Use text to have full control over input
      inputMode: 'decimal',
      onInput: (e) => handleNumericInput(e, component),
      onKeyDown: (e) => handleKeyPress(e, component),
      placeholder: `Enter ${component.name.toLowerCase()}...`
    };
  } else if (component.type === 'text' || component.type === 'textarea') {
    return {
      ...baseProps,
      type: 'text',
      onInput: (e) => handleTextInput(e, component),
      onKeyDown: (e) => handleKeyPress(e, component),
      placeholder: component.placeholder || `Enter ${component.name.toLowerCase()}...`,
      maxLength: component.maxLength || 255
    };
  } else if (component.type === 'select') {
    return {
      ...baseProps,
      placeholder: undefined // Select doesn't use placeholder
    };
  }
  
  return baseProps;
};