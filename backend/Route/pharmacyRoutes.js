const express = require('express');
const router = express.Router();
const pharmacyController = require('../Controller/PharmacyItemController');

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
router.get('/items/:id', pharmacyController.getPharmacyItemById);
router.get('/user/:userId', pharmacyController.getUserMedications);
router.get('/dispenses/summary', verifyToken, checkRole(['admin', 'pharmacist']), pharmacyController.getPharmacyDispenseSummary);
router.get('/dispenses/analytics', verifyToken, checkRole(['admin', 'pharmacist']), pharmacyController.getPharmacyDispenseAnalytics);
router.get('/dispenses/quick-reports', verifyToken, checkRole(['admin', 'pharmacist']), pharmacyController.getPharmacyQuickReports);

// Protected routes (require authentication and specific roles)
router.post('/items', verifyToken, checkRole(['admin', 'pharmacist']), pharmacyController.createPharmacyItem);
router.post('/items/:id/dispense', verifyToken, checkRole(['admin', 'pharmacist']), pharmacyController.dispensePharmacyItem);
router.put('/items/:id', verifyToken, checkRole(['admin', 'pharmacist']), pharmacyController.updatePharmacyItem);
router.delete('/items/:id', verifyToken, checkRole(['admin', 'pharmacist']), pharmacyController.deletePharmacyItem);

module.exports = router;
