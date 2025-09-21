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

// Helper function to safely require models (resolve with or without .js)
const safeRequire = (modelPath) => {
  try {
    const withExt = modelPath.endsWith('.js') ? modelPath : `${modelPath}.js`;
    const resolvedPath = fs.existsSync(modelPath)
      ? modelPath
      : (fs.existsSync(withExt) ? withExt : null);
    if (resolvedPath) {
      require(resolvedPath);
      console.log(`Loaded model: ${path.basename(resolvedPath)}`);
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

// Helper function to safely load routes (resolve with or without .js)
const safeRequireRoute = (routePath, defaultRoutes = null) => {
  try {
    const withExt = routePath.endsWith('.js') ? routePath : `${routePath}.js`;
    const resolvedPath = fs.existsSync(routePath)
      ? routePath
      : (fs.existsSync(withExt) ? withExt : null);
    if (resolvedPath) {
      return require(resolvedPath);
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

// Explicitly require and verify auth routes
let authRoutes;
try {
  // First, check if the file exists
  if (!fs.existsSync('./Route/AuthRoutes.js')) {
    console.error('❌ AuthRoutes.js file not found! Creating a basic version...');
    
    // Create basic auth routes file if not found
    const basicAuthRoutes = `
const express = require('express');
const router = express.Router();
const AuthController = require('../Controller/AuthController');

// Auth routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

module.exports = router;
`;
    
    fs.writeFileSync('./Route/AuthRoutes.js', basicAuthRoutes);
    console.log('✅ Created basic AuthRoutes.js file');
  }
  
  // Now try to load the auth routes
  authRoutes = require('./Route/AuthRoutes');
  console.log('✅ AuthRoutes loaded successfully');
} catch (error) {
  console.error('❌ Error loading AuthRoutes:', error.message);
  throw new Error(`Failed to load auth routes: ${error.message}`);

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
const pharmacyRoutes = require('./Route/pharmacyRoutes');

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
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Apply error middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

module.exports = app; // Export for testing

// Register routes before MongoDB connection
console.log('Registering routes...');

// Auth routes - ensure they're registered at /auth
if (authRoutes) {
  console.log('📝 Registering auth routes at /auth path...');
  app.use("/auth", authRoutes);
  console.log('✅ Auth routes registered at /auth');
} else {
  console.error('❌ Failed to register auth routes - authRoutes is undefined');
}

// User routes
app.use("/users", userRoutes);

// Lab request routes - FIX: Register the lab request routes properly
console.log('Checking for LabRequestRoutes.js...');
if (fs.existsSync('./Route/LabRequestRoutes.js')) {
  console.log('LabRequestRoutes.js found, loading...');
  const labRequestRoutes = require('./Route/LabRequestRoutes');
  app.use('/api/lab-requests', labRequestRoutes);
  console.log('✅ Lab request routes registered at /api/lab-requests');
} else {
  console.warn('❌ LabRequestRoutes.js not found');
}

// Patient routes
if (fs.existsSync('./Route/PatientRoutes.js')) {
  const patientRoutes = require('./Route/PatientRoutes');
  app.use('/api/patients', patientRoutes);
  console.log('✅ Patient routes registered at /api/patients');
}

// Log all registered routes for debugging
console.log('🔍 Registered routes:');
setTimeout(() => {
  const registeredRoutes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const path = middleware.route.path;
      const methods = Object.keys(middleware.route.methods).map(m => m.toUpperCase());
      registeredRoutes.push({ path, methods });
    } else if (middleware.name === 'router') {
      const prefix = middleware.regexp.toString()
        .replace('\\^', '')
        .replace('\\/?(?=\\/|$)', '')
        .replace(/\\\//g, '/');
        
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const path = prefix + handler.route.path;
          const methods = Object.keys(handler.route.methods).map(m => m.toUpperCase());
          registeredRoutes.push({ path, methods });
        }
      });
    }
  });
  
  registeredRoutes.forEach(route => {
    console.log(`${route.methods.join(', ')} ${route.path}`);
  });
}, 1000);

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint for connectivity testing
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    server: 'HMS Backend'
  });
});

// Log all active routes for debugging
app.get('/api/routes', (req, res) => {
  // Extract and send all registered routes
  const routes = [];
  
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Routes registered directly on the app
      const path = middleware.route.path;
      const methods = Object.keys(middleware.route.methods)
        .filter(method => middleware.route.methods[method])
        .map(method => method.toUpperCase());
      
      routes.push({ path, methods });
    } else if (middleware.name === 'router') {
      // Routes added via router
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const path = handler.route.path;
          const basePath = middleware.regexp.toString()
            .replace('\\^', '')
            .replace('\\/?(?=\\/|$)', '')
            .replace(/\\\//g, '/');
            
          const fullPath = basePath.replace(/\\/g, '') + path;
          
          const methods = Object.keys(handler.route.methods)
            .filter(method => handler.route.methods[method])
            .map(method => method.toUpperCase());
          
          routes.push({ path: fullPath, methods });
        }
      });
    }
  });
  
  res.json({
    routes,
    count: routes.length,
    timestamp: new Date().toISOString()
  });
});

// Remove duplicate route registrations
// This section is duplicate and causing confusion
// console.log('Checking for LabRequestRoutes.js...');
// console.log('Checking for LabRequestRoutes.js...');
// if (fs.existsSync('./Route/LabRequestRoutes.js')) {
//   // ...remove duplicate code...
// }

// Add a catch-all route for debugging
app.all('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found', 
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'GET /auth/*',
      'POST /auth/register',
      'POST /auth/login'
    ]
  });
});

// Initialize the connection process
connectWithRetry();

