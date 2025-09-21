const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Define mongoUri before using it
const mongoUri = process.env.MONGO_URI || "mongodb+srv://shashenwebdevelopment:IfkVXb5QfNj0FRiQ@cluster0.wualzcm.mongodb.net/mydb";
console.log("Testing MongoDB URI:", mongoUri);

// Create a model for testing
require('./Model/LabRequestModel');
const LabRequest = mongoose.model('LabRequest');

// Connect to MongoDB
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log("✅ Connected to MongoDB successfully!");
  
  // List all collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("Available collections:", collections.map(c => c.name));
  
  // Test saving a document
  try {
    const testRequest = new LabRequest({
      patientId: new mongoose.Types.ObjectId(),
      patientName: "Test Patient",
      testType: "Blood Test",
      priority: "normal",
      status: "pending",
      notes: "Test created by testMongo.js",
      statusHistory: [{
        status: "pending",
        changedBy: new mongoose.Types.ObjectId(),
        timestamp: new Date(),
        notes: "Test request"
      }]
    });
    
    const savedRequest = await testRequest.save();
    console.log("✅ Test document saved successfully:", savedRequest._id);
    
    // Count documents to verify
    const count = await LabRequest.countDocuments();
    console.log(`Total LabRequest documents: ${count}`);
    
    // Clean up the test document
    await LabRequest.deleteOne({ _id: savedRequest._id });
    console.log("✅ Test document deleted successfully");
    
  } catch (error) {
    console.error("❌ Error in test:", error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("Connection closed");
    process.exit(0);
  }
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});
