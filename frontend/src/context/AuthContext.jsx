import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiServices } from '../utils/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(storedToken);
          setIsAuthenticated(true);
          
          // Validate token with backend (optional - don't logout if fails)
          try {
            const response = await apiServices.auth.validateToken();
            console.log('Token validation successful:', response);
            
            // Update user data if backend returns updated info
            if (response.user) {
              const updatedUser = { ...userData, ...response.user };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          } catch (error) {
            console.warn('Token validation failed (user will stay logged in):', error);
            // Don't logout here - token might still be valid, just network issue
            // Only logout if we get a clear 401 Unauthorized response
            if (error.response?.status === 401) {
              console.log('Token is invalid - logging out');
              handleLogout();
            }
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // Only clear auth if there's a parse error or critical issue
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Listen for auth errors
  useEffect(() => {
    const handleAuthError = () => {
      setAuthError('Your session has expired. Please log in again.');
      handleLogout();
      // Use window.location for navigation since we're outside Router context
      window.location.href = '/login';
    };
    
    window.addEventListener('auth-error', handleAuthError);
    
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, []);

  // Listen for logout events
  useEffect(() => {
    const handleLogoutEvent = () => {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('logout', handleLogoutEvent);
    
    return () => {
      window.removeEventListener('logout', handleLogoutEvent);
    };
  }, []);

  const handleLogin = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      // Call API for login
      const response = await apiServices.auth.login(credentials);
      const { user: userData, token: authToken } = response;
      
      // Update state
      setUser(userData);
      setToken(authToken);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', authToken);
      
      // Store user name for convenience
      if (userData.firstName && userData.lastName) {
        localStorage.setItem('user_name', `${userData.firstName} ${userData.lastName}`);
      } else if (userData.name) {
        localStorage.setItem('user_name', userData.name);
      }

      // Dispatch custom event for real-time UI updates
      window.dispatchEvent(new CustomEvent('auth-state-change', { 
        detail: { isAuthenticated: true, user: userData } 
      }));
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login failed:', error);
      setAuthError(error.response?.data?.message || 'Login failed. Please check your credentials.');
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    // Clear state
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_name');
    
    // Dispatch custom events for real-time UI updates
    window.dispatchEvent(new Event('logout'));
    window.dispatchEvent(new CustomEvent('auth-state-change', { 
      detail: { isAuthenticated: false, user: null } 
    }));
    
    // Use window.location for navigation since we're outside Router context
    window.location.href = '/login';
  }, []);

  // Helper function to get dashboard route based on role
  const getDashboardRoute = useCallback((userRole = null) => {
    const role = userRole || user?.role;
    
    const roleRoutes = {
      'patient': '/patient-dashboard',
      'doctor': '/doctor/dashboard',
      'admin': '/admin/dashboard',
      'pharmacist': '/pharmacist/dashboard',
      'lab_technician': '/lab-technician',
      'staff': '/staff-dashboard'
    };

    return roleRoutes[role] || '/patient-dashboard';
  }, [user]);

  // Helper function to check if user has specific role
  const hasRole = useCallback((requiredRole) => {
    if (!user || !user.role) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  }, [user]);

  // Helper function to get user display name
  const getUserDisplayName = useCallback(() => {
    if (!user) return '';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    if (user.name) {
      return user.name;
    }
    
    return user.email || 'User';
  }, [user]);

  // Helper function to get user initials for avatar
  const getUserInitials = useCallback(() => {
    if (!user) return '?';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    
    if (user.name) {
      const nameParts = user.name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    
    return user.email ? user.email[0].toUpperCase() : '?';
  }, [user]);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token,
        isAuthenticated, 
        loading,
        authError,
        login: handleLogin, 
        logout: handleLogout,
        getDashboardRoute,
        hasRole,
        getUserDisplayName,
        getUserInitials
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;