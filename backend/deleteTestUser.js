// Delete test user with email dfg@gmail.com
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const User = require('./Model/UserModel');

const deleteTestUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Delete the user
        const result = await User.deleteOne({ email: 'dfg@gmail.com' });
        
        if (result.deletedCount > 0) {
            console.log('✅ Successfully deleted user: dfg@gmail.com');
        } else {
            console.log('❌ User not found: dfg@gmail.com');
        }

        // Close connection
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

deleteTestUser();
