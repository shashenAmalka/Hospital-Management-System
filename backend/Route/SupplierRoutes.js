const express = require('express');
const router = express.Router();
const supplierController = require('../Controller/SupplierController');

// Debug middleware
router.use((req, res, next) => {
  console.log(`[Supplier Route] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
// Sync supplier-item relationships (utility endpoint)
router.post('/sync-relationships', supplierController.syncSupplierItemRelationships);

// Get all suppliers
router.get('/', supplierController.getAllSuppliers);

// Get suppliers with item counts and statistics
router.get('/statistics', supplierController.getSuppliersWithItemCounts);

// Get active suppliers only (for dropdown)
router.get('/active', supplierController.getActiveSuppliers);

// Get supplier by ID
router.get('/:id', supplierController.getSupplierById);

// Create new supplier
router.post('/', supplierController.createSupplier);

// Update supplier
router.put('/:id', supplierController.updateSupplier);

// Delete supplier
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;