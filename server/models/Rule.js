const mongoose = require('mongoose');

const RuleSchema = new mongoose.Schema({
  pattern: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
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

// Index for better query performance
RuleSchema.index({ pattern: 1, organization: 1 });

module.exports = mongoose.model('Rule', RuleSchema); 