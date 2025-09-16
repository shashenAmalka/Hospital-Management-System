const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const app = express();

// Initialize Express middleware
app.use(cors());
app.use(express.json());

// Debug middleware for all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Helper function to safely require models
const safeRequire = (modelPath) => {
  try {
    if (fs.existsSync(modelPath)) {
      require(modelPath);
      console.log(`Loaded model: ${path.basename(modelPath)}`);
      return true;
    } else {
      console.warn(`Model file does not exist: ${modelPath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error loading model ${modelPath}:`, error.message);
    return false;
  }
};

// Helper function to safely load routes
const safeRequireRoute = (routePath, defaultRoutes = null) => {
  try {
    if (fs.existsSync(routePath)) {
      return require(routePath);
    } else {
      console.warn(`Route file does not exist: ${routePath}`);
      return defaultRoutes;
    }
  } catch (error) {
    console.error(`Error loading route ${routePath}:`, error.message);
    return defaultRoutes;
  }
};

// Create default routes handler
const createDefaultRoutes = (entityName) => {
  const router = express.Router();
  
  router.get('/', (req, res) => {
    res.json({ message: `Default ${entityName} route - GET all` });
  });
  
  router.post('/', (req, res) => {
    res.status(201).json({ 
      message: `Default ${entityName} route - POST new`,
      data: { id: 'mock-id', ...req.body }
    });
  });
  
  router.get('/:id', (req, res) => {
    res.json({ 
      message: `Default ${entityName} route - GET by id`,
      id: req.params.id
    });
  });
  
  router.put('/:id', (req, res) => {
    res.json({ 
      message: `Default ${entityName} route - PUT update`,
      id: req.params.id,
      data: req.body
    });
  });
  
  router.delete('/:id', (req, res) => {
    res.json({ 
      message: `Default ${entityName} route - DELETE`,
      id: req.params.id
    });
  });
  
  return router;
};

// Load all models
console.log('Loading models directory:', path.join(__dirname, 'Model'));
safeRequire('./Model/UserModel');
safeRequire('./Model/PatientModel');
safeRequire('./Model/AppointmentModel');
safeRequire('./Model/LabRequestModel');
require('./Model/PharmacyItemModel'); // Add this line to ensure the model is registered

// Add debug logging for JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not defined in environment variables, using fallback');
  process.env.JWT_SECRET = 'fallback-jwt-secret-for-development-only';
}

// Define mongoUri before using it
const mongoUri = process.env.MONGO_URI || "mongodb+srv://shashenwebdevelopment:IfkVXb5QfNj0FRiQ@cluster0.wualzcm.mongodb.net/mydb";
console.log("Using MongoDB URI:", mongoUri);

// Safely load routes with fallbacks
const userRoutes = safeRequireRoute('./Route/UserRoutes', createDefaultRoutes('users'));
const patientRoutes = safeRequireRoute('./Route/PatientRoutes', createDefaultRoutes('patients'));
const appointmentRoutes = safeRequireRoute('./Route/AppointmentRoutes', createDefaultRoutes('appointments'));
const labRequestRoutes = safeRequireRoute('./Route/LabRequestRoutes', createDefaultRoutes('lab-requests'));
const authRoutes = safeRequireRoute('./Route/AuthRoutes', createDefaultRoutes('auth'));

// Import routes
const pharmacyRoutes = require('./Routes/pharmacyRoutes');

// Register routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/lab-requests', labRequestRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/pharmacy', pharmacyRoutes); // Add this line - using /pharmacy not /api/pharmacy

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Add a debug endpoint for pharmacy items
app.get('/api/pharmacy/debug', (req, res) => {
  res.json({ 
    message: 'Pharmacy API debug endpoint is working',
    time: new Date().toISOString(),
    endpoints: {
      getAllItems: '/api/pharmacy/items',
      getLowStockItems: '/api/pharmacy/items/low-stock',
      getItemById: '/api/pharmacy/items/:id',
      createItem: '/api/pharmacy/items (POST)',
      updateItem: '/api/pharmacy/items/:id (PUT)',
      deleteItem: '/api/pharmacy/items/:id (DELETE)'
    }
  });
});

// Connect to MongoDB
let connectAttempts = 0;
const maxConnectAttempts = 3;

function connectWithRetry() {
  connectAttempts++;
  console.log(`MongoDB connection attempt ${connectAttempts}/${maxConnectAttempts}`);
  
  mongoose.connect(mongoUri, {
    // Modern MongoDB driver doesn't need these options anymore
  })
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

// Initialize the connection process
connectWithRetry();

module.exports = app; // Export for testing
const { notFound, errorHandler } = require('./Middleware/errorMiddleware');

// Apply error middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

module.exports = app; // Export for testing