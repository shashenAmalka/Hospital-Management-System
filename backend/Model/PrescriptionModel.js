const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: [true, 'Doctor is required']
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  medicines: [{
    name: {
      type: String,
      required: [true, 'Medicine name is required']
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required']
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required']
    },
    duration: {
      type: String,
      required: [true, 'Duration is required']
    },
    instructions: {
      type: String,
      default: ''
    }
  }],
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required']
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'sent-to-pharmacy', 'in-progress', 'dispensed', 'completed', 'cancelled'],
    default: 'pending'
  },
  dispensedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  dispensedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
prescriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Populate related fields when querying
prescriptionSchema.pre(/^find/, function(next) {
  this.populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization department')
      .populate('dispensedBy', 'firstName lastName')
      .populate('appointment');
  next();
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
