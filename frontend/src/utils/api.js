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
  
  // Add detailed logging for all operations
  if (options.method) {
    console.log(`Making ${options.method} request to: ${url}`);
    if (options.body) {
      try {
        console.log('Request payload:', JSON.parse(options.body));
      } catch (e) {
        console.log('Request payload (raw):', options.body);
      }
    }
  }
  
  const config = {
    headers: getAuthHeaders(),
    ...options
  };

  try {
    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    const response = await fetch(url, config);
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      // Try to get detailed error info from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        }
        console.error('Error details from server:', errorData);
      } catch (parseError) {
        // If we can't parse the error as JSON, try to get raw text
        try {
          const errorText = await response.text();
          console.error('Error response (non-JSON):', errorText);
        } catch (e) {
          // If all else fails, just use the status code
        }
      }
      
      throw new Error(errorMessage);
    }

    // For 204 No Content responses, return a success response without trying to parse JSON
    if (response.status === 204) {
      return { status: 'success', data: null };
    }

    // Check if there's content to parse
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      // Only parse as JSON if there's actual content
      return text ? JSON.parse(text) : { status: 'success', data: null };
    } else {
      // For non-JSON responses
      return { status: 'success', data: null };
    }
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
    // Ensure all fields have the correct data types
    const formattedData = {
      ...appointmentData,
      // Ensure patient and doctor are strings (ObjectId)
      patient: String(appointmentData.patient),
      doctor: String(appointmentData.doctor),
      // Ensure department is a string (ObjectId)
      department: String(appointmentData.department),
      // Format the date properly for MongoDB
      appointmentDate: appointmentData.appointmentDate
    };
    
    console.log('Sending formatted appointment data:', formattedData);
    
    return await apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(formattedData)
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
    if (!id) {
      throw new Error('Appointment ID is required for deletion');
    }
    
    console.log(`Deleting appointment with ID: ${id}`, {
      idType: typeof id,
      idLength: id.length
    });
    
    // Normalize the ID - remove any whitespace
    const normalizedId = id.toString().trim();
    
    if (!normalizedId) {
      throw new Error('Empty ID after normalization');
    }
    
    try {
      // Log the exact URL being called
      console.log(`DELETE request URL: ${API_BASE_URL}/appointments/${normalizedId}`);
      
      const result = await apiRequest(`/appointments/${normalizedId}`, {
        method: 'DELETE'
      });
      
      console.log('Delete response:', result);
      return result;
    } catch (error) {
      console.error(`Error deleting appointment ${id}:`, error);
      
      // Check if it's a 404 error
      if (error.message && error.message.includes('404')) {
        console.warn('Appointment may have already been deleted or never existed');
        // Return success even though it was a 404, as the end result is the same
        // (the appointment doesn't exist anymore)
        return { status: 'success', data: null, note: 'Appointment not found, may have been deleted already' };
      }
      
      throw error;
    }
  },

  // Get appointments by patient ID
  getByPatientId: async (patientId) => {
    return await apiRequest(`/appointments/user/${patientId}`);
  },

  // Get appointments by doctor ID
  getByDoctorId: async (doctorId) => {
    return await apiRequest(`/appointments/doctor/${doctorId}`);
  },

  // Get upcoming appointments
  getUpcoming: async () => {
    return await apiRequest('/appointments/upcoming');
  },

  // Get today's appointments
  getToday: async () => {
    return await apiRequest('/appointments/today');
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
    return await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  // Register
  register: async (userData) => {
    return await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Dispatch custom logout event for other components
    window.dispatchEvent(new Event('logout'));
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

  // Dispense pharmacy item
  dispensePharmacyItem: async (id, payload) => {
    return await apiRequest(`/medication/items/${id}/dispense`, {
      method: 'POST',
      body: JSON.stringify(payload)
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

  // Get expiring items
  getExpiringPharmacyItems: async () => {
    console.log('🔧 Making API call to: /medication/items/expiring');
    const result = await apiRequest('/medication/items/expiring');
    console.log('🔧 Expiring items API Response:', result);
    return result;
  },

  // Get dispense summary (defaults to today)
  getTodayDispenseSummary: async () => {
    console.log('🔧 Making API call to: /medication/dispenses/summary?range=today');
    const result = await apiRequest('/medication/dispenses/summary?range=today');
    console.log('🔧 Dispense summary API Response:', result);
    return result;
  },

  // Get dispense analytics for reports
  getDispenseAnalytics: async (month, year) => {
    const params = new URLSearchParams();
    if (month !== undefined && month !== null) params.append('month', month);
    if (year !== undefined && year !== null) params.append('year', year);

    const query = params.toString();
    const endpoint = query ? `/medication/dispenses/analytics?${query}` : '/medication/dispenses/analytics';

    console.log('🔧 Making API call to:', endpoint);
    const result = await apiRequest(endpoint);
    console.log('🔧 Dispense analytics API Response:', result);
    return result;
  },

  // Get quick report aggregates
  getQuickReports: async () => {
    console.log('🔧 Making API call to: /medication/dispenses/quick-reports');
    const result = await apiRequest('/medication/dispenses/quick-reports');
    console.log('🔧 Quick reports API Response:', result);
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


// Supplier service
export const supplierService = {
  // Get all suppliers
  getAllSuppliers: async () => {
    console.log('🔧 Making API call to: /suppliers');
    const result = await apiRequest('/suppliers');
    console.log('🔧 Suppliers API Response:', result);
    return result;
  },

  // Get suppliers with statistics
  getSuppliersWithStats: async () => {
    return await apiRequest('/suppliers/statistics');
  },

  // Get supplier distribution by inventory category
  getSupplierCategoryDistribution: async () => {
    console.log('🔧 Making API call to: /suppliers/category-distribution');
    const result = await apiRequest('/suppliers/category-distribution');
    console.log('🔧 Supplier category distribution API Response:', result);
    return result;
  },

  // Get active suppliers only (for dropdown)
  getActiveSuppliers: async () => {
    return await apiRequest('/suppliers/active');
  },

  // Get supplier by ID
  getSupplierById: async (id) => {
    return await apiRequest(`/suppliers/${id}`);
  },

  // Create supplier
  createSupplier: async (supplierData) => {
    return await apiRequest('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData)
    });
  },

  // Update supplier
  updateSupplier: async (id, supplierData) => {
    return await apiRequest(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData)
    });
  },

  // Delete supplier
  deleteSupplier: async (id) => {
    return await apiRequest(`/suppliers/${id}`, {
      method: 'DELETE'
    });
  },

  // Sync supplier-item relationships
  syncSupplierItemRelationships: async () => {
    return await apiRequest('/suppliers/sync-relationships', {
      method: 'POST'
    });
  }
};

// Lab service
export const labService = {
  // Update test status
  updateTestStatus: async (testId, status) => {
    return await apiRequest(`/lab-requests/${testId}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // Complete test with results
  completeTest: async (testData) => {
    return await apiRequest(`/lab-requests/${testData.testId}/complete`, {
      method: 'PUT',
      body: JSON.stringify({
        result: testData.result,
        notes: testData.notes,
        isCritical: testData.isCritical,
        status: 'completed'
      })
    });
  },

  // Get completed tests
  getCompletedTests: async () => {
    return await apiRequest('/lab-requests?status=completed');
  },

  // Get lab statistics
  getLabStats: async () => {
    return await apiRequest('/lab-requests/stats');
  },

  // Update sample status
  updateSampleStatus: async (testId, isCollected) => {
    return await apiRequest(`/lab-requests/${testId}/sample`, {
      method: 'PUT',
      body: JSON.stringify({ sampleCollected: isCollected })
    });
  },

  // Get all lab requests
  getAllRequests: async () => {
    return await apiRequest('/lab-requests/all');
  },

  // Get pending tests
  getPendingTests: async () => {
    return await apiRequest('/lab-requests?status=pending');
  },

  // Get in-progress tests
  getInProgressTests: async () => {
    return await apiRequest('/lab-requests?status=in_progress');
  }
};

// Notification service
export const notificationService = {
  // Get notifications for a user
  getUserNotifications: async (userId) => {
    return await apiRequest(`/notifications/user/${userId}`);
  },

  // Get unread notification count
  getUnreadCount: async (userId) => {
    return await apiRequest(`/notifications/user/${userId}/unread-count`);
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    return await apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  },

  // Mark all notifications as read for a user
  markAllAsRead: async (userId) => {
    return await apiRequest(`/notifications/user/${userId}/mark-all-read`, {
      method: 'PUT'
    });
  },

  // Create new notification
  create: async (notificationData) => {
    return await apiRequest('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    });
  },

  // Delete notification
  delete: async (notificationId) => {
    return await apiRequest(`/notifications/${notificationId}`, {
      method: 'DELETE'

    });
  }
};

// User service for managing users
export const userService = {
  // Get all users with optional role filter
  getAll: async (role = null) => {
    const endpoint = role ? `/users?role=${role}` : '/users';
    return await apiRequest(endpoint);
  },

  // Get user by ID
  getById: async (id) => {
    return await apiRequest(`/users/${id}`);
  },

  // Create new user
  create: async (userData) => {
    return await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Update user
  update: async (id, userData) => {
    return await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  // Delete user
  delete: async (id) => {
    return await apiRequest(`/users/${id}`, {
      method: 'DELETE'
    });
  },

  // Get patients specifically
  getPatients: async () => {
    return await apiRequest('/users?role=patient');
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
  pharmacyService,
  supplierService,
  labService,
  notificationService,
  userService
};