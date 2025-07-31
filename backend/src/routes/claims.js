const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createClaim,
  getClaims,
  getClaim,
  updateClaim,
  deleteClaim
} = require('../controllers/claims');

// Test route (no auth)
router.get('/ping', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Claims ping route is working',
    time: new Date().toISOString()
  });
});

// Private routes
router.post('/', protect, createClaim);
router.get('/', protect, getClaims);
router.get('/:id', protect, getClaim);
router.put('/:id', protect, updateClaim);
router.delete('/:id', protect, deleteClaim);

module.exports = router;
