const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  leaveType: {
    type: String,
    required: true,
    enum: [
      'Annual Leave',
      'Sick Leave',
      'Emergency Leave',
      'Maternity/Paternity Leave',
      'Study Leave',
      'Compassionate Leave',
      'Personal Leave'
    ]
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true,
    maxLength: 500
  },
  supportingDocuments: [{
    filename: String,
    originalName: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalComments: {
    type: String,
    maxLength: 300
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  totalDays: {
    type: Number
  }
}, {
  timestamps: true
});

// Calculate total days before saving
leaveSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Add 1 to include both start and end dates
  }
  next();
});

module.exports = mongoose.model('Leave', leaveSchema);