const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testType: {
    type: String,
    required: true,
    enum: ['Blood Test', 'Urine Test', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound']
  },
  status: {
    type: String,
    enum: ['Requested', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Requested'
  },
  results: {
    type: String,
    trim: true
  },
  findings: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  sampleCollectionDate: {
    type: Date
  },
  resultDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['Normal', 'Urgent', 'Emergency'],
    default: 'Normal'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LabTest', labTestSchema);