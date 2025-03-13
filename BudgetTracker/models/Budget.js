const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide a budget amount'],
    min: [0, 'Budget amount must be positive']
  },
  period: {
    type: String,
    enum: ['monthly', 'weekly', 'yearly', 'custom'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    default: function() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
    }
  },
  endDate: {
    type: Date,
    default: function() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: [300, 'Notes cannot be more than 300 characters']
  }
});

// Create compound index for uniqueness per user and category
BudgetSchema.index({ user: 1, category: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema); 