const mongoose = require('mongoose');

const JournalEntryLineSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Account is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  debit: {
    type: Number,
    default: 0,
    min: [0, 'Debit amount cannot be negative']
  },
  credit: {
    type: Number,
    default: 0,
    min: [0, 'Credit amount cannot be negative']
  }
});

const JournalEntrySchema = new mongoose.Schema({
  entryNumber: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  lines: [JournalEntryLineSchema],
  reference: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'posted', 'void'],
    default: 'draft'
  },
  postingDate: {
    type: Date
  },
  attachments: [{
    filename: String,
    path: String,
    mimetype: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps
JournalEntrySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Validate debits equal credits before saving
JournalEntrySchema.pre('save', function(next) {
  const totalDebit = this.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = this.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  
  if (Math.abs(totalDebit - totalCredit) > 0.001) { // Using 0.001 to handle floating point precision
    next(new Error('Total debits must equal total credits'));
    return;
  }
  
  if (totalDebit === 0 && totalCredit === 0) {
    next(new Error('Entry must have at least one debit and one credit'));
    return;
  }

  next();
});

// Generate entry number before saving
JournalEntrySchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastEntry = await this.constructor.findOne({}, {}, { sort: { 'entryNumber': -1 } });
    const lastNumber = lastEntry ? parseInt(lastEntry.entryNumber.split('-')[1]) : 0;
    this.entryNumber = `JE-${(lastNumber + 1).toString().padStart(6, '0')}`;
  }
  next();
});

// Method to post the journal entry
JournalEntrySchema.methods.post = async function() {
  if (this.status === 'posted') {
    throw new Error('Entry is already posted');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update account balances
    for (const line of this.lines) {
      const account = await mongoose.model('Account').findById(line.account);
      if (!account) {
        throw new Error(`Account ${line.account} not found`);
      }
      
      if (line.debit > 0) {
        await account.updateBalance(line.debit, 'debit');
      }
      if (line.credit > 0) {
        await account.updateBalance(line.credit, 'credit');
      }
    }

    // Update entry status
    this.status = 'posted';
    this.postingDate = new Date();
    await this.save();

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Method to void the journal entry
JournalEntrySchema.methods.void = async function() {
  if (this.status !== 'posted') {
    throw new Error('Only posted entries can be voided');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Reverse account balances
    for (const line of this.lines) {
      const account = await mongoose.model('Account').findById(line.account);
      if (!account) {
        throw new Error(`Account ${line.account} not found`);
      }
      
      if (line.debit > 0) {
        await account.updateBalance(line.debit, 'credit'); // Reverse debit with credit
      }
      if (line.credit > 0) {
        await account.updateBalance(line.credit, 'debit'); // Reverse credit with debit
      }
    }

    this.status = 'void';
    await this.save();

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = mongoose.model('JournalEntry', JournalEntrySchema); 