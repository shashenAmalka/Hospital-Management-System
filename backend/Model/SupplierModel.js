const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierId: {
    type: String,
    unique: true
  },
  supplierName: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: 'Contact number must be 10 digits'
    }
  },
  email: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  address: {
    type: String,
    trim: true
  },
  itemsSupplied: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PharmacyItem'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Pre-save middleware to generate supplier ID
supplierSchema.pre('save', async function(next) {
  if (!this.supplierId) {
    try {
      // Find the highest existing supplier ID
      const lastSupplier = await this.constructor.findOne(
        { supplierId: { $regex: /^S\d{4}$/ } },
        {},
        { sort: { supplierId: -1 } }
      );
      
      let nextNumber = 1;
      if (lastSupplier && lastSupplier.supplierId) {
        const lastNumber = parseInt(lastSupplier.supplierId.substring(1));
        nextNumber = lastNumber + 1;
      }
      
      // Format with leading zeros (S0001, S0002, etc.)
      this.supplierId = `S${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Index for better performance
supplierSchema.index({ supplierName: 1 });
supplierSchema.index({ status: 1 });

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;