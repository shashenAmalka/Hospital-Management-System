// Delete all patient users to start fresh with correct password hashing
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const User = require('./Model/UserModel');

const deleteAllPatients = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find all patient users
        const patients = await User.find({ role: 'patient' });
        console.log(`📊 Found ${patients.length} patient user(s):`);
        
        patients.forEach(patient => {
            console.log(`   - ${patient.name} (${patient.email})`);
        });

        // Delete all patient users
        const result = await User.deleteMany({ role: 'patient' });
        
        console.log('\n🗑️  Deletion complete:');
        console.log(`   ✅ Deleted ${result.deletedCount} patient user(s)`);
        console.log('\n💡 You can now register fresh users with correct password hashing!');

        // Close connection
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

deleteAllPatients();
