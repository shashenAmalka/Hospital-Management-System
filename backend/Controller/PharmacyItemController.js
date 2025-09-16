const mongoose = require('mongoose');
const PharmacyItem = require('../Model/PharmacyItemModel');

// Get all pharmacy items
exports.getAllPharmacyItems = async (req, res) => {
  try {
    const items = await PharmacyItem.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error fetching pharmacy items:', error);
    res.status(500).json({ message: 'Error fetching pharmacy items' });
  }
};

// Get low stock pharmacy items
exports.getLowStockItems = async (req, res) => {
  try {
    const items = await PharmacyItem.find({
      $expr: { $lt: ["$quantity", "$minRequired"] }
    }).sort({ status: 1, name: 1 });
    
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ message: 'Error fetching low stock items' });
  }
};

// Get a single pharmacy item by ID
exports.getPharmacyItemById = async (req, res) => {
  try {
    const item = await PharmacyItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Pharmacy item not found' });
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching pharmacy item:', error);
    res.status(500).json({ message: 'Error fetching pharmacy item' });
  }
};

// Create a new pharmacy item
exports.createPharmacyItem = async (req, res) => {
  try {
    console.log('Creating pharmacy item with body:', req.body);
    const { name, category, quantity, minRequired, unitPrice, expiryDate, manufacturer, description } = req.body;
    
    // Validate required fields
    if (!name || !category || quantity === undefined || minRequired === undefined || unitPrice === undefined) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields',
        requiredFields: { name, category, quantity, minRequired, unitPrice }
      });
    }
    
    // Create item
    const item = new PharmacyItem({
      name,
      category,
      quantity: Number(quantity),
      minRequired: Number(minRequired),
      unitPrice: Number(unitPrice),
      expiryDate,
      manufacturer,
      description,
      updatedBy: req.user ? req.user._id : null
    });
    
    const savedItem = await item.save();
    console.log('Item saved successfully:', savedItem);
    
    res.status(201).json({
      success: true,
      message: 'Pharmacy item created successfully',
      data: savedItem
    });
  } catch (error) {
    console.error('Error creating pharmacy item:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating pharmacy item',
      error: error.message
    });
  }
};

// Update a pharmacy item
exports.updatePharmacyItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, minRequired, unitPrice, expiryDate, manufacturer, description } = req.body;
    
    // Find item
    const item = await PharmacyItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Pharmacy item not found' });
    }
    
    // Update fields
    if (name) item.name = name;
    if (category) item.category = category;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (minRequired !== undefined) item.minRequired = Number(minRequired);
    if (unitPrice !== undefined) item.unitPrice = Number(unitPrice);
    if (expiryDate) item.expiryDate = expiryDate;
    if (manufacturer) item.manufacturer = manufacturer;
    if (description) item.description = description;
    
    if (req.user) {
      item.updatedBy = req.user._id;
    }
    
    await item.save();
    
    res.status(200).json({
      success: true,
      message: 'Pharmacy item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Error updating pharmacy item:', error);
    res.status(500).json({ message: 'Error updating pharmacy item' });
  }
};

// Delete a pharmacy item
exports.deletePharmacyItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await PharmacyItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Pharmacy item not found' });
    }
    
    await PharmacyItem.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Pharmacy item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pharmacy item:', error);
    res.status(500).json({ message: 'Error deleting pharmacy item' });
  }
};
