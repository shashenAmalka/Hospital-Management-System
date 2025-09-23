const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); // Ensure dotenv is loaded at the top
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const userRoutes = require('./Route/UserRoutes');
const authRoutes = require('./Route/AuthRoutes');
const staffRoutes = require('./Route/StaffRoutes');
const roleRoutes = require('./Route/RoleRoutes');
const departmentRoutes = require('./Route/DepartmentRoutes');
const leaveRoutes = require('./Route/LeaveRoutes');
const certificationRoutes = require('./Route/CertificationRoutes');
const shiftScheduleRoutes = require('./Route/ShiftScheduleRoutes');
const labRequestRoutes = require('./Route/LabRequestRoutes');
const patientRoutes = require('./Route/PatientRoutes');
const pharmacyRoutes = require('./Route/pharmacyRoutes');
const supplierRoutes = require('./Route/SupplierRoutes');
const appointmentRoutes = require('./Route/AppointmentRoutes');

app.use(cors()); // Add CORS middleware
app.use(express.json()); // Middleware to parse JSON

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/users", userRoutes); // Update to use /api/users for consistency
app.use("/api/auth", authRoutes); // Update to use /api/auth for consistency
app.use("/api/staff", staffRoutes); // Add staff routes
app.use("/api/roles", roleRoutes); // Add role routes
app.use("/api/departments", departmentRoutes); // Add department routes
app.use("/api/leave", leaveRoutes); // Add leave routes
app.use("/api/certifications", certificationRoutes); // Add certification routes
app.use("/api/shift-schedules", shiftScheduleRoutes); // Add shift schedule routes
app.use("/api/lab-requests", labRequestRoutes); // Add lab request routes
app.use("/api/patients", patientRoutes); // Add patient routes
app.use("/api/medication", pharmacyRoutes); // Add pharmacy/medication routes
app.use("/api/suppliers", supplierRoutes); // Add supplier routes
app.use("/api/appointments", appointmentRoutes); // Add appointment routes

// Debugging: Log all environment variables
console.log("Environment Variables:", process.env);
console.log("MONGO_URI from .env:", process.env.MONGO_URI);

// Debug JWT_SECRET
console.log('JWT_SECRET:', process.env.JWT_SECRET);

const mongoUri = process.env.MONGO_URI || "mongodb+srv://nadeera11:9KhpfPfStDvzr0Qk@cluster0.dyzuhhs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const localMongoUri = "mongodb://localhost:27017/helamedmy";
console.log("Primary MongoDB URI:", mongoUri);

// Add debug logging for JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

// Function to start server
const startServer = () => {
    const server = app.listen(5000, () => {
        console.log("✅ Server running on port 5000");
        console.log("🌐 Frontend can now connect to the API");
        console.log("📋 Role and Department endpoints are available");
    });
    
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error('❌ Port 5000 is already in use');
            console.log('🔄 Trying port 5001...');
            
            const fallbackServer = app.listen(5001, () => {
                console.log("✅ Server running on port 5001");
                console.log("🌐 Frontend can now connect to the API on port 5001");
                console.log("📋 Role and Department endpoints are available");
            });
            
            fallbackServer.on('error', (fallbackError) => {
                console.error('❌ Server startup failed:', fallbackError.message);
            });
        } else {
            console.error('❌ Server startup failed:', error.message);
        }
    });
};

// Try to connect to MongoDB Atlas first, then fallback to local
console.log("🔗 Attempting to connect to MongoDB Atlas...");
mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
.then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    startServer();
})
.catch((atlasErr) => {
    console.log("❌ Atlas connection failed:", atlasErr.message);
    console.log("🔄 Trying local MongoDB connection...");
    
    // Try local MongoDB
    mongoose.connect(localMongoUri)
    .then(() => {
        console.log("✅ Connected to local MongoDB");
        console.log("💡 Using local database for development");
        startServer();
    })
    .catch((localErr) => {
        console.log("❌ Local MongoDB connection failed:", localErr.message);
        console.log("🚀 Starting server without database connection...");
        console.log("📝 API will use fallback sample data");
        startServer();
    });
});