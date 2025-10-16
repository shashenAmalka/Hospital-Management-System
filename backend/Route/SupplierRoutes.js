const express = require('express');
const router = express.Router();
const supplierController = require('../Controller/SupplierController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Debug middleware
router.use((req, res, next) => {
  console.log(`[Supplier Route] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
// Sync supplier-item relationships (utility endpoint)
router.post('/sync-relationships', verifyToken, supplierController.syncSupplierItemRelationships);

// Get all suppliers
router.get('/', verifyToken, supplierController.getAllSuppliers);

// Get suppliers with item counts and statistics
router.get('/statistics', verifyToken, supplierController.getSuppliersWithItemCounts);

// Get supplier distribution by category
router.get('/category-distribution', verifyToken, supplierController.getSupplierCategoryDistribution);

// Get active suppliers only (for dropdown)
router.get('/active', verifyToken, supplierController.getActiveSuppliers);

// Get supplier by ID
router.get('/:id', verifyToken, supplierController.getSupplierById);

// Create new supplier
router.post('/', verifyToken, checkRole(['admin', 'pharmacist']), supplierController.createSupplier);

// Update supplier
router.put('/:id', verifyToken, checkRole(['admin', 'pharmacist']), supplierController.updateSupplier);

// Delete supplier
router.delete('/:id', verifyToken, checkRole(['admin', 'pharmacist']), supplierController.deleteSupplier);

module.exports = router;