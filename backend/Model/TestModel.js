const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  testType: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sampleCollected: {
    type: Boolean,
    default: false
  },
  sampleCollectedAt: {
    type: Date
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  deadline: {
    type: Date,
    required: true
  },
  result: {
    type: String
  },
  notes: {
    type: String
  },
  isCritical: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
