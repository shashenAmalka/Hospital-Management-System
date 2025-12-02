const express = require('express');
const router = express.Router();
const AuthController = require('../Controller/AuthController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes (require authentication)
router.get('/validate', verifyToken, AuthController.validateToken);
router.get('/profile', verifyToken, AuthController.getProfile);
router.put('/profile', verifyToken, AuthController.updateProfile);

module.exports = router;
