const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: String,
    unique: true
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  phoneNumber: String,
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  },
  allergies: [String],
  medicalConditions: [String],
  medications: [String],
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    expiryDate: Date
  }
}, { timestamps: true });

// Generate a unique patient ID before saving
patientSchema.pre('save', async function(next) {
  if (!this.patientId) {
    const count = await mongoose.model('Patient').countDocuments();
    this.patientId = 'P' + String(count + 1001).padStart(6, '0');
  }
  next();
});

// Check if model already exists to prevent duplicate model errors
module.exports = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
