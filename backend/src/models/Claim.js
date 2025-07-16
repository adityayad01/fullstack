const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Please provide the item ID']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide the user ID']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  contactPreference: {
    type: String,
    enum: ['email', 'phone', 'in-person'],
    required: [true, 'Please provide a contact preference']
  },
  contactDetails: {
    type: String,
    required: [true, 'Please provide contact details']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Claim', ClaimSchema);