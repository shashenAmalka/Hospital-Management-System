const mongoose = require('mongoose');
const Supplier = require('./Model/SupplierModel');
const PharmacyItem = require('./Model/PharmacyItemModel');
require('dotenv').config({ path: '../.env' });

async function clearPharmacyData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️ Clearing pharmacy data...');
    await PharmacyItem.deleteMany({});
    await Supplier.deleteMany({});
    
    console.log('✅ All pharmacy suppliers and items cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

clearPharmacyData();