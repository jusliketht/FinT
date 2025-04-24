const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  bank: {
    type: String,
    required: true
  },
  transactionType: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  sourceFile: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema); 