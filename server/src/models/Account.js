const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide an account name'],
    trim: true,
    maxlength: [100, 'Account name cannot be more than 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Please provide an account code'],
    unique: true,
    trim: true,
    maxlength: [20, 'Account code cannot be more than 20 characters']
  },
  type: {
    type: String,
    required: [true, 'Please provide an account type'],
    enum: {
      values: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'],
      message: 'Invalid account type'
    }
  },
  subtype: {
    type: String,
    trim: true,
    maxlength: [50, 'Subtype cannot be more than 50 characters']
  },
  parentAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  normalBalance: {
    type: String,
    enum: ['debit', 'credit'],
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  isSubledger: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  accountingPeriod: {
    fiscalYear: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear()
    },
    startDate: {
      type: Date,
      required: true,
      default: () => new Date(new Date().getFullYear(), 0, 1) // January 1st of current year
    },
    endDate: {
      type: Date,
      required: true,
      default: () => new Date(new Date().getFullYear(), 11, 31) // December 31st of current year
    }
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

// Update the updatedAt timestamp before saving
AccountSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Set normalBalance based on account type if not provided
AccountSchema.pre('save', function(next) {
  if (!this.normalBalance) {
    switch (this.type) {
      case 'Asset':
      case 'Expense':
        this.normalBalance = 'debit';
        break;
      case 'Liability':
      case 'Equity':
      case 'Revenue':
        this.normalBalance = 'credit';
        break;
    }
  }
  next();
});

// Virtual for full account path (for hierarchical display)
AccountSchema.virtual('fullPath').get(function() {
  return this.parentAccount ? `${this.parentAccount.fullPath} > ${this.name}` : this.name;
});

// Method to get current balance
AccountSchema.methods.getCurrentBalance = function() {
  return this.normalBalance === 'debit' ? this.balance : -this.balance;
};

// Method to update balance
AccountSchema.methods.updateBalance = async function(amount, type) {
  const multiplier = (type === 'debit') ? 1 : -1;
  this.balance += (amount * multiplier);
  await this.save();
};

// Static method to get trial balance
AccountSchema.statics.getTrialBalance = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$type',
        totalDebit: {
          $sum: {
            $cond: [
              { $eq: ['$normalBalance', 'debit'] },
              '$balance',
              0
            ]
          }
        },
        totalCredit: {
          $sum: {
            $cond: [
              { $eq: ['$normalBalance', 'credit'] },
              '$balance',
              0
            ]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Account', AccountSchema); 