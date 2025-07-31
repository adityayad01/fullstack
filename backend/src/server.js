const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const path = require('path');
const createUploadDirs = require('./utils/createDirs');

// ✅ DO NOT set environment variables here — let Render handle them

// Connect to database
connectDB();

// Create upload directories
createUploadDirs();

// Route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const itemRoutes = require('./routes/items');
const claimRoutes = require('./routes/claims');
const notificationRoutes = require('./routes/notifications')

// Initialize express app
const app = express();

// Apply CORS middleware with specific options
app.use(cors({
  origin: 'https://fullstack-delta-mauve.vercel.app', // Use your Vercel frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parser
app.use(express.json());

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check & test routes
app.get('/api/server-status', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is working',
    time: new Date().toISOString()
  });
});

app.post('/api/direct-claim-test', (req, res) => {
  res.status(201).json({ 
    success: true, 
    message: 'Direct claim test route is working',
    receivedData: req.body,
    time: new Date().toISOString()
  });
});

app.get('/api/test-route', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Test route is working'
  });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/notifications', notificationRoutes)

// Error handler middleware
app.use(errorHandler);

// Set port from environment or default
const PORT = process.env.PORT || 5003;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
