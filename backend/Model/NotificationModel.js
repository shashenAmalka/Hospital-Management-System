const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Test', 'Patient', 'Appointment', 'LabInventory', 'Equipment', 'Prescription']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
