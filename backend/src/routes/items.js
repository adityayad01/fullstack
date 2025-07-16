const express = require('express');
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/items');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router
  .route('/')
  .get(getItems)
  .post(protect, upload.array('images', 5), createItem);

// Add the user route BEFORE the :id route to prevent it from being caught as an ID parameter
router.get('/user', protect, async (req, res, next) => {
  try {
    const items = await require('../models/Item').find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
});

router
  .route('/:id')
  .get(getItem)
  .put(protect, upload.array('images', 5), updateItem)
  .delete(protect, deleteItem);

module.exports = router;