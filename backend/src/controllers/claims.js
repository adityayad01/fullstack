const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');

exports.createClaim = async (req, res, next) => {
  try {
    console.log('POST /api/claims controller hit');
    console.log('Request body:', req.body);
    console.log('User ID from token:', req.user.id);

    const { itemId, description, contactPreference, contactDetails } = req.body;

    console.log('Looking for item with ID:', itemId);

    const item = await Item.findById(itemId);
    console.log('Item found:', !!item);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    const claim = await Claim.create({
      item: itemId,
      user: req.user.id,
      description,
      contactPreference,
      contactDetails,
      status: 'pending'
    });

    // Use the correct uploader ID from the item schema
    const uploaderId = Item.user;

    if (uploaderId) {
      await Notification.create({
        user: uploaderId,
        title: 'New Claim Submitted',
        message: `Someone submitted a claim for your ${Item.type} item: "${Item.title}".`,
        type: 'claim',
        relatedItem: Item._id,
        relatedClaim: Claim._id
      });

      console.log('✅ Notification sent to uploader:', uploaderId.toString());
    } else {
      console.warn('⚠️ Uploader ID is missing. Notification not created.');
    }

    res.status(201).json({
      success: true,
      data: claim
    });

  } catch (err) {
    console.error('❌ Error creating claim:', err);
    next(err);
  }
};


exports.getClaims = async (req, res, next) => {
  try {
    console.log('GET /api/claims controller hit');
    
    let query;
    
    // For regular users, only show their claims
    if (req.user.role !== 'admin') {
      query = Claim.find({ user: req.user.id });
    } else {
      // For admins, show all claims
      query = Claim.find();
    }
    
    // Execute query
    const claims = await query
      .populate('item')
      .populate('user', 'name email');
    
    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (err) {
    console.error('Error getting claims:', err);
    next(err);
  }
};

// @desc    Get single claim
// @route   GET /api/claims/:id
// @access  Private
exports.getClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('item')
      .populate('user', 'name email');
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found'
      });
    }
    
    // Make sure user is claim owner or admin
    if (claim.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this claim'
      });
    }
    
    res.status(200).json({
      success: true,
      data: claim
    });
  } catch (err) {
    console.error('Error getting claim:', err);
    next(err);
  }
};

// @desc    Update claim
// @route   PUT /api/claims/:id
// @access  Private
exports.updateClaim = async (req, res, next) => {
  try {
    let claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found'
      });
    }
    
    // Make sure user is claim owner or admin
    if (claim.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this claim'
      });
    }
    
    claim = await Claim.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: claim
    });
  } catch (err) {
    console.error('Error updating claim:', err);
    next(err);
  }
};

// @desc    Delete claim
// @route   DELETE /api/claims/:id
// @access  Private
exports.deleteClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found'
      });
    }

    if (claim.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this claim'
      });
    }

    // ✅ Use this to safely delete without relying on document methods
    await Claim.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting claim:', err);
    next(err);
  }
};
