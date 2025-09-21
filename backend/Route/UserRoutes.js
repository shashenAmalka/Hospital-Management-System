const express = require('express');
const router = express.Router();
const UserController = require('../Controller/UserControllers');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected routes with role-based access
router.get('/', verifyToken, UserController.getAllUsers);
router.get('/:id', verifyToken, UserController.getUserById); // Route to get user by ID
router.post('/', verifyToken, checkRole(['admin']), UserController.addAllUsers);
router.put('/:id', verifyToken, UserController.updateUser); // Allow users to update their own profile
router.delete('/:id', verifyToken, checkRole(['admin']), UserController.deleteUser);

module.exports = router;