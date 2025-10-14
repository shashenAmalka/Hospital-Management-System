const express = require('express');
const router = express.Router();
const pharmacyController = require('../Controller/PharmacyItemController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Debug middleware
router.use((req, res, next) => {
  console.log(`[Pharmacy Route] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
router.get('/items', (req, res, next) => {
  console.log('GET /items route hit');
  next();
}, pharmacyController.getAllPharmacyItems);

router.get('/items/report', pharmacyController.generatePharmacyReport);
router.get('/items/low-stock', pharmacyController.getLowStockItems);
router.get('/items/expiring', pharmacyController.getExpiringItems);
router.get('/items/:id', pharmacyController.getPharmacyItemById);
router.get('/user/:userId', pharmacyController.getUserMedications);
// Read-only reporting endpoints - accessible to all authenticated users
router.get('/dispenses/summary', verifyToken, pharmacyController.getPharmacyDispenseSummary);
router.get('/dispenses/analytics', verifyToken, pharmacyController.getPharmacyDispenseAnalytics);
router.get('/dispenses/quick-reports', verifyToken, pharmacyController.getPharmacyQuickReports);

// Protected routes (require authentication and specific roles)
router.post('/items', (req, res, next) => {
  console.log('POST /items route hit');
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  next();
}, verifyToken, checkRole(['admin', 'pharmacist']), pharmacyController.createPharmacyItem);
router.post('/items/:id/dispense', verifyToken, checkRole(['admin', 'pharmacist']), pharmacyController.dispensePharmacyItem);
router.put('/items/:id', verifyToken, checkRole(['admin', 'pharmacist']), pharmacyController.updatePharmacyItem);
router.delete('/items/:id', verifyToken, checkRole(['admin', 'pharmacist']), pharmacyController.deletePharmacyItem);

module.exports = router;
