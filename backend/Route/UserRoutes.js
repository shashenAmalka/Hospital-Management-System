const express = require('express');
const router = express.Router();
const UserController = require('../Controller/UserControllers');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected routes with role-based access
router.get('/', verifyToken, UserController.getAllUsers);
router.get('/:id', verifyToken, UserController.getUserById); // Add route for getting user by ID
router.post('/', verifyToken, checkRole(['admin']), UserController.addAllUsers);
router.put('/:id', verifyToken, checkRole(['admin']), UserController.updateUser);
router.delete('/:id', verifyToken, checkRole(['admin']), UserController.deleteUser);

module.exports = router;