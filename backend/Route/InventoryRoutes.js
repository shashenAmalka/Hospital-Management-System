const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const {
  getAllInventory,
  createInventoryItem,
  updateInventoryItem,
  getLowStockItems
} = require('../controllers/inventoryController');

router.get('/', verifyToken, getAllInventory);
router.get('/low-stock', verifyToken, checkRole(['admin']), getLowStockItems);
router.post('/', verifyToken, checkRole(['admin']), createInventoryItem);
router.put('/:id', verifyToken, checkRole(['admin']), updateInventoryItem);

module.exports = router;