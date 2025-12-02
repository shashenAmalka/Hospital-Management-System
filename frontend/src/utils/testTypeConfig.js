/**
 * Test Type Configuration
 * Defines validation rules and test components for each test type
 */

export const testTypeConfig = {
  'blood-test': {
    name: 'Blood Test',
    description: 'Complete Blood Count and Blood Chemistry Analysis',
    requiredFields: ['preferredDate', 'preferredTime', 'fastingRequired'],
    optionalFields: ['notes', 'priority'],
    fastingRequired: true,
    preparationInstructions: [
      'Fast for 8-12 hours before the test',
      'Drink plenty of water',
      'Avoid alcohol 24 hours before test',
      'Take regular medications unless advised otherwise'
    ],
    components: [
      { 
        name: 'Hemoglobin', 
        unit: 'g/dL', 
        referenceRange: '12.0-17.5',
        minValue: 3.0,  // Physiological minimum
        maxValue: 25.0, // Physiological maximum
        decimalPlaces: 1,
        required: true,
        category: 'Hematology',
        type: 'number'
      },
      { 
        name: 'WBC Count', 
        unit: 'cells/mcL', 
        referenceRange: '4,000-11,000',
        minValue: 500,   // Physiological minimum
        maxValue: 100000, // Physiological maximum
        decimalPlaces: 0,
        required: true,
        category: 'Hematology',
        type: 'number'
      },
      { 
        name: 'RBC Count', 
        unit: 'million cells/mcL', 
        referenceRange: '4.5-5.9',
        minValue: 1.0,   // Physiological minimum
        maxValue: 10.0,  // Physiological maximum
        decimalPlaces: 2,
        required: true,
        category: 'Hematology',
        type: 'number'
      },
      { 
        name: 'Platelet Count', 
        unit: 'cells/mcL', 
        referenceRange: '150,000-400,000',
        minValue: 10000,  // Physiological minimum
        maxValue: 2000000, // Physiological maximum
        decimalPlaces: 0,
        required: true,
        category: 'Hematology',
        type: 'number'
      },
      { 
        name: 'Glucose', 
        unit: 'mg/dL', 
        referenceRange: '70-100',
        minValue: 20,    // Physiological minimum
        maxValue: 800,   // Physiological maximum
        decimalPlaces: 1,
        required: true,
        category: 'Chemistry',
        type: 'number',
        warning: 'Fasting required for accurate results'
      },
      { 
        name: 'Cholesterol', 
        unit: 'mg/dL', 
        referenceRange: '< 200',
        minValue: 50,    // Physiological minimum
        maxValue: 600,   // Physiological maximum
        decimalPlaces: 1,
        required: false,
        category: 'Chemistry',
        type: 'number'
      },
      { 
        name: 'Triglycerides', 
        unit: 'mg/dL', 
        referenceRange: '< 150',
        minValue: 20,    // Physiological minimum
        maxValue: 1000,  // Physiological maximum
        decimalPlaces: 1,
        required: false,
        category: 'Chemistry',
        type: 'number'
      }
    ]
  },
  'urine-test': {
    name: 'Urine Test',
    description: 'Urinalysis - Physical, Chemical, and Microscopic Examination',
    requiredFields: ['preferredDate', 'preferredTime', 'specimenType', 'collectionMethod'],
    optionalFields: ['notes', 'priority'],
    fastingRequired: false,
    preparationInstructions: [
      'Use a clean container for collection',
      'Collect first morning urine if possible',
      'Mid-stream collection preferred',
      'Deliver to lab within 2 hours'
    ],
    components: [
      { 
        name: 'Color', 
        unit: '', 
        referenceRange: 'Yellow to Amber',
        type: 'select',
        options: ['Clear', 'Pale Yellow', 'Yellow', 'Dark Yellow', 'Amber', 'Brown', 'Red', 'Other'],
        required: true,
        category: 'Physical'
      },
      { 
        name: 'Appearance', 
        unit: '', 
        referenceRange: 'Clear',
        type: 'select',
        options: ['Clear', 'Slightly Cloudy', 'Cloudy', 'Turbid'],
        required: true,
        category: 'Physical'
      },
      { 
        name: 'pH', 
        unit: '', 
        referenceRange: '4.5-8.0',
        minValue: 4.0,
        maxValue: 9.0,
        decimalPlaces: 1,
        type: 'number',
        required: true,
        category: 'Chemical'
      },
      { 
        name: 'Specific Gravity', 
        unit: '', 
        referenceRange: '1.005-1.030',
        minValue: 1.000,
        maxValue: 1.040,
        decimalPlaces: 3,
        type: 'number',
        required: true,
        category: 'Chemical'
      },
      { 
        name: 'Protein', 
        unit: 'mg/dL', 
        referenceRange: 'Negative',
        type: 'select',
        options: ['Negative', 'Trace', '+1', '+2', '+3', '+4'],
        required: true,
        category: 'Chemical'
      },
      { 
        name: 'Glucose', 
        unit: 'mg/dL', 
        referenceRange: 'Negative',
        type: 'select',
        options: ['Negative', 'Trace', '+1', '+2', '+3', '+4'],
        required: true,
        category: 'Chemical'
      },
      { 
        name: 'Ketones', 
        unit: 'mg/dL', 
        referenceRange: 'Negative',
        type: 'select',
        options: ['Negative', 'Trace', 'Small', 'Moderate', 'Large'],
        required: true,
        category: 'Chemical'
      },
      { 
        name: 'Blood', 
        unit: '', 
        referenceRange: 'Negative',
        type: 'select',
        options: ['Negative', 'Trace', 'Small', 'Moderate', 'Large'],
        required: true,
        category: 'Chemical'
      },
      { 
        name: 'WBC', 
        unit: 'cells/hpf', 
        referenceRange: '0-5',
        minValue: 0,
        maxValue: 100,
        decimalPlaces: 0,
        type: 'number',
        required: true,
        category: 'Microscopic'
      },
      { 
        name: 'RBC', 
        unit: 'cells/hpf', 
        referenceRange: '0-3',
        minValue: 0,
        maxValue: 100,
        decimalPlaces: 0,
        type: 'number',
        required: true,
        category: 'Microscopic'
      }
    ]
  },
  'x-ray': {
    name: 'X-Ray',
    description: 'Radiographic Imaging Examination',
    requiredFields: ['preferredDate', 'preferredTime', 'bodyPart', 'clinicalIndication'],
    optionalFields: ['notes', 'priority', 'previousXray'],
    fastingRequired: false,
    preparationInstructions: [
      'Remove all metal objects and jewelry',
      'Wear comfortable, loose clothing',
      'Inform technician if pregnant',
      'Bring previous X-ray films if available'
    ],
    bodyParts: [
      'Chest', 'Skull', 'Spine', 'Abdomen', 'Pelvis', 
      'Shoulder', 'Arm', 'Elbow', 'Wrist', 'Hand', 
      'Hip', 'Leg', 'Knee', 'Ankle', 'Foot'
    ],
    components: [
      { 
        name: 'Technique', 
        unit: '', 
        referenceRange: '',
        type: 'text',
        required: true,
        category: 'Technical Details',
        placeholder: 'e.g., AP and Lateral views'
      },
      { 
        name: 'Quality', 
        unit: '', 
        referenceRange: 'Good',
        type: 'select',
        options: ['Excellent', 'Good', 'Adequate', 'Poor', 'Repeat Required'],
        required: true,
        category: 'Technical Details'
      },
      { 
        name: 'Findings', 
        unit: '', 
        referenceRange: '',
        type: 'textarea',
        required: true,
        category: 'Interpretation',
        placeholder: 'Describe all relevant findings...',
        minLength: 50
      },
      { 
        name: 'Impression', 
        unit: '', 
        referenceRange: 'Normal/Abnormal',
        type: 'textarea',
        required: true,
        category: 'Interpretation',
        placeholder: 'Summary impression and diagnosis...',
        minLength: 20
      },
      { 
        name: 'Comparison', 
        unit: '', 
        referenceRange: '',
        type: 'textarea',
        required: false,
        category: 'Interpretation',
        placeholder: 'Compare with previous studies if available...'
      }
    ]
  },
  'mri': {
    name: 'MRI',
    description: 'Magnetic Resonance Imaging',
    requiredFields: ['preferredDate', 'preferredTime', 'bodyPart', 'withContrast', 'clinicalIndication'],
    optionalFields: ['notes', 'priority', 'previousMRI', 'allergies'],
    fastingRequired: false,
    preparationInstructions: [
      'Remove all metal objects including jewelry, watches, hairpins',
      'Inform staff about any implants (pacemaker, cochlear implant, etc.)',
      'Fast for 4 hours if contrast is required',
      'Inform if you have claustrophobia - sedation may be needed',
      'Inform about any metal fragments or tattoos'
    ],
    bodyParts: [
      'Brain', 'Spine - Cervical', 'Spine - Thoracic', 'Spine - Lumbar', 
      'Shoulder', 'Knee', 'Ankle', 'Wrist', 'Hip', 'Abdomen', 'Pelvis', 
      'Cardiac', 'Breast', 'Whole Body'
    ],
    components: [
      { 
        name: 'Sequences Performed', 
        unit: '', 
        referenceRange: '',
        type: 'textarea',
        required: true,
        category: 'Technical Details',
        placeholder: 'e.g., T1, T2, FLAIR, DWI sequences...'
      },
      { 
        name: 'T1 Weighted Images', 
        unit: '', 
        referenceRange: '',
        type: 'textarea',
        required: true,
        category: 'Findings',
        placeholder: 'Describe T1 weighted findings...',
        minLength: 30
      },
      { 
        name: 'T2 Weighted Images', 
        unit: '', 
        referenceRange: '',
        type: 'textarea',
        required: true,
        category: 'Findings',
        placeholder: 'Describe T2 weighted findings...',
        minLength: 30
      },
      { 
        name: 'Contrast Enhancement', 
        unit: '', 
        referenceRange: 'Present/Absent',
        type: 'select',
        options: ['Not Applicable', 'None', 'Minimal', 'Moderate', 'Marked', 'Heterogeneous'],
        required: true,
        category: 'Findings',
        conditionalOn: 'withContrast'
      },
      { 
        name: 'Contrast Agent', 
        unit: '', 
        referenceRange: '',
        type: 'text',
        required: false,
        category: 'Technical Details',
        placeholder: 'e.g., Gadolinium-based contrast',
        conditionalOn: 'withContrast'
      },
      { 
        name: 'Findings', 
        unit: '', 
        referenceRange: '',
        type: 'textarea',
        required: true,
        category: 'Interpretation',
        placeholder: 'Detailed description of all relevant findings...',
        minLength: 100
      },
      { 
        name: 'Impression', 
        unit: '', 
        referenceRange: '',
        type: 'textarea',
        required: true,
        category: 'Interpretation',
        placeholder: 'Summary impression and conclusion...',
        minLength: 50
      },
      { 
        name: 'Recommendations', 
        unit: '', 
        referenceRange: '',
        type: 'textarea',
        required: false,
        category: 'Interpretation',
        placeholder: 'Follow-up recommendations if any...'
      }
    ]
  },
  'ct-scan': {
    name: 'CT Scan',
    description: 'Computed Tomography Scan',
    requiredFields: ['preferredDate', 'preferredTime', 'bodyPart', 'withContrast', 'clinicalIndication'],
    optionalFields: ['notes', 'priority', 'previousCT', 'renalFunction'],
    fastingRequired: true,
    preparationInstructions: [
      'Fast for 4-6 hours before the scan',
      'Drink plenty of water before the test',
      'Inform about kidney problems if contrast is required',
      'Remove metal objects and jewelry',
      'Inform if pregnant or possibly pregnant'
    ],
    bodyParts: [
      'Head', 'Neck', 'Chest', 'Abdomen', 'Pelvis', 
      'Spine', 'Extremities', 'Cardiac', 'CT Angiography', 
      'Whole Body'
    ],
    components: [
      { 
        name: 'Technique', 
        unit: '', 
        referenceRange: '',
        type: 'textarea',
        required: true,
        category: 'Technical Details',
        placeholder: 'Scanning parameters, slice thickness, reconstruction...'
      },
      { 
        name: 'Density Measurements', 
        unit: 'HU', 
        referenceRange: '',
        type: 'text',
        required: false,
        category: 'Technical Details',
        placeholder: 'Hounsfield Unit measurements if applicable'
      },
      { 
        name: 'Contrast Phase', 
        unit: '', 
        referenceRange: '',
        type: 'select',
        options: ['Not Applicable', 'Non-contrast', 'Arterial', 'Venous', 'Delayed', 'Multi-phase'],
        required: true,
        category: 'Technical Details'
      },
      { 
        name: 'Enhancement Pattern', 
        unit: '', 
        referenceRange: 'Present/Absent',
        type: 'select',
        options: ['Not Applicable', 'None', 'Homogeneous', 'Heterogeneous', 'Rim Enhancement', 'Central Enhancement'],
        required: true,
        category: 'Findings',
        conditionalOn: 'withContrast'
      },
      { 
        name: 'Findings', 
        unit: '', 
        referenceRange: '',
        type: 'textarea',
        required: true,
        category: 'Interpretation',
        placeholder: 'Detailed description of anatomical structures and abnormalities...',
        minLength: 100
      },
      { 
        name: 'Measurements', 
        unit: 'mm', 
        referenceRange: '',
        type: 'textarea',
        required: false,
        category: 'Interpretation',
        placeholder: 'Size measurements of significant findings...'
      },
      { 
        name: 'Impression', 
        unit: '', 
        referenceRange: '',
        type: 'textarea',
        required: true,
        category: 'Interpretation',
        placeholder: 'Summary impression and diagnosis...',
        minLength: 50
      },
      { 
        name: 'Recommendations', 
        unit: '', 
        referenceRange: '',
        type: 'textarea',
        required: false,
        category: 'Interpretation',
        placeholder: 'Follow-up imaging or clinical correlation recommendations...'
      }
    ]
  },
  'ultrasound': {
    name: 'Ultrasound',
    description: 'Sonographic Examination',
    requiredFields: ['preferredDate', 'preferredTime', 'bodyPart', 'clinicalIndication'],
    optionalFields: ['notes', 'priority', 'previousUltrasound'],
    fastingRequired: false,
    preparationInstructions: [
      'Fasting required for abdominal ultrasound (6-8 hours)',
      'Full bladder required for pelvic ultrasound',
      'No special preparation for other areas',
      'Wear comfortable, loose clothing'
    ],
    bodyParts: [
      'Abdomen', 'Pelvis', 'Pregnancy', 'Thyroid', 'Breast', 
      'Carotid', 'Venous Doppler', 'Arterial Doppler', 'Kidney', 
      'Liver', 'Heart (Echo)', 'Scrotum', 'Soft Tissue'
    ],
    components: [
      { 
        name: 'Technique', 
        unit: '', 
        referenceRange: '',
        type: 'text',
        required: true,
        category: 'Technical Details',
        placeholder: 'Transducer type, patient position...'
      },
      { 
        name: 'Image Quality', 
        unit: '', 
        referenceRange: 'Good',
        type: 'select',
        options: ['Excellent', 'Good', 'Adequate', 'Limited', 'Poor'],
        required: true,
        category: 'Technical Details'
      },
      { 
        name: 'Findings', 
        unit: '', 
        referenceRange: '',
        type: 'textarea',
        required: true,
        category: 'Interpretation',
        placeholder: 'Detailed sonographic findings...',
        minLength: 50
      },
      { 
        name: 'Measurements', 
        unit: 'cm', 
        referenceRange: '',
        type: 'textarea',
        required: false,
        category: 'Interpretation',
        placeholder: 'Size and dimension measurements...'
      },
      { 
        name: 'Doppler Findings', 
        unit: '', 
        referenceRange: '',
        type: 'textarea',
        required: false,
        category: 'Interpretation',
        placeholder: 'Vascular flow patterns if Doppler used...'
      },
      { 
        name: 'Impression', 
        unit: '', 
        referenceRange: '',
        type: 'textarea',
        required: true,
        category: 'Interpretation',
        placeholder: 'Summary impression and conclusion...',
        minLength: 30
      }
    ]
  }
};

/**
 * Get configuration for a specific test type
 */
export const getTestConfig = (testType) => {
  return testTypeConfig[testType] || null;
};

/**
 * Get all available test types
 */
export const getTestTypes = () => {
  return Object.keys(testTypeConfig).map(key => ({
    value: key,
    label: testTypeConfig[key].name,
    description: testTypeConfig[key].description
  }));
};

/**
 * Get required fields for a test type
 */
export const getRequiredFields = (testType) => {
  const config = testTypeConfig[testType];
  return config ? config.requiredFields : [];
};

/**
 * Get test components for a test type
 */
export const getTestComponents = (testType) => {
  const config = testTypeConfig[testType];
  return config ? config.components : [];
};

/**
 * Check if fasting is required for a test type
 */
export const isFastingRequired = (testType) => {
  const config = testTypeConfig[testType];
  return config ? config.fastingRequired : false;
};

/**
 * Get preparation instructions for a test type
 */
export const getPreparationInstructions = (testType) => {
  const config = testTypeConfig[testType];
  return config ? config.preparationInstructions : [];
};

/**
 * Validate test component value
 */
export const validateComponentValue = (component, value) => {
  const errors = [];

  if (component.required && (!value || value === '')) {
    errors.push(`${component.name} is required`);
    return errors;
  }

  if (!value || value === '') {
    return errors;
  }

  // Validate based on component type
  switch (component.type) {
    case 'number':
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        errors.push(`${component.name} must be a valid number`);
      } else {
        if (component.minValue !== undefined && numValue < component.minValue) {
          errors.push(`${component.name} must be at least ${component.minValue}`);
        }
        if (component.maxValue !== undefined && numValue > component.maxValue) {
          errors.push(`${component.name} must not exceed ${component.maxValue}`);
        }
      }
      break;

    case 'text':
      if (component.minLength && value.length < component.minLength) {
        errors.push(`${component.name} must be at least ${component.minLength} characters`);
      }
      if (component.maxLength && value.length > component.maxLength) {
        errors.push(`${component.name} must not exceed ${component.maxLength} characters`);
      }
      break;

    case 'textarea':
      if (component.minLength && value.length < component.minLength) {
        errors.push(`${component.name} must be at least ${component.minLength} characters`);
      }
      if (component.maxLength && value.length > component.maxLength) {
        errors.push(`${component.name} must not exceed ${component.maxLength} characters`);
      }
      break;

    case 'select':
      if (component.options && !component.options.includes(value)) {
        errors.push(`${component.name} must be one of: ${component.options.join(', ')}`);
      }
      break;
  }

  return errors;
};

export default testTypeConfig;
