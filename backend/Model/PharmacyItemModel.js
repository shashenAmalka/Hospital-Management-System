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
    enum: ['Medicine', 'Supply', 'Equipment', 'Lab Supplies'],
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
    enum: ['in stock', 'low stock', 'out of stock'],
    default: 'in stock'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Pre-save middleware to generate itemId if not provided
pharmacyItemSchema.pre('save', async function(next) {
  if (!this.itemId) {
    let prefix = '';
    switch (this.category) {
      case 'Medicine':
        prefix = 'MED';
        break;
      case 'Supply':
        prefix = 'SUP';
        break;
      case 'Equipment':
        prefix = 'EQP';
        break;
      case 'Lab Supplies':
        prefix = 'LAB';
        break;
      default:
        prefix = 'GEN';
    }
    const count = await mongoose.model('PharmacyItem').countDocuments({
      category: this.category
    });
    this.itemId = `${prefix}${String(count + 1001).padStart(4, '0')}`;
  }
  
  // Set status based on quantity
  if (this.quantity === 0) {
    this.status = 'out of stock';
  } else if (this.quantity < this.minRequired) {
    this.status = 'low stock';
  } else {
    this.status = 'in stock';
  }
  
  next();
});

module.exports = mongoose.model('PharmacyItem', pharmacyItemSchema);
module.exports = mongoose.model('PharmacyItem', pharmacyItemSchema);
