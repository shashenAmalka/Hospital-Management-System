const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  staffName: {
    type: String,
    required: true
  },
  certificationName: {
    type: String,
    required: true,
    trim: true
  },
  certificationType: {
    type: String,
    required: true,
    enum: [
      'medical-certificate',
      'nursing-license',
      'technical-license',
      'professional-license',
      'specialty-certification'
    ]
  },
  issuingAuthority: {
    type: String,
    required: true,
    trim: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  documentUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['valid', 'expiring-soon', 'expired'],
    default: 'valid'
  },
  certificationNumber: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for calculating status based on expiry date
certificationSchema.virtual('calculatedStatus').get(function() {
  const today = new Date();
  const expiryDate = new Date(this.expiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) {
    return 'expired';
  } else if (daysUntilExpiry <= 60) { // Expiring within 60 days
    return 'expiring-soon';
  } else {
    return 'valid';
  }
});

// Update status before saving
certificationSchema.pre('save', function(next) {
  const today = new Date();
  const expiryDate = new Date(this.expiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) {
    this.status = 'expired';
  } else if (daysUntilExpiry <= 60) {
    this.status = 'expiring-soon';
  } else {
    this.status = 'valid';
  }
  
  next();
});

// Index for better query performance
certificationSchema.index({ staffId: 1, status: 1 });
certificationSchema.index({ expiryDate: 1 });
certificationSchema.index({ certificationType: 1 });

const Certification = mongoose.model('Certification', certificationSchema);

module.exports = Certification;