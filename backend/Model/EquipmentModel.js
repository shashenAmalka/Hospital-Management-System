const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  serialNumber: {
    type: String
  },
  manufacturer: {
    type: String
  },
  status: {
    type: String,
    enum: ['operational', 'maintenance', 'out_of_service'],
    default: 'operational'
  },
  lastCalibration: {
    type: Date,
    required: true
  },
  nextCalibration: {
    type: Date,
    required: true
  },
  calibrationHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    result: {
      type: String,
      enum: ['passed', 'failed', 'adjusted'],
      required: true
    }
  }],
  maintenanceHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['routine', 'repair', 'inspection'],
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    cost: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);
