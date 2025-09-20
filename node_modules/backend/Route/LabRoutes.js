const express = require('express');
const router = express.Router();
const path = require('path');
const LabController = require('../Controller/LabController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Log model paths for debugging
console.log('Loading lab routes, models directory:', path.join(__dirname, '..', 'Model'));

// Test routes
router.get('/stats', verifyToken, checkRole(['admin', 'lab_technician']), LabController.getLabStats);
router.get('/tests/pending', verifyToken, checkRole(['admin', 'lab_technician', 'doctor']), LabController.getPendingTests);
router.get('/tests/in-progress', verifyToken, checkRole(['admin', 'lab_technician', 'doctor']), LabController.getInProgressTests);
router.get('/tests/completed', verifyToken, checkRole(['admin', 'lab_technician', 'doctor']), LabController.getCompletedTests);
router.post('/tests', verifyToken, checkRole(['admin', 'doctor']), LabController.requestTest);
router.put('/tests/:id/status', verifyToken, checkRole(['admin', 'lab_technician']), LabController.updateTestStatus);
router.put('/tests/:id/sample', verifyToken, checkRole(['admin', 'lab_technician']), LabController.updateSampleStatus);
router.post('/tests/:id/complete', verifyToken, checkRole(['admin', 'lab_technician']), LabController.completeTest);

// Inventory routes
router.get('/inventory', verifyToken, checkRole(['admin', 'lab_technician']), LabController.getLabInventory);
router.post('/inventory', verifyToken, checkRole(['admin', 'lab_technician']), LabController.addInventoryItem);
router.put('/inventory/:id', verifyToken, checkRole(['admin', 'lab_technician']), LabController.updateInventoryItem);
router.get('/inventory/low-stock', verifyToken, checkRole(['admin', 'lab_technician']), LabController.getLowStockItems);

// Equipment routes
router.get('/equipment', verifyToken, checkRole(['admin', 'lab_technician']), LabController.getEquipmentStatus);
router.post('/equipment', verifyToken, checkRole(['admin', 'lab_technician']), LabController.addEquipment);
router.put('/equipment/:id', verifyToken, checkRole(['admin', 'lab_technician']), LabController.updateEquipmentStatus);
router.post('/equipment/:id/calibration', verifyToken, checkRole(['admin', 'lab_technician']), LabController.logCalibration);

module.exports = router;
