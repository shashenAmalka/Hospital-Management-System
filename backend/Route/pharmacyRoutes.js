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

router.get('/items/low-stock', pharmacyController.getLowStockItems);
router.get('/items/:id', pharmacyController.getPharmacyItemById);
router.post('/items', pharmacyController.createPharmacyItem);
router.put('/items/:id', pharmacyController.updatePharmacyItem);
router.delete('/items/:id', pharmacyController.deletePharmacyItem);

module.exports = router;
