import React from 'react';

// Utility function for consistent logout across the application
export const performLogout = (navigate = null) => {
  // Clear all authentication data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('user_name');
  localStorage.removeItem('user_id');
  
  // Dispatch custom logout event for other components to react
  window.dispatchEvent(new Event('logout'));
  
  // Navigate to login or home page
  if (navigate) {
    navigate('/login');
  } else {
    window.location.href = '/login';
  }
};

// Hook to listen for logout events
export const useLogoutListener = (onLogout) => {
  React.useEffect(() => {
    const handleLogout = () => {
      if (onLogout) {
        onLogout();
      }
    };
    
    window.addEventListener('logout', handleLogout);
    
    return () => {
      window.removeEventListener('logout', handleLogout);
    };
  }, [onLogout]);
};