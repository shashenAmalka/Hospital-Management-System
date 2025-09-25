const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
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
