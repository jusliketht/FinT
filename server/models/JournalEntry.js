const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  debitAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  creditAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
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
  voucherNo: {
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

module.exports = mongoose.model('JournalEntry', JournalEntrySchema); 