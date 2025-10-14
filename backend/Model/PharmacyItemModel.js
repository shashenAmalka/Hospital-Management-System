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
    
    // Find the highest existing itemId for this category
    const PharmacyItem = mongoose.model('PharmacyItem');
    const lastItem = await PharmacyItem.findOne({
      itemId: new RegExp(`^${prefix}`, 'i')
    })
    .sort({ itemId: -1 })
    .select('itemId')
    .lean();
    
    let nextNumber = 1001;
    if (lastItem && lastItem.itemId) {
      // Extract the number from the last itemId (e.g., "SUP1038" -> 1038)
      const match = lastItem.itemId.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0]) + 1;
      }
    }
    
    // Generate unique itemId with retry logic
    let attempts = 0;
    let itemId = '';
    while (attempts < 10) {
      itemId = `${prefix}${String(nextNumber + attempts).padStart(4, '0')}`;
      const exists = await PharmacyItem.findOne({ itemId });
      if (!exists) {
        break;
      }
      attempts++;
    }
    
    this.itemId = itemId;
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
