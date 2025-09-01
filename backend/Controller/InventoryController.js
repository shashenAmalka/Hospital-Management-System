const Inventory = require('../models/InventoryModel');

// Get all inventory items
const getAllInventory = async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    let filter = { isActive: true };
    
    if (category) filter.category = category;
    if (lowStock === 'true') {
      filter.quantity = { $lte: { $min: '$minStockLevel' } };
    }
    
    const inventory = await Inventory.find(filter).sort({ name: 1 });
    res.status(200).json({ inventory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create inventory item (Admin only)
const createInventoryItem = async (req, res) => {
  try {
    const inventory = new Inventory(req.body);
    await inventory.save();
    res.status(201).json({ inventory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update inventory item (Admin only)
const updateInventoryItem = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json({ inventory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get low stock items
const getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      quantity: { $lte: { $min: '$minStockLevel' } },
      isActive: true
    });
    res.status(200).json({ lowStockItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllInventory,
  createInventoryItem,
  updateInventoryItem,
  getLowStockItems
};