const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Verify JWT token middleware
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Debug authorization header
    console.log('Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided or invalid format' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    console.log('Token received:', token.substring(0, 10) + '...');
    
    // Use a try-catch specifically for token verification
    try {
      // Make sure we have a JWT_SECRET
      if (!process.env.JWT_SECRET) {
        console.warn('JWT_SECRET is not defined, using fallback secret');
        process.env.JWT_SECRET = 'fallback-jwt-secret-for-development-only';
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token payload:', decoded);
      
      // Set user information from token
      req.user = decoded;
      
      // Ensure we have a consistent user ID field
      if (!req.user._id && req.user.id) {
        req.user._id = req.user.id;
      }
      
      console.log('User attached to request:', req.user);
      next();
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      return res.status(401).json({ message: 'Invalid token', error: tokenError.message });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Authentication middleware error', error: error.message });
  }
};

// Check user role middleware
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    next();
  };
};
