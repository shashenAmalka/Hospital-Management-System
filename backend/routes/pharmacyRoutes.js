const express = require('express');
const router = express.Router();
const pharmacyController = require('../Controller/PharmacyItemController');
const authMiddleware = require('../Middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware.protect);

// Routes for pharmacy items
router.get('/items', pharmacyController.getAllPharmacyItems);
router.get('/items/low-stock', pharmacyController.getLowStockItems);
router.get('/items/:id', pharmacyController.getPharmacyItemById);
router.post('/items', pharmacyController.createPharmacyItem);
router.put('/items/:id', pharmacyController.updatePharmacyItem);
router.delete('/items/:id', pharmacyController.deletePharmacyItem);

module.exports = router;
router.delete('/items/:id', pharmacyController.deletePharmacyItem);

module.exports = router;
