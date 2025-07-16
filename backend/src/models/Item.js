const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Electronics',
      'Jewelry',
      'Clothing',
      'Accessories',
      'Documents',
      'Pets',
      'Other'
    ]
  },
  type: {
    type: String,
    required: [true, 'Please specify if this is a lost or found item'],
    enum: ['lost', 'found']
  },
  status: {
    type: String,
    enum: ['open', 'claimed', 'resolved', 'closed'],
    default: 'open'
  },
  date: {
    type: Date,
    required: [true, 'Please add the date when the item was lost/found']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  },
  images: [String],
  reward: {
    type: Number,
    default: 0
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  matchedWith: {
    type: mongoose.Schema.ObjectId,
    ref: 'Item'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for text search
ItemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Item', ItemSchema);