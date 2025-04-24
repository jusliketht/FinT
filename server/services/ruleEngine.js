const Rule = require('../models/Rule');

/**
 * Apply categorization rules to transactions
 * @param {Array} transactions - Array of transaction objects
 * @param {string} userId - User ID for fetching user-specific rules
 * @returns {Promise<Array>} Array of categorized transactions
 */
const categorizeTransactions = async (transactions, userId = null) => {
  try {
    // Get rules from database
    const query = userId ? { createdBy: userId } : {};
    const rules = await Rule.find(query).sort({ createdAt: -1 });
    
    // Apply rules to each transaction
    const categorizedTransactions = transactions.map(transaction => {
      // Start with 'Uncategorized' as default
      let category = 'Uncategorized';
      
      // Convert description to lowercase for case-insensitive matching
      const description = transaction.description ? transaction.description.toLowerCase() : '';
      
      // Find the first matching rule
      for (const rule of rules) {
        try {
          const pattern = new RegExp(rule.pattern, 'i');
          if (pattern.test(description)) {
            category = rule.category;
            break; // Stop after first match
          }
        } catch (error) {
          console.error(`Invalid regex pattern in rule: ${rule.pattern}`, error);
          // Continue to next rule if regex is invalid
        }
      }
      
      // If no rule matched, apply default categorization based on keywords
      if (category === 'Uncategorized') {
        category = applyDefaultCategorization(description, transaction.amount);
      }
      
      // Return transaction with category
      return {
        ...transaction,
        category
      };
    });
    
    return categorizedTransactions;
  } catch (error) {
    console.error('Error categorizing transactions:', error);
    // Return original transactions without categories on error
    return transactions.map(t => ({ ...t, category: 'Uncategorized' }));
  }
};

/**
 * Apply default categorization based on common keywords
 * @param {string} description - Transaction description (lowercase)
 * @param {number} amount - Transaction amount
 * @returns {string} Category name
 */
const applyDefaultCategorization = (description, amount) => {
  // Common category keywords for Indian context
  const categories = [
    { name: 'Food & Dining', keywords: ['zomato', 'swiggy', 'restaurant', 'food', 'cafe', 'hotel', 'dining'] },
    { name: 'Shopping', keywords: ['amazon', 'flipkart', 'myntra', 'shopping', 'retail', 'store', 'mall'] },
    { name: 'Transportation', keywords: ['uber', 'ola', 'cab', 'taxi', 'auto', 'petrol', 'fuel', 'metro', 'train', 'railway'] },
    { name: 'Utilities', keywords: ['electricity', 'water', 'gas', 'utility', 'bill', 'broadband', 'internet', 'wifi'] },
    { name: 'Entertainment', keywords: ['movie', 'cinema', 'theatre', 'netflix', 'amazon prime', 'hotstar', 'subscription'] },
    { name: 'Healthcare', keywords: ['hospital', 'clinic', 'doctor', 'medical', 'pharmacy', 'medicine', 'healthcare'] },
    { name: 'Education', keywords: ['school', 'college', 'university', 'education', 'tuition', 'course', 'class'] },
    { name: 'Rent', keywords: ['rent', 'lease', 'housing'] },
    { name: 'Salary', keywords: ['salary', 'payroll', 'income', 'stipend'] },
    { name: 'Investment', keywords: ['investment', 'mutual fund', 'stock', 'equity', 'shares', 'dividend'] },
    { name: 'Insurance', keywords: ['insurance', 'premium', 'policy'] },
    { name: 'Tax', keywords: ['tax', 'gst', 'cgst', 'sgst', 'igst', 'income tax', 'tds'] },
    { name: 'Travel', keywords: ['travel', 'flight', 'hotel', 'booking', 'holiday', 'vacation', 'tour'] },
    { name: 'ATM Withdrawal', keywords: ['atm', 'withdrawal', 'cash withdrawal'] },
    { name: 'Bank Charges', keywords: ['fee', 'charge', 'interest', 'service charge', 'maintenance'] }
  ];
  
  // Check for keyword matches
  for (const category of categories) {
    for (const keyword of category.keywords) {
      if (description.includes(keyword.toLowerCase())) {
        return category.name;
      }
    }
  }
  
  // If no matches found, classify by transaction amount
  if (amount >= 10000) {
    return 'Large Transaction';
  } else if (amount >= 5000) {
    return 'Medium Transaction';
  } else {
    return 'Small Transaction';
  }
};

/**
 * Create a new categorization rule
 * @param {Object} ruleData - Rule data (pattern, category)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created rule
 */
const createRule = async (ruleData, userId) => {
  try {
    // Validate the regex pattern
    try {
      new RegExp(ruleData.pattern);
    } catch (error) {
      throw new Error('Invalid regex pattern');
    }
    
    // Create rule
    const rule = await Rule.create({
      pattern: ruleData.pattern,
      category: ruleData.category,
      createdBy: userId,
      organization: ruleData.organization
    });
    
    return rule;
  } catch (error) {
    console.error('Error creating rule:', error);
    throw error;
  }
};

/**
 * Get all rules for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of rules
 */
const getRules = async (userId) => {
  try {
    return await Rule.find({ createdBy: userId }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error getting rules:', error);
    throw error;
  }
};

/**
 * Delete a rule
 * @param {string} ruleId - Rule ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success indicator
 */
const deleteRule = async (ruleId, userId) => {
  try {
    const result = await Rule.deleteOne({ _id: ruleId, createdBy: userId });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error deleting rule:', error);
    throw error;
  }
};

module.exports = {
  categorizeTransactions,
  createRule,
  getRules,
  deleteRule
}; 