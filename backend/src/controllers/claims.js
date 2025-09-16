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
    const uploaderId = item.user;

    if (uploaderId) {
      await Notification.create({
        user: uploaderId,
        title: 'New Claim Submitted',
        message: `Someone submitted a claim for your ${item.type} item: "${item.title}".`,
        type: 'claim',
        relatedItem: item._id,
        relatedClaim: claim._id,
        read: false,
        createdAt: new Date()
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
// @desc    Update claim status (admin only)
// @route   PUT /api/claims/:id/status
// @access  Private/Admin Only
exports.updateClaimStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const { id } = req.params;

    // 1. Find the claim and populate the associated item
const claim = await Claim.findById(id)
      .populate({
        path: 'item',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .populate('user', 'name email phone'); 

    if (!claim) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    // 2. Ensure only an admin can perform this action
    if (req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to change claim status' });
    }

    // 3. Update the claim status
    claim.status = status;
    if (status === 'rejected') {
      claim.rejectionReason = rejectionReason;
    }
    await claim.save();

    // 4. If the claim is approved, update the item's status and create notifications
    if (status === 'approved') {
      // Update the item status to 'claimed' or 'resolved' to prevent further claims
      if (claim.item) {
        claim.item.status = 'claimed'; // Or 'resolved', depending on your desired workflow
        await claim.item.save();

        // 5. Create a notification for the finder (item owner)
        await Notification.create({
          user: claim.item.user, // The user who uploaded the item
          title: 'Claim Approved for Your Found Item',
          message: `A claim for your item "${claim.item.title}" has been approved. The claimant's phone number is: ${claim.user.phone}. Please contact them to coordinate the return.`, 
          type: 'claim',
          relatedItem: claim.item._id,
          relatedClaim: claim._id,
          read: false,
          createdAt: new Date()
        });
        
        // 6. Create a notification for the claimant
        await Notification.create({
          user: claim.user, // The user who made the claim
          title: 'Your Claim Has Been Approved',
          message: `Your claim for "${claim.item.title}" has been approved! You can now arrange to get your item back. The item owner's contact number is: ${claim.item.user.phone}. <a href="http://localhost:3000/items/${claim.item._id}">View item details here.</a>`, // ⬅️ Changed to an HTML link
          type: 'claim',
          relatedItem: claim.item._id,
          relatedClaim: claim._id,
          read: false,
          createdAt: new Date()
        });
      }
    }

    res.status(200).json({
      success: true,
      data: claim,
    });
  } catch (err) {
    console.error('Error updating claim status:', err);
    next(err);
  }
};