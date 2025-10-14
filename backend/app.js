const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); // Ensure dotenv is loaded at the top
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socketServer = require('./utils/socketServer');
const userRoutes = require('./Route/UserRoutes');
const authRoutes = require('./Route/AuthRoutes');
const staffRoutes = require('./Route/StaffRoutes');
const roleRoutes = require('./Route/RoleRoutes');
const departmentRoutes = require('./Route/DepartmentRoutes');
const leaveRoutes = require('./Route/LeaveRoutes');
const certificationRoutes = require('./Route/CertificationRoutes');
const shiftScheduleRoutes = require('./Route/ShiftScheduleRoutes');
const labRequestRoutes = require('./Route/LabRequestRoutes');
const labReportRoutes = require('./Route/LabReportRoutes');
const patientRoutes = require('./Route/PatientRoutes');
const pharmacyRoutes = require('./Route/pharmacyRoutes');
const supplierRoutes = require('./Route/SupplierRoutes');
const appointmentRoutes = require('./Route/AppointmentRoutes');
const notificationRoutes = require('./Route/NotificationRoutes');
const prescriptionRoutes = require('./Route/PrescriptionRoutes');

// Enhanced CORS configuration for development and production
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://localhost:8080',
    'http://127.0.0.1:8080'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions)); // Enhanced CORS middleware
app.use(express.json()); // Middleware to parse JSON

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    version: require('./package.json').version || '1.0.0'
  };
  
  console.log('🏥 Health check requested:', healthStatus);
  res.status(200).json(healthStatus);
});

// API connectivity test endpoint
app.get('/api/test', (req, res) => {
  console.log('🧪 API test endpoint called');
  res.status(200).json({
    message: 'API is working correctly',
    timestamp: new Date().toISOString(),
    endpoints: {
      medication: '/api/medication/items',
      dispense: '/api/medication/items/:id/dispense'
    }
  });
});

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
app.use("/api/lab-reports", labReportRoutes); // Add lab report routes
app.use("/api/patients", patientRoutes); // Add patient routes
app.use("/api/medication", pharmacyRoutes); // Add pharmacy/medication routes
app.use("/api/suppliers", supplierRoutes); // Add supplier routes
app.use("/api/appointments", appointmentRoutes); // Add appointment routes
app.use("/api/notifications", notificationRoutes); // Add notification routes
app.use("/api/prescriptions", prescriptionRoutes); // Add prescription routes

// Global error handling middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Development error response
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } 
  // Production error response
  else {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } 
    // Programming or other unknown error: don't leak error details
    else {
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      });
    }
  }
});

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
    server.listen(5000, () => {
        console.log("✅ Server running on port 5000");
        console.log("🌐 Frontend can now connect to the API");
        console.log("📋 Role and Department endpoints are available");
        
        // Initialize socket.io server
        const io = socketServer.initSocketServer(server);
        console.log("🔌 Socket.io server initialized");
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

// Add process event handlers to prevent crashes
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    console.error('Stack:', err.stack);
    // Don't exit the process for uncaught exceptions in development
    console.log('🔄 Server continuing to run...');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
    // Don't exit the process for unhandled rejections in development
    console.log('🔄 Server continuing to run...');
});

process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🔄 SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

console.log('🔥 Server startup complete - process handlers installed');
