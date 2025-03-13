const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide a transaction date'],
    default: Date.now
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [100, 'Description cannot be more than 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: [
      'Housing',
      'Transportation',
      'Food',
      'Utilities',
      'Healthcare',
      'Insurance',
      'Debt',
      'Entertainment',
      'Clothing',
      'Education',
      'Savings',
      'Investments',
      'Income',
      'Other'
    ]
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually'],
    default: 'none'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for better query performance
TransactionSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema); 