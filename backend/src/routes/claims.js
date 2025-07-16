const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Item = require('../models/Item');
const Claim = require('../models/Claim');

// Debug logging
console.log('Claims routes file loaded');

// Test route that doesn't require authentication
router.get('/ping', (req, res) => {
  console.log('Claims ping route hit');
  res.status(200).json({ 
    success: true, 
    message: 'Claims ping route is working',
    time: new Date().toISOString()
  });
});

// Main POST route for creating claims
router.post('/', protect, async (req, res, next) => {
  try {
    console.log('POST /api/claims route hit');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request body types:', {
      itemId: typeof req.body.itemId,
      description: typeof req.body.description,
      contactPreference: typeof req.body.contactPreference,
      contactDetails: typeof req.body.contactDetails
    });
    
    // Verify authentication
    console.log('Authenticated user:', req.user ? {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email
    } : 'No user');
    
    // Check if user has required role
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
    
    const { itemId, description, contactPreference, contactDetails } = req.body;
    
    // Validate required fields with detailed error messages
    const missingFields = [];
    if (!itemId) missingFields.push('itemId');
    if (!description) missingFields.push('description');
    if (!contactPreference) missingFields.push('contactPreference');
    if (!contactDetails) missingFields.push('contactDetails');
    
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields: missingFields
      });
    }
    
    // Validate contactPreference enum values
    const validContactPreferences = ['email', 'phone', 'in-person'];
    if (!validContactPreferences.includes(contactPreference)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid contact preference',
        validOptions: validContactPreferences
      });
    }
    
    // Check if item exists - convert itemId to string to ensure compatibility
    try {
      const itemIdStr = String(itemId);
      console.log('Looking for item with ID:', itemIdStr);
      
      const item = await Item.findById(itemIdStr);
      console.log('Item found:', item ? 'Yes' : 'No');
      
      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Item not found'
        });
      }
      
      // Create claim
      const claim = await Claim.create({
        item: itemIdStr,
        user: req.user.id,
        description: String(description),
        contactPreference: String(contactPreference),
        contactDetails: String(contactDetails),
        status: 'pending'
      });
      
      console.log('Claim created successfully:', claim._id);
      
      res.status(201).json({
        success: true,
        data: claim
      });
    } catch (err) {
      console.error('Error with MongoDB operations:', err);
      return res.status(400).json({
        success: false,
        error: 'Invalid item ID format or database error',
        details: err.message
      });
    }
  } catch (err) {
    console.error('Error creating claim:', err);
    next(err);
  }
});

// Make sure to export the router
module.exports = router;