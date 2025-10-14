import axios from 'axios';

// Create base axios instance
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor for adding auth token
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log outgoing requests for debugging
    console.debug(`🔄 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    // Log request errors
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common responses
API.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn('🔒 Authentication failed:', error.response?.data?.message || 'Unauthorized');
      
      // If not a login request and not already retrying
      if (!originalRequest._retry && !originalRequest.url?.includes('login')) {
        // Handle token expiration
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Dispatch logout event
        window.dispatchEvent(new Event('auth-error'));
        
        // You can add token refresh logic here if needed
      }
    }
    
    // Log response errors
    console.error(`❌ Response error: ${error.response?.status || 'Network Error'}`, 
      error.response?.data?.message || error.message);
    
    return Promise.reject(error);
  }
);

// API endpoint methods
export const requests = {
  // Auth methods
  auth: {
    login: (credentials) => API.post('/auth/login', credentials),
    register: (userData) => API.post('/auth/register', userData),
    validateToken: () => API.get('/auth/validate'),
  },
  
  // Lab request methods
  labRequests: {
    getAll: () => API.get('/lab-requests'),
    getPatientRequests: () => API.get('/lab-requests/patient'),
    getById: (id) => API.get(`/lab-requests/${id}`),
    create: (data) => API.post('/lab-requests', data),
    update: (id, data) => API.put(`/lab-requests/${id}`, data),
    delete: (id) => API.delete(`/lab-requests/${id}`),
  },
  
  // Appointment methods
  appointments: {
    getAll: () => API.get('/appointments'),
    getUserAppointments: (userId) => API.get(`/appointments/user/${userId}`),
    create: (data) => API.post('/appointments', data),
    update: (id, data) => API.put(`/appointments/${id}`, data),
    cancel: (id) => API.patch(`/appointments/${id}/cancel`),
  },
  
  // User/patient methods
  patients: {
    getProfile: () => API.get('/patients/profile'),
    updateProfile: (data) => API.put('/patients/profile', data),
  },
  
  // Lab reports methods
  labReports: {
    getAll: () => API.get('/lab-reports'),
    getByLabRequestId: (labRequestId) => API.get(`/lab-reports?labRequestId=${labRequestId}`),
    getById: (id) => API.get(`/lab-reports/${id}`),
    create: (data) => API.post('/lab-reports', data),
    update: (id, data) => API.put(`/lab-reports/${id}`, data),
    delete: (id) => API.delete(`/lab-reports/${id}`),
  },
  
  // Medication methods
  medications: {
    getUserMedications: (userId) => API.get(`/medication/user/${userId}`),
  }
};

export default API;