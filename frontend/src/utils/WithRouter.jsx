import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Higher-order component to provide router props to class components
export const withRouter = (Component) => {
  const WithRouterWrapper = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    return <Component navigate={navigate} location={location} {...props} />;
  };
  
  return WithRouterWrapper;
};
