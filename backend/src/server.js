const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const path = require('path');
const createUploadDirs = require('./utils/createDirs');

// Set environment variables directly
process.env.NODE_ENV = 'development';
process.env.PORT = 5003;
process.env.MONGO_URI = 'mongodb://localhost:27017/lostandfound';
process.env.JWT_SECRET = 'your_jwt_secret_key';
process.env.JWT_EXPIRE = '30d';
process.env.JWT_COOKIE_EXPIRE = 30;

// Connect to database
connectDB();

// Create upload directories
createUploadDirs();

// Route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const itemRoutes = require('./routes/items');
const claimRoutes = require('./routes/claims');

// Initialize express app
const app = express();

// Apply CORS middleware with specific options
app.use(cors({
  origin: 'http://localhost:3000', // Allow only your frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount routers
// Add this after initializing the app but before mounting any routers
app.get('/api/server-status', (req, res) => {
  console.log('Server status route hit');
  const routes = {
    claims: '/api/claims',
    claimsTest: '/api/claims/test-post',
    claimsOpen: '/api/claims/open'
  };
  
  // Log all registered routes
  console.log('Registered routes:');
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(`${middleware.route.stack[0].method.toUpperCase()} ${middleware.route.path}`);
    }
  });

  res.status(200).json({ 
    success: true, 
    message: 'Server is working',
    routes: routes,
    time: new Date().toISOString()
  });
});

// Add this after initializing the app but before mounting any routers
app.post('/api/direct-claim-test', (req, res) => {
  console.log('Direct claim test route hit');
  console.log('Request body:', req.body);
  res.status(201).json({ 
    success: true, 
    message: 'Direct claim test route is working',
    receivedData: req.body,
    time: new Date().toISOString()
  });
});

// Before mounting the routes
console.log('claimRoutes exists:', !!claimRoutes);
if (claimRoutes) {
  console.log('claimRoutes stack:', claimRoutes.stack ? claimRoutes.stack.length : 'No stack');
  if (claimRoutes.stack) {
    claimRoutes.stack.forEach((layer, i) => {
      console.log(`Route ${i}:`, layer.route?.path || 'middleware');
    });
  }
}

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);

// Add a test route directly in server.js to verify routing is working
app.get('/api/test-route', (req, res) => {
  console.log('Test route hit');
  res.status(200).json({
    success: true,
    message: 'Test route is working'
  });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5003;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});