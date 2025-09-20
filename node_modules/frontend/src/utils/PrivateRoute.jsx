import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../Components/Dashboard/DashboardLayout';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        setIsAuthenticated(false);
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }
      
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role);
        setIsAuthenticated(true);
        
        // If no specific roles are required or user role is in allowed roles
        if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        setIsAuthenticated(false);
        setIsAuthorized(false);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAuthorized) {
    // Redirect to appropriate dashboard based on role
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin-dashboard" replace />;
      case 'doctor':
        return <Navigate to="/doctor-dashboard" replace />;
      case 'pharmacist':
        return <Navigate to="/pharmacist-dashboard" replace />;
      case 'lab_technician':
        return <Navigate to="/lab-dashboard" replace />;
      case 'staff':
        return <Navigate to="/staff-dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // If path includes dashboard, wrap with DashboardLayout
  if (location.pathname.includes('dashboard') || 
      location.pathname.includes('inventory') || 
      location.pathname.includes('doctors') ||
      location.pathname.includes('laboratory')) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  // Otherwise just render the children
  return children;
};

export default PrivateRoute;
