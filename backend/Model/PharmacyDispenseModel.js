const mongoose = require('mongoose');

const pharmacyDispenseSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PharmacyItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  reason: {
    type: String,
    trim: true
  },
  dispensedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  dispensedAt: {
    type: Date,
    default: Date.now
  },
  itemSnapshot: {
    itemId: String,
    name: String,
    category: String,
    unitPrice: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('PharmacyDispense', pharmacyDispenseSchema);
