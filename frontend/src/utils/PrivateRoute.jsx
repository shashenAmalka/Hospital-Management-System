import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    // Debug logging to help identify role issues
    if (user && user.role) {
      console.log(`PrivateRoute: User role is ${user.role}, allowed roles:`, allowedRoles);
    }

    if (!token || !user) {
      // Redirect to login if not authenticated
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user has required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      console.warn(`User with role ${user.role} attempted to access a route requiring roles:`, allowedRoles);
      return <Navigate to="/" replace />;
    }

    // Save user_name and user_role for easy access by components
    if (user.name || user.firstName) {
      localStorage.setItem('user_name', user.name || `${user.firstName} ${user.lastName || ''}`);
    }
    if (user.role) {
      localStorage.setItem('user_role', user.role);
    }

    return children;
  } catch (error) {
    console.error('Error in PrivateRoute:', error);
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;
