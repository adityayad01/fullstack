const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected for seeding'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Admin user data
const adminData = {
  name: 'Admin User',
  email: 'admin@lostandfound.com',
  password: 'admin123', // This will be hashed before saving
  role: 'admin',
  phone: '1234567890',
  location: {
    type: 'Point',
    coordinates: [0, 0],
    formattedAddress: 'Admin Office',
    city: 'Admin City',
    state: 'Admin State',
    zipcode: '12345',
    country: 'Admin Country'
  }
};

// Function to seed admin user
const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);
    
    // Create admin user
    const admin = await User.create(adminData);
    
    console.log('Admin user created successfully:', admin.email);
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
};

// Run the seed function
seedAdmin();