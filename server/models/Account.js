const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'],
    required: true
  },
  code: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  parentAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Make the combination of code and organization unique
AccountSchema.index({ code: 1, organization: 1 }, { unique: true });

module.exports = mongoose.model('Account', AccountSchema); 