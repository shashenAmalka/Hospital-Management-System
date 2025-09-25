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
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
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
    const lastItem = await mongoose.model('PharmacyItem').findOne({
      itemId: { $regex: `^${prefix}` }
    }).sort({ itemId: -1 });
    
    let nextNumber = 1001; // Starting number
    if (lastItem && lastItem.itemId) {
      // Extract number from itemId (e.g., "MED1029" -> 1029)
      const lastNumber = parseInt(lastItem.itemId.replace(prefix, ''));
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    
    this.itemId = `${prefix}${String(nextNumber).padStart(4, '0')}`;
    
    // Safety check: If itemId still exists, add timestamp to make it unique
    let attempts = 0;
    while (attempts < 10) {
      const existingItem = await mongoose.model('PharmacyItem').findOne({ itemId: this.itemId });
      if (!existingItem) break;
      
      // If still duplicate, add timestamp suffix
      const timestamp = Date.now().toString().slice(-3);
      this.itemId = `${prefix}${String(nextNumber + attempts).padStart(4, '0')}`;
      attempts++;
    }
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
