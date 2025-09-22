// API base configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to create headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Appointment service
export const appointmentService = {
  // Get all appointments
  getAll: async () => {
    return await apiRequest('/appointments');
  },

  // Get appointment by ID
  getById: async (id) => {
    return await apiRequest(`/appointments/${id}`);
  },

  // Create new appointment
  create: async (appointmentData) => {
    return await apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
  },

  // Update appointment
  update: async (id, appointmentData) => {
    return await apiRequest(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData)
    });
  },

  // Delete appointment
  delete: async (id) => {
    return await apiRequest(`/appointments/${id}`, {
      method: 'DELETE'
    });
  },

  // Get appointments by patient ID
  getByPatientId: async (patientId) => {
    return await apiRequest(`/appointments/patient/${patientId}`);
  },

  // Get appointments by doctor ID
  getByDoctorId: async (doctorId) => {
    return await apiRequest(`/appointments/doctor/${doctorId}`);
  }
};

// Staff service
export const staffService = {
  // Get all staff
  getAll: async () => {
    return await apiRequest('/staff');
  },

  // Get staff by ID
  getById: async (id) => {
    return await apiRequest(`/staff/${id}`);
  },

  // Create new staff
  create: async (staffData) => {
    return await apiRequest('/staff', {
      method: 'POST',
      body: JSON.stringify(staffData)
    });
  },

  // Update staff
  update: async (id, staffData) => {
    return await apiRequest(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData)
    });
  },

  // Delete staff
  delete: async (id) => {
    return await apiRequest(`/staff/${id}`, {
      method: 'DELETE'
    });
  },

  // Get staff by role
  getByRole: async (role) => {
    return await apiRequest(`/staff/role/${role}`);
  },

  // Get staff by department
  getByDepartment: async (department) => {
    return await apiRequest(`/staff/department/${department}`);
  }
};

// Patient service
export const patientService = {
  // Get all patients
  getAll: async () => {
    return await apiRequest('/patients');
  },

  // Get patient by ID
  getById: async (id) => {
    return await apiRequest(`/patients/${id}`);
  },

  // Create new patient
  create: async (patientData) => {
    return await apiRequest('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
  },

  // Update patient
  update: async (id, patientData) => {
    return await apiRequest(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData)
    });
  },

  // Delete patient
  delete: async (id) => {
    return await apiRequest(`/patients/${id}`, {
      method: 'DELETE'
    });
  }
};

// Authentication service
export const authService = {
  // Login
  login: async (credentials) => {
    return await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  // Register
  register: async (userData) => {
    return await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  }
};

// Department service
export const departmentService = {
  // Get all departments
  getAll: async () => {
    return await apiRequest('/departments');
  },

  // Get department by ID
  getById: async (id) => {
    return await apiRequest(`/departments/${id}`);
  },

  // Create new department
  create: async (departmentData) => {
    return await apiRequest('/departments', {
      method: 'POST',
      body: JSON.stringify(departmentData)
    });
  },

  // Update department
  update: async (id, departmentData) => {
    return await apiRequest(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(departmentData)
    });
  },

  // Delete department
  delete: async (id) => {
    return await apiRequest(`/departments/${id}`, {
      method: 'DELETE'
    });
  }
};

// Role service
export const roleService = {
  // Get all roles
  getAll: async () => {
    return await apiRequest('/roles');
  },

  // Get role by ID
  getById: async (id) => {
    return await apiRequest(`/roles/${id}`);
  },

  // Create new role
  create: async (roleData) => {
    return await apiRequest('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData)
    });
  },

  // Update role
  update: async (id, roleData) => {
    return await apiRequest(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData)
    });
  },

  // Delete role
  delete: async (id) => {
    return await apiRequest(`/roles/${id}`, {
      method: 'DELETE'
    });
  }
};

// Shift schedule service
export const shiftScheduleService = {
  // Get schedules by week
  getByWeek: async (weekStart) => {
    return await apiRequest(`/shift-schedules/week/${weekStart}`);
  },

  // Bulk update schedules
  bulkUpdate: async (schedules) => {
    return await apiRequest('/shift-schedules/bulk', {
      method: 'PUT',
      body: JSON.stringify({ schedules })
    });
  },

  // Publish schedules
  publish: async (weekStart) => {
    return await apiRequest(`/shift-schedules/publish/${weekStart}`, {
      method: 'POST'
    });
  },

  // Export schedule as PDF
  exportPDF: async (weekStart, department) => {
    const queryParams = new URLSearchParams();
    if (department) queryParams.append('department', department);
    
    const response = await fetch(`${API_BASE_URL}/shift-schedules/export/${weekStart}?${queryParams}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to export PDF');
    }
    
    return response.blob();
  }
};

// Pharmacy service
export const pharmacyService = {
  // Get all pharmacy items
  getAllPharmacyItems: async () => {
    console.log('🔧 Making API call to: /medication/items');
    const result = await apiRequest('/medication/items');
    console.log('🔧 API Response:', result);
    return result;
  },

  // Get pharmacy item by ID
  getPharmacyItemById: async (id) => {
    return await apiRequest(`/medication/items/${id}`);
  },

  // Create pharmacy item
  createPharmacyItem: async (itemData) => {
    return await apiRequest('/medication/items', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  },

  // Update pharmacy item
  updatePharmacyItem: async (id, itemData) => {
    return await apiRequest(`/medication/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData)
    });
  },

  // Delete pharmacy item
  deletePharmacyItem: async (id) => {
    return await apiRequest(`/medication/items/${id}`, {
      method: 'DELETE'
    });
  },

  // Get low stock items
  getLowStockPharmacyItems: async () => {
    console.log('🔧 Making API call to: /medication/items/low-stock');
    const result = await apiRequest('/medication/items/low-stock');
    console.log('🔧 Low stock API Response:', result);
    return result;
  },

  // Generate pharmacy report
  generatePharmacyReport: async (format = 'pdf') => {
    try {
      console.log('🔧 Making API call to generate report with format:', format);
      const response = await fetch(`${API_BASE_URL}/medication/items/report?format=${format}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('🔧 Report API Response received');
      return response; // Return the raw response for blob handling
    } catch (error) {
      console.error('Report generation error:', error);
      throw error;
    }
  }
};

// Default export with all services
export default {
  appointmentService,
  staffService,
  patientService,
  authService,
  departmentService,
  roleService,
  shiftScheduleService,
  pharmacyService
};