const jwt = require('jsonwebtoken');

// Get JWT secret with fallback for development
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

const verifyToken = (req, res, next) => {
  console.log('[Auth] Verifying token...');
  console.log('[Auth] Authorization header:', req.headers.authorization);
  
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.log('[Auth] No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[Auth] Token decoded successfully:', { userId: decoded.id, role: decoded.role });
    req.user = decoded;
    next();
  } catch (error) {
    console.error('[Auth] Token verification error:', error.message);
    return res.status(401).json({ 
      message: 'Invalid or expired token',
      error: error.message 
    });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    console.log('[Auth] Checking role...');
    console.log('[Auth] User role:', req.user?.role);
    console.log('[Auth] Required roles:', roles);
    
    if (!roles.includes(req.user.role)) {
      console.log('[Auth] Access denied - insufficient permissions');
      return res.status(403).json({ 
        message: 'Access denied',
        details: `Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }
    
    console.log('[Auth] Role check passed');
    next();
  };
};

// Allow users to update their own profile OR admin to update any profile
const checkSelfOrAdmin = (req, res, next) => {
  console.log('User ID from token:', req.user.id);
  console.log('Target user ID from params:', req.params.id);
  console.log('User role:', req.user.role);

  // Admin can update any profile
  if (req.user.role === 'admin') {
    console.log('Access granted: User is admin');
    return next();
  }

  // User can update their own profile
  const tokenUserId = req.user.id ? req.user.id.toString() : '';
  const targetUserId = req.params.id ? req.params.id.toString() : '';

  if (tokenUserId && targetUserId && tokenUserId === targetUserId) {
    console.log('Access granted: User updating own profile');
    return next();
  }

  console.log('Access denied: Not admin and not own profile');
  return res.status(403).json({ 
    message: 'Access denied',
    details: 'You can only update your own profile'
  });
};

module.exports = { verifyToken, checkRole, checkSelfOrAdmin };
