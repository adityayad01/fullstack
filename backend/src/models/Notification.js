const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['match', 'claim', 'system'],
    required: true
  },
  relatedItem: {
    type: mongoose.Schema.ObjectId,
    ref: 'Item'
  },
  relatedClaim: {
    type: mongoose.Schema.ObjectId,
    ref: 'Claim'
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);