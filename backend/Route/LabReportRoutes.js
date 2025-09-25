const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const labReportController = require('../Controller/LabReportController');

// Debug middleware for all routes
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  next();
});

// Create a lab report
router.post(
  '/', 
  verifyToken, 
  checkRole(['lab_technician', 'admin']), 
  labReportController.createLabReport
);

// Get all lab reports (with filtering and pagination)
router.get(
  '/', 
  verifyToken, 
  checkRole(['lab_technician', 'doctor', 'admin', 'patient']), 
  labReportController.getAllLabReports
);

// Get a lab report by ID
router.get(
  '/:id', 
  verifyToken, 
  checkRole(['lab_technician', 'doctor', 'admin', 'patient']), 
  labReportController.getLabReportById
);

// Update a lab report - only allowed within 20 minutes of creation
router.put(
  '/:id', 
  verifyToken, 
  checkRole(['lab_technician', 'admin']),
  labReportController.updateLabReport
);

// Delete a lab report
router.delete(
  '/:id', 
  verifyToken, 
  checkRole(['lab_technician', 'admin']),
  labReportController.deleteLabReport
);

module.exports = router;