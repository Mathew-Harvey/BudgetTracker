const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a goal name'],
    trim: true,
    maxlength: [50, 'Goal name cannot be more than 50 characters']
  },
  icon: {
    type: String,
    default: 'fa-home'
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please provide a target amount'],
    min: [0, 'Target amount must be positive']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount must be positive']
  },
  targetDate: {
    type: Date,
    required: [true, 'Please provide a target date']
  },
  description: {
    type: String,
    maxlength: [300, 'Description cannot be more than 300 characters']
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  category: {
    type: String,
    enum: [
      'home',
      'car',
      'education',
      'vacation',
      'retirement',
      'emergency',
      'other'
    ],
    default: 'other'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Goal', GoalSchema); 