import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Authentication state management
let authInterceptorId = null;
let isRefreshing = false;
let failedQueue = [];

// Process queue of failed requests
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Add authentication token to requests
const setupAuthInterceptor = () => {
  // Remove any existing interceptor
  if (authInterceptorId !== null) {
    api.interceptors.request.eject(authInterceptorId);
  }
  
  // Add new interceptor
  authInterceptorId = api.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );
};

// Handle response interceptor for auth errors
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If auth error and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If an auth error occurs on the auth endpoints, just let it fail
      const isAuthEndpoint = originalRequest.url?.includes('/auth/');
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }
      
      // Try token refresh logic here if your backend supports it
      // For now, we'll just clear auth state and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Dispatch auth error event for components to listen
      window.dispatchEvent(new Event('auth-error'));
      
      // You could add token refresh logic here later:
      /*
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          const response = await api.post('/auth/refresh', { 
            refreshToken: localStorage.getItem('refreshToken') 
          });
          
          const { token } = response.data;
          localStorage.setItem('token', token);
          
          // Update auth header for failed request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          // Process queue with new token
          processQueue(null, token);
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      */
    }
    
    return Promise.reject(error);
  }
);

// Initialize auth interceptor
setupAuthInterceptor();

// Authentication service
const auth = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  validateToken: async () => {
    const response = await api.get('/auth/validate');
    return response.data;
  },
  
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_name');
    window.dispatchEvent(new Event('logout'));
  }
};

// Lab requests service
const labRequests = {
  getAll: async () => {
    const response = await api.get('/lab-requests');
    return response.data;
  },
  
  getPatientRequests: async () => {
    const response = await api.get('/lab-requests/patient');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/lab-requests/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/lab-requests', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/lab-requests/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/lab-requests/${id}`);
    return response.data;
  },
  
  updateStatus: async (id, status) => {
    const response = await api.patch(`/lab-requests/${id}/status`, { status });
    return response.data;
  }
};

// Lab reports service
const labReports = {
  getAll: async () => {
    const response = await api.get('/lab-reports');
    return response.data;
  },
  
  getByLabRequestId: async (labRequestId) => {
    const response = await api.get(`/lab-reports?labRequestId=${labRequestId}`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/lab-reports/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/lab-reports', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/lab-reports/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/lab-reports/${id}`);
    return response.data;
  }
};

// Appointments service
const appointments = {
  getAll: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },
  
  getUserAppointments: async (userId) => {
    const response = await api.get(`/appointments/user/${userId}`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },
  
  cancel: async (id) => {
    const response = await api.patch(`/appointments/${id}/cancel`);
    return response.data;
  }
};

// Patients service
const patients = {
  getAll: async () => {
    const response = await api.get('/patients');
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/patients/profile');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/patients', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/patients/${id}`, data);
    return response.data;
  },
  
  updateProfile: async (data) => {
    const response = await api.put('/patients/profile', data);
    return response.data;
  }
};

// Export all services
export const apiServices = {
  auth,
  labRequests,
  labReports,
  appointments,
  patients
};

// Export the configured axios instance for direct use
export default api;