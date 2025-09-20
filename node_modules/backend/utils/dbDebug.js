const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

// Get MongoDB URI from env or use default
const mongoUri = process.env.MONGO_URI || "mongodb+srv://shashenwebdevelopment:IfkVXb5QfNj0FRiQ@cluster0.wualzcm.mongodb.net/mydb";

console.log("Attempting MongoDB connection test with URI:", mongoUri);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB connection successful!");
  
  // List all collections
  mongoose.connection.db.listCollections().toArray((err, collections) => {
    if (err) {
      console.error("Error listing collections:", err);
      return;
    }
    
    console.log("Available collections:", collections.map(c => c.name));
    
    // Check if LabRequest model is registered
    const models = mongoose.modelNames();
    console.log("Registered models:", models);
    
    // Test saving a dummy lab request if model exists
    if (models.includes('LabRequest')) {
      const LabRequest = mongoose.model('LabRequest');
      const testRequest = new LabRequest({
        patientId: new mongoose.Types.ObjectId(),
        patientName: "Test Patient",
        testType: "Blood Test",
        priority: "normal",
        status: "pending",
        statusHistory: [{
          status: "pending",
          changedBy: new mongoose.Types.ObjectId(),
          timestamp: new Date(),
          notes: "Test request"
        }]
      });
      
      testRequest.save()
        .then(saved => {
          console.log("✅ Test lab request saved successfully:", saved._id);
          // Clean up test data
          LabRequest.deleteOne({ _id: saved._id })
            .then(() => {
              console.log("✅ Test lab request cleaned up");
              mongoose.connection.close();
            });
        })
        .catch(saveErr => {
          console.error("❌ Error saving test request:", saveErr);
          mongoose.connection.close();
        });
    } else {
      console.log("❌ LabRequest model not registered. Registering now...");
      
      // Create and register the model
      const labRequestSchema = new mongoose.Schema({
        patientId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true
        },
        patientName: {
          type: String,
          required: true
        },
        testType: String,
        priority: String,
        status: String,
        notes: String,
        statusHistory: Array
      }, { timestamps: true });
      
      const LabRequest = mongoose.model('LabRequest', labRequestSchema);
      console.log("✅ LabRequest model registered. Testing save...");
      
      const testRequest = new LabRequest({
        patientId: new mongoose.Types.ObjectId(),
        patientName: "Test Patient",
        testType: "Blood Test",
        priority: "normal",
        status: "pending"
      });
      
      testRequest.save()
        .then(saved => {
          console.log("✅ Test lab request saved successfully after registering model:", saved._id);
          mongoose.connection.close();
        })
        .catch(saveErr => {
          console.error("❌ Error saving test request after registering model:", saveErr);
          mongoose.connection.close();
        });
    }
  });
})
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});
