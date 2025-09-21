const mongoose = require('mongoose');

const labInventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0
  },
  minRequired: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['adequate', 'low', 'critical'],
    default: 'adequate'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  stockHistory: [{
    quantity: Number,
    operation: {
      type: String,
      enum: ['add', 'remove']
    },
    date: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }]
}, { timestamps: true });

// Pre-save middleware to calculate status based on current stock and minimum required
labInventorySchema.pre('save', function(next) {
  if (this.currentStock <= this.minRequired * 0.25) {
    this.status = 'critical';
  } else if (this.currentStock < this.minRequired) {
    this.status = 'low';
  } else {
    this.status = 'adequate';
  }
  next();
});

module.exports = mongoose.model('LabInventory', labInventorySchema);
