const express = require('express');
const router = express.Router();
const AuthController = require('../Controller/AuthController');

router.post('/register', AuthController.register);
router.post('/register-staff', AuthController.registerStaff);
router.post('/login', AuthController.login);
router.get('/test-staff-auth', AuthController.testStaffAuth);

module.exports = router;
