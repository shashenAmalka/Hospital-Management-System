// If this file already exists, just add this as a placeholder for testing

exports.protect = (req, res, next) => {
  console.log('Auth middleware: protect');
  
  try {
    // Get token from request header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided, but continuing for testing');
      // For testing, we'll continue anyway
      req.user = { id: '000000000000000000000000', role: 'pharmacist' };
      return next();
    }
    
    // In a real implementation, verify the token here
    // For now, we'll just create a dummy user
    req.user = { id: '000000000000000000000000', role: 'pharmacist' };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    req.user = { id: '000000000000000000000000', role: 'pharmacist' };
    next();
  }
};

exports.restrictTo = (...roles) => {
  console.log('Auth middleware: restrictTo', roles);
  return (req, res, next) => {
    if (!req.user) {
      console.log('No user in request, but continuing for testing');
      req.user = { id: '000000000000000000000000', role: 'pharmacist' };
    }
    
    if (!roles.includes(req.user.role)) {
      console.log(`User role ${req.user.role} not authorized for this route`);
      // But we'll continue anyway for testing
    }
    
    console.log('Authorization passed or bypassed for testing');
    next();
  };
};
