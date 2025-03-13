const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide an account name'],
    trim: true
  },
  type: {
    type: String,
    enum: ['checking', 'savings', 'credit', 'investment', 'loan', 'other'],
    required: [true, 'Please specify account type']
  },
  institution: {
    type: String,
    required: [true, 'Please provide institution name'],
    trim: true
  },
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  // External identifiers for bank API integration
  externalId: {
    type: String
  },
  accessToken: {
    type: String,
    select: false // Don't return in queries for security
  },
  // For manual accounts (not connected via API)
  isManual: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for better query performance
AccountSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('Account', AccountSchema); 