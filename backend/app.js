const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); // Ensure dotenv is loaded at the top
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const app = express();

// Import models dynamically (only if they exist)
console.log('Loading models directory:', path.join(__dirname, 'Model'));

// Helper function to safely require models
const safeRequire = (modelPath) => {
  try {
    if (fs.existsSync(modelPath)) {
      require(modelPath);
      console.log(`Loaded model: ${path.basename(modelPath)}`);
    } else {
      console.warn(`Model file does not exist: ${modelPath}`);
    }
  } catch (error) {
    console.error(`Error loading model ${modelPath}:`, error.message);
  }
};

// Load all models
safeRequire('./Model/UserModel');
safeRequire('./Model/PatientModel');
safeRequire('./Model/AppointmentModel');
safeRequire('./Model/LabRequestModel');

// Create LabRequestModel if it doesn't exist
if (!fs.existsSync('./Model/LabRequestModel.js')) {
  console.log('Creating LabRequestModel.js...');
  try {
    const labRequestModelContent = `
const mongoose = require('mongoose');

const labRequestSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  testType: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal'
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in_progress', 'completed'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  statusHistory: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, { timestamps: true });

// Check if a request can be edited (must be pending and within 1 hour of creation)
labRequestSchema.methods.canEdit = function() {
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
  return (
    this.status === 'pending' && 
    (Date.now() - this.createdAt.getTime() <= oneHour)
  );
};

module.exports = mongoose.model('LabRequest', labRequestSchema);
`;
    fs.writeFileSync('./Model/LabRequestModel.js', labRequestModelContent);
    require('./Model/LabRequestModel');
    console.log('Created and loaded LabRequestModel successfully');
  } catch (error) {
    console.error('Error creating LabRequestModel:', error.message);
  }
}

// Initialize Express middleware
app.use(cors());
app.use(express.json());

// Debug middleware for all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Fixed route handling section
// Import routes
const userRoutes = require('./Route/UserRoutes');
let appointmentRoutes, labRequestRoutesVar, authRoutes;

// Safely import routes
try {
  appointmentRoutes = fs.existsSync('./Route/AppointmentRoutes.js') ? 
    require('./Route/AppointmentRoutes') : null;
} catch (error) {
  console.error('Error loading AppointmentRoutes:', error.message);
}

try {
  labRequestRoutesVar = fs.existsSync('./Route/LabRequestRoutes.js') ? 
    require('./Route/LabRequestRoutes') : null;
} catch (error) {
  console.error('Error loading LabRequestRoutes:', error.message);
  // Create fallback lab request routes if file doesn't exist
  if (!fs.existsSync('./Route/LabRequestRoutes.js')) {
    console.log('Creating fallback LabRequestRoutes.js...');
    // Create directory if it doesn't exist
    if (!fs.existsSync('./Route')) {
      fs.mkdirSync('./Route', { recursive: true });
    }
    // Copy the LabRequestRoutes implementation here
    const routeContent = `
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');

// Patient routes
router.post('/create', verifyToken, (req, res) => {
  console.log('Creating lab request with data:', req.body);
  res.status(201).json({
    success: true,
    message: 'Lab request created successfully (mock)',
    data: {
      _id: 'mock-' + Date.now(),
      patientId: req.user?._id || 'patient-id',
      patientName: req.user?.firstName + ' ' + (req.user?.lastName || ''),
      ...req.body,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
});

router.get('/patient', verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    count: 0,
    data: []
  });
});

// More routes...

module.exports = router;
    `;
    fs.writeFileSync('./Route/LabRequestRoutes.js', routeContent);
    try {
      labRequestRoutesVar = require('./Route/LabRequestRoutes');
      console.log('Created and loaded fallback LabRequestRoutes');
    } catch (err) {
      console.error('Failed to load fallback LabRequestRoutes:', err.message);
    }
  }
}

try {
  authRoutes = fs.existsSync('./Route/AuthRoutes.js') ? 
    require('./Route/AuthRoutes') : null;
} catch (error) {
  console.error('Error loading AuthRoutes:', error.message);
}

// Debug JWT_SECRET
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***** (set)' : 'undefined');

// Define mongoUri before using it
const mongoUri = process.env.MONGO_URI || "mongodb+srv://shashenwebdevelopment:IfkVXb5QfNj0FRiQ@cluster0.wualzcm.mongodb.net/mydb";
console.log("Using MongoDB URI:", mongoUri);

// Add debug logging for JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not defined in environment variables, using fallback');
  process.env.JWT_SECRET = 'fallback-jwt-secret-for-development-only';
}

// Logging and error handling for MongoDB connection
console.log('Attempting to connect to MongoDB with URI:', mongoUri);

// Connect to MongoDB
let connectAttempts = 0;
const maxConnectAttempts = 3;

function connectWithRetry() {
  connectAttempts++;
  console.log(`MongoDB connection attempt ${connectAttempts}/${maxConnectAttempts}`);
  
  mongoose.connect(mongoUri)
    .then(() => {
      console.log("✅ Connected to MongoDB successfully!");
      // Start server after successful connection
      app.listen(5000, () => {
        console.log("Server running on port 5000");
      });
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      if (connectAttempts < maxConnectAttempts) {
        console.log(`Retrying in 5 seconds...`);
        setTimeout(connectWithRetry, 5000);
      } else {
        console.error("Maximum connection attempts reached.");
        // Start server anyway for development
        app.listen(5000, () => {
          console.log("⚠️ Server running WITHOUT MongoDB connection on port 5000");
        });
      }
    });
}

// Register routes before MongoDB connection
console.log('Registering routes...');

// User routes
app.use("/users", userRoutes);

// Auth routes
if (authRoutes) {
  console.log('Loading auth routes');
  app.use("/auth", authRoutes);
}

// Lab request routes
console.log('Checking for LabRequestRoutes.js...');
if (fs.existsSync('./Route/LabRequestRoutes.js')) {
  console.log('LabRequestRoutes.js found, loading...');
  const labRequestRoutes = require('./Route/LabRequestRoutes');
  app.use('/api/lab-requests', labRequestRoutes);
  console.log('Lab request routes registered at /api/lab-requests');
}

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Initialize connection
connectWithRetry();app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Explicitly register the LabRequestRoutes
console.log('Checking for LabRequestRoutes.js...');
console.log('Checking for LabRequestRoutes.js...');
if (fs.existsSync('./Route/LabRequestRoutes.js')) {
  console.log('LabRequestRoutes.js found, loading...');
  const labRequestRoutes2 = require('./Route/LabRequestRoutes');
  
  // Define API routes before the MongoDB connection
  app.use('/api/lab-requests', labRequestRoutes2);
  console.log('Lab request routes registered at /api/lab-requests');
  
  // Log all registered routes
  console.log('Registered routes:');
  app._router && app._router.stack
    .filter(r => r.route)
    .forEach(r => {
      Object.keys(r.route.methods).forEach(method => {
        console.log(`${method.toUpperCase()}: ${r.route.path}`);
      });
    });
} else {
  console.error('LabRequestRoutes.js not found!');
}
// Initialize the connection process
connectWithRetry();