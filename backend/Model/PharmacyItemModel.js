const mongoose = require('mongoose');

const pharmacyItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Medicine', 'Supply'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  minRequired: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  expiryDate: {
    type: Date
  },
  manufacturer: {
    type: String
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['adequate', 'low', 'critical'],
    default: 'adequate'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Pre-save middleware to generate itemId if not provided
pharmacyItemSchema.pre('save', async function(next) {
  if (!this.itemId) {
    const prefix = this.category === 'Medicine' ? 'MED' : 'SUP';
    const count = await mongoose.model('PharmacyItem').countDocuments({
      category: this.category
    });
    this.itemId = `${prefix}${String(count + 1001).padStart(4, '0')}`;
  }
  
  // Set status based on quantity
  if (this.quantity <= this.minRequired * 0.25) {
    this.status = 'critical';
  } else if (this.quantity < this.minRequired) {
    this.status = 'low';
  } else {
    this.status = 'adequate';
  }
  
  next();
});

module.exports = mongoose.model('PharmacyItem', pharmacyItemSchema);
module.exports = mongoose.model('PharmacyItem', pharmacyItemSchema);
