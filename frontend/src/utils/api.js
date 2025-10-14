// API base configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Network status tracking
let isOnline = navigator.onLine;
let lastHealthCheck = null;
let healthCheckInterval = null;

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

// Network status monitoring
const startNetworkMonitoring = () => {
  // Listen for online/offline events
  window.addEventListener('online', () => {
    console.log('🟢 Network connection restored');
    isOnline = true;
    // Immediately check server health when coming back online
    checkServerHealth();
  });
  
  window.addEventListener('offline', () => {
    console.log('🔴 Network connection lost');
    isOnline = false;
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
      healthCheckInterval = null;
    }
  });
  
  // Periodic health checks every 30 seconds
  if (!healthCheckInterval) {
    healthCheckInterval = setInterval(checkServerHealth, 30000);
  }
};

// Server health check function
const checkServerHealth = async (timeout = 5000) => {
  if (!isOnline) {
    return { 
      isHealthy: false, 
      error: 'No internet connection',
      errorType: 'OFFLINE'
    };
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      lastHealthCheck = {
        timestamp: new Date().toISOString(),
        status: 'healthy',
        data
      };
      console.log('✅ Server health check passed:', data);
      return { isHealthy: true, data };
    } else {
      console.log('⚠️ Server health check failed:', response.status);
      return { 
        isHealthy: false, 
        error: `Server returned ${response.status}`,
        errorType: 'SERVER_ERROR'
      };
    }
  } catch (error) {
    let errorType = 'UNKNOWN';
    let errorMessage = error.message;
    
    if (error.name === 'AbortError') {
      errorType = 'TIMEOUT';
      errorMessage = 'Health check timed out';
    } else if (error.message.includes('fetch')) {
      errorType = 'CONNECTION_REFUSED';
      errorMessage = 'Cannot connect to server';
    }
    
    console.error('❌ Server health check failed:', errorMessage);
    return { 
      isHealthy: false, 
      error: errorMessage,
      errorType
    };
  }
};

// Initialize network monitoring
if (typeof window !== 'undefined') {
  startNetworkMonitoring();
  // Initial health check
  setTimeout(checkServerHealth, 1000);
}

// Enhanced retry logic for transient network failures
const retryRequest = async (requestFn, maxRetries = 3, delayMs = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}...`);
      
      // Check network status before attempting
      if (!isOnline) {
        throw new Error('No internet connection');
      }
      
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) or authentication errors
      if (error.response?.status >= 400 && error.response?.status < 500) {
        console.log('❌ Client error detected, not retrying:', error.response.status);
        throw error;
      }
      
      // Network and server error classification
      const isNetworkError = !error.response || 
                           error.message.includes('network') || 
                           error.message.includes('timeout') ||
                           error.message.includes('fetch') ||
                           error.message.includes('ERR_NETWORK') ||
                           error.message.includes('ERR_CONNECTION_REFUSED') ||
                           error.name === 'AbortError' ||
                           !isOnline;
      
      const isServerError = error.response?.status >= 500;
      
      if (!isNetworkError && !isServerError) {
        console.log('❌ Non-retryable error detected:', error.message);
        throw error;
      }
      
      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(2, attempt - 1); // Exponential backoff: 1s, 2s, 4s
        console.log(`⏳ Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        console.log(`🔍 Error type: ${isNetworkError ? 'NETWORK' : 'SERVER'} - ${error.message}`);
        
        // Check server health before retry
        if (isNetworkError && attempt === maxRetries - 1) {
          console.log('🏥 Checking server health before final retry...');
          const healthCheck = await checkServerHealth(3000);
          if (!healthCheck.isHealthy) {
            console.log('❌ Server health check failed, aborting retry');
            const healthError = new Error(`Server unreachable: ${healthCheck.error}`);
            healthError.healthCheck = healthCheck;
            throw healthError;
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('💥 All retry attempts failed');
  lastError.retryAttempts = maxRetries;
  throw lastError;
};

// Enhanced API request function with comprehensive error handling
const apiRequest = async (endpoint, options = {}, timeoutMs = 30000) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Pre-flight checks
  if (!isOnline) {
    console.error('🔴 Cannot make request - device is offline');
    const error = new Error('No internet connection. Please check your network and try again.');
    error.response = {
      status: 0,
      statusText: 'Offline',
      data: {
        message: 'No internet connection',
        errorCode: 'OFFLINE',
        details: { isOnline: false }
      }
    };
    throw error;
  }
  
  const config = {
    headers: getAuthHeaders(),
    ...options
  };

  console.log(`📡 API Request: ${config.method || 'GET'} ${url}`);
  if (config.body) {
    try {
      const bodyData = JSON.parse(config.body);
      console.log('📦 Request Body:', bodyData);
    } catch (e) {
      console.log('📦 Request Body (non-JSON):', config.body);
    }
  }

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const response = await fetch(url, {
      ...config,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(`📥 Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      // Try to get detailed error info from response
      let errorInfo = {
        status: response.status,
        statusText: response.statusText,
        message: `HTTP error! status: ${response.status}`,
        errorCode: null,
        details: null
      };
      
      try {
        const errorData = await response.json();
        console.error('❌ API Error Response:', {
          endpoint,
          status: response.status,
          errorData
        });
        
        if (errorData) {
          errorInfo.message = errorData.message || errorInfo.message;
          errorInfo.errorCode = errorData.errorCode || null;
          errorInfo.details = errorData.details || null;
          errorInfo.timestamp = errorData.timestamp || null;
        }
      } catch (parseError) {
        // If we can't parse the error as JSON, try to get raw text
        try {
          const errorText = await response.text();
          console.error('❌ Error response (non-JSON):', errorText);
          errorInfo.message = errorText || errorInfo.message;
        } catch (e) {
          console.error('❌ Could not parse error response');
        }
      }
      
      // Create enhanced error object
      const error = new Error(errorInfo.message);
      error.response = {
        status: errorInfo.status,
        statusText: errorInfo.statusText,
        data: {
          message: errorInfo.message,
          errorCode: errorInfo.errorCode,
          details: errorInfo.details,
          timestamp: errorInfo.timestamp
        }
      };
      
      throw error;
    }

    // Handle different response types
    let result;
    
    // For 204 No Content responses
    if (response.status === 204) {
      console.log('✅ Request successful (204 No Content)');
      return { status: 'success', data: null };
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      
      if (!text) {
        console.log('✅ Request successful (empty JSON response)');
        return { status: 'success', data: null };
      }
      
      try {
        result = JSON.parse(text);
        console.log('✅ Request successful');
        console.log('📦 Response Data:', result);
        
        // Validate response structure
        if (result === null || result === undefined) {
          console.warn('⚠️ Server returned null/undefined response');
          return { status: 'success', data: null, warning: 'Empty response from server' };
        }
        
        return result;
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        const error = new Error('Server returned invalid JSON response');
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: {
            message: 'Invalid JSON response from server',
            errorCode: 'INVALID_JSON',
            details: { originalText: text.substring(0, 200) }
          }
        };
        throw error;
      }
    } else {
      // For non-JSON responses
      const text = await response.text();
      console.log('✅ Request successful (non-JSON)');
      console.log('📄 Response Text:', text);
      return { status: 'success', data: text };
    }
    
  } catch (error) {
    // Handle different error types
    if (error.name === 'AbortError') {
      console.error('⏱️ Request timeout after', timeoutMs, 'ms');
      const timeoutError = new Error(`Request timeout after ${timeoutMs/1000} seconds. Please check your connection.`);
      timeoutError.response = {
        status: 408,
        statusText: 'Request Timeout',
        data: {
          message: `Request timeout after ${timeoutMs/1000} seconds`,
          errorCode: 'REQUEST_TIMEOUT',
          details: { timeoutMs, endpoint }
        }
      };
      throw timeoutError;
    }
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('🌐 Network connection error:', error.message);
      const networkError = new Error('Cannot connect to server. Please check if the server is running and try again.');
      networkError.response = {
        status: 0,
        statusText: 'Network Error',
        data: {
          message: 'Cannot connect to server',
          errorCode: 'CONNECTION_REFUSED',
          details: { 
            endpoint,
            serverUrl: API_BASE_URL,
            originalError: error.message,
            suggestion: 'Check if backend server is running on http://localhost:5000'
          }
        }
      };
      throw networkError;
    }

    // If error already has response property (from earlier error handling), re-throw
    if (error.response) {
      throw error;
    }

    // Generic error handling
    console.error(`💥 API request failed for ${endpoint}:`, {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    error.response = {
      status: 0,
      statusText: 'Unknown Error',
      data: {
        message: error.message || 'An unexpected error occurred',
        errorCode: 'UNKNOWN_ERROR',
        details: { endpoint, originalError: error.message }
      }
    };
    
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
    
    // Normalize the ID - remove any whitespace
    const normalizedId = id.toString().trim();
    
    if (!normalizedId) {
      throw new Error('Empty ID after normalization');
    }
    
    try {
      const result = await apiRequest(`/appointments/${normalizedId}`, {
        method: 'DELETE'
      });
      
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
    const result = await apiRequest('/medication/items');
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

  // Dispense pharmacy item - with retry logic for critical operation
  dispensePharmacyItem: async (id, payload) => {
    console.log('🔧 Dispense request with retry logic:', { id, payload });
    
    // Use retry logic for this critical operation
    return await retryRequest(
      async () => {
        // Use longer timeout for dispense operations (45 seconds)
        return await apiRequest(`/medication/items/${id}/dispense`, {
          method: 'POST',
          body: JSON.stringify(payload)
        }, 45000); // 45 second timeout
      },
      3, // Max 3 retries
      1000 // Start with 1 second delay, exponential backoff
    );
  },

  // Delete pharmacy item
  deletePharmacyItem: async (id) => {
    return await apiRequest(`/medication/items/${id}`, {
      method: 'DELETE'
    });
  },

  // Get low stock items
  getLowStockPharmacyItems: async () => {
    const result = await apiRequest('/medication/items/low-stock');
    return result;
  },

  // Get expiring items
  getExpiringPharmacyItems: async () => {
    const result = await apiRequest('/medication/items/expiring');
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
      const response = await fetch(`${API_BASE_URL}/medication/items/report?format=${format}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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
    const result = await apiRequest('/suppliers');
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
  // Update lab request
  updateLabRequest: async (requestId, requestData) => {
    return await apiRequest(`/lab-requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(requestData)
    });
  },

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
  // Get all notifications for current user
  getAll: async () => {
    return await apiRequest('/notifications');
  },

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

  // Mark all notifications as read for current user
  markAllAsRead: async () => {
    return await apiRequest('/notifications/mark-all-read', {
      method: 'PUT'
    });
  },

  // Mark all notifications as read for a specific user
  markAllAsReadForUser: async (userId) => {
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
  deleteNotification: async (notificationId) => {
    return await apiRequest(`/notifications/${notificationId}`, {
      method: 'DELETE'
    });
  },

  // Delete (alias for compatibility)
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

// Health Check and Connectivity Service
export const healthService = {
  // Check server health
  checkHealth: async () => {
    return await checkServerHealth();
  },
  
  // Test API connectivity
  testConnection: async () => {
    try {
      const result = await apiRequest('/test', {}, 5000); // 5 second timeout
      console.log('✅ API connectivity test passed');
      return { isConnected: true, data: result };
    } catch (error) {
      console.error('❌ API connectivity test failed:', error);
      return { 
        isConnected: false, 
        error: error.message,
        errorCode: error.response?.data?.errorCode,
        details: error.response?.data?.details
      };
    }
  },
  
  // Get current network status
  getNetworkStatus: () => {
    return {
      isOnline,
      lastHealthCheck,
      serverUrl: API_BASE_URL
    };
  },
  
  // Force a health check
  forceHealthCheck: async () => {
    console.log('🔄 Forcing health check...');
    return await checkServerHealth();
  },
  
  // Get detailed connection info
  getConnectionInfo: async () => {
    const networkStatus = healthService.getNetworkStatus();
    const healthCheck = await checkServerHealth();
    const connectivityTest = await healthService.testConnection();
    
    return {
      timestamp: new Date().toISOString(),
      network: networkStatus,
      server: healthCheck,
      api: connectivityTest,
      recommendations: generateConnectionRecommendations(networkStatus, healthCheck, connectivityTest)
    };
  }
};

// Generate user-friendly recommendations based on connection status
const generateConnectionRecommendations = (network, health, api) => {
  const recommendations = [];
  
  if (!network.isOnline) {
    recommendations.push({
      type: 'OFFLINE',
      message: 'Check your internet connection',
      action: 'Verify WiFi/Ethernet connection and try again'
    });
  } else if (!health.isHealthy) {
    if (health.errorType === 'CONNECTION_REFUSED') {
      recommendations.push({
        type: 'SERVER_DOWN',
        message: 'Backend server is not running',
        action: 'Start the backend server by running "npm start" in the backend directory'
      });
    } else if (health.errorType === 'TIMEOUT') {
      recommendations.push({
        type: 'SERVER_SLOW',
        message: 'Server is responding slowly',
        action: 'Wait a moment and try again, or check server performance'
      });
    } else {
      recommendations.push({
        type: 'SERVER_ERROR',
        message: 'Server is experiencing issues',
        action: 'Check server logs for errors'
      });
    }
  } else if (!api.isConnected) {
    recommendations.push({
      type: 'API_ERROR',
      message: 'API endpoints are not responding correctly',
      action: 'Check API route configuration and server logs'
    });
  } else {
    recommendations.push({
      type: 'HEALTHY',
      message: 'All systems are operational',
      action: 'You can proceed with normal operations'
    });
  }
  
  return recommendations;
};

// Export network monitoring functions
export {
  checkServerHealth,
  startNetworkMonitoring,
  isOnline as getNetworkStatus
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
  userService,
  healthService
};