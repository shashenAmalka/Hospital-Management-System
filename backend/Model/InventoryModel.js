const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Medication', 'Equipment', 'Supplies', 'Lab Materials']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  minStockLevel: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  lastRestocked: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inventory', inventorySchema);