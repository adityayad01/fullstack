const Item = require('../models/Item');
const Notification = require('../models/Notification');
const path = require('path');
const fs = require('fs');

// @desc    Get all items
// @route   GET /api/items
// @access  Public
exports.getItems = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search', 'radius', 'lat', 'lng'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Item.find(JSON.parse(queryStr)).populate('user', 'name email');

    // Search functionality
    if (req.query.search) {
      query = query.find({ $text: { $search: req.query.search } });
    }

    // Location search
    if (req.query.lat && req.query.lng && req.query.radius) {
      const lat = parseFloat(req.query.lat);
      const lng = parseFloat(req.query.lng);
      const radius = parseFloat(req.query.radius) / 6378; // Convert radius from km to radians

      query = query.find({
        location: {
          $geoWithin: { $centerSphere: [[lng, lat], radius] }
        }
      });
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Item.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const items = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: items.length,
      pagination,
      data: items
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
exports.getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('user', 'name email phone');

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new item
// @route   POST /api/items
// @access  Private
exports.createItem = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => file.filename);
    }

    const item = await Item.create(req.body);

    // Check for potential matches
    await findMatches(item);

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
exports.updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    // Make sure user is item owner or admin
    if (item.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this item'
      });
    }

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      // Delete old images
      if (item.images && item.images.length > 0) {
        item.images.forEach(image => {
          const imagePath = path.join(__dirname, '../../uploads', image);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        });
      }
      req.body.images = req.files.map(file => file.filename);
    }

    item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    // Make sure user owns the item
    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this item'
      });
    }

    // Use findByIdAndDelete instead of remove()
    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// @desc    Get items for logged in user
// @route   GET /api/items/user
// @access  Private
exports.getUserItems = async (req, res, next) => {
  try {
    const items = await Item.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to find potential matches
const findMatches = async (newItem) => {
  try {
    // Find potential matches based on category and location
    const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';
    
    const potentialMatches = await Item.find({
      type: oppositeType,
      category: newItem.category,
      status: 'open',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: newItem.location.coordinates
          },
          $maxDistance: 5000 // 5km radius
        }
      }
    }).populate('user');

    // Create notifications for potential matches
    for (const match of potentialMatches) {
      // Create notification for the owner of the new item
      await Notification.create({
        user: newItem.user,
        title: `Potential ${oppositeType} item match`,
        message: `We found a potential match for your ${newItem.type} item "${newItem.title}"`,
        type: 'match',
        relatedItem: match._id
      });

      // Create notification for the owner of the matched item
      await Notification.create({
        user: match.user._id,
        title: `Potential ${newItem.type} item match`,
        message: `We found a potential match for your ${match.type} item "${match.title}"`,
        type: 'match',
        relatedItem: newItem._id
      });
    }
  } catch (error) {
    console.error('Error finding matches:', error);
  }
};