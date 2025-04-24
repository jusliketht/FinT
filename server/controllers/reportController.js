const JournalEntry = require('../models/JournalEntry');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const pdfGenerator = require('../services/pdfGenerator');
const { calculateGST } = require('../utils/gstCalculator');

// Helper to get account balances
const getAccountBalances = async (startDate, endDate, userId) => {
  try {
    const accounts = await Account.find({ createdBy: userId });
    const accountBalances = {};
    
    // Initialize all accounts with zero balance
    accounts.forEach(account => {
      accountBalances[account._id] = {
        name: account.name,
        type: account.type,
        code: account.code,
        balance: 0
      };
    });

    // Get all journal entries in date range
    const journalEntries = await JournalEntry.find({
      createdBy: userId,
      date: { $gte: startDate, $lte: endDate }
    });

    // Calculate balances
    journalEntries.forEach(entry => {
      // For debit entries
      if (accountBalances[entry.debitAccount]) {
        if (['Asset', 'Expense'].includes(accountBalances[entry.debitAccount].type)) {
          accountBalances[entry.debitAccount].balance += entry.amount;
        } else {
          accountBalances[entry.debitAccount].balance -= entry.amount;
        }
      }
      
      // For credit entries
      if (accountBalances[entry.creditAccount]) {
        if (['Liability', 'Equity', 'Revenue'].includes(accountBalances[entry.creditAccount].type)) {
          accountBalances[entry.creditAccount].balance += entry.amount;
        } else {
          accountBalances[entry.creditAccount].balance -= entry.amount;
        }
      }
    });

    return accountBalances;
  } catch (error) {
    console.error('Error getting account balances:', error);
    throw error;
  }
};

// @desc    Generate Balance Sheet
// @route   GET /api/reports/balance-sheet
// @access  Private
const generateBalanceSheet = async (req, res) => {
  try {
    const { asOfDate } = req.query;
    const date = asOfDate ? new Date(asOfDate) : new Date();
    
    // Get account balances
    const accountBalances = await getAccountBalances(new Date(0), date, req.user._id);
    
    // Organize accounts by type
    const balanceSheet = {
      assets: Object.values(accountBalances).filter(a => a.type === 'Asset'),
      liabilities: Object.values(accountBalances).filter(a => a.type === 'Liability'),
      equity: Object.values(accountBalances).filter(a => a.type === 'Equity')
    };
    
    // Calculate totals
    balanceSheet.totalAssets = balanceSheet.assets.reduce((sum, account) => sum + account.balance, 0);
    balanceSheet.totalLiabilities = balanceSheet.liabilities.reduce((sum, account) => sum + account.balance, 0);
    balanceSheet.totalEquity = balanceSheet.equity.reduce((sum, account) => sum + account.balance, 0);
    
    // Generate PDF
    const pdfBuffer = await pdfGenerator.generateBalanceSheetPDF(balanceSheet, date);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=balance-sheet-${date.toISOString().split('T')[0]}.pdf`);
    
    // Send PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating balance sheet:', error);
    res.status(500).json({ message: 'Error generating balance sheet', error: error.message });
  }
};

// @desc    Generate Profit & Loss Statement
// @route   GET /api/reports/profit-loss
// @access  Private
const generateProfitLoss = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get account balances for the period
    const accountBalances = await getAccountBalances(start, end, req.user._id);
    
    // Organize accounts by type
    const profitLoss = {
      revenue: Object.values(accountBalances).filter(a => a.type === 'Revenue'),
      expenses: Object.values(accountBalances).filter(a => a.type === 'Expense')
    };
    
    // Calculate totals
    profitLoss.totalRevenue = profitLoss.revenue.reduce((sum, account) => sum + account.balance, 0);
    profitLoss.totalExpenses = profitLoss.expenses.reduce((sum, account) => sum + account.balance, 0);
    profitLoss.netIncome = profitLoss.totalRevenue - profitLoss.totalExpenses;
    
    // Generate PDF
    const pdfBuffer = await pdfGenerator.generateProfitLossPDF(profitLoss, start, end);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=profit-loss-${start.toISOString().split('T')[0]}-to-${end.toISOString().split('T')[0]}.pdf`);
    
    // Send PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating profit & loss:', error);
    res.status(500).json({ message: 'Error generating profit & loss statement', error: error.message });
  }
};

// @desc    Generate Cash Flow Statement
// @route   GET /api/reports/cash-flow
// @access  Private
const generateCashFlow = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get transactions within date range
    const transactions = await Transaction.find({
      createdBy: req.user._id,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });
    
    // Categorize cash flows
    const cashFlow = {
      operating: [],
      investing: [],
      financing: []
    };
    
    // This is a simplified approach - in reality would need proper categorization
    transactions.forEach(transaction => {
      // For demo purposes, categorize based on transaction category
      // In a real app, this would be based on account types
      if (transaction.category.includes('Equipment') || transaction.category.includes('Asset')) {
        cashFlow.investing.push(transaction);
      } else if (transaction.category.includes('Loan') || transaction.category.includes('Capital')) {
        cashFlow.financing.push(transaction);
      } else {
        cashFlow.operating.push(transaction);
      }
    });
    
    // Calculate totals
    cashFlow.operatingTotal = cashFlow.operating.reduce((sum, t) => 
      sum + (t.transactionType === 'credit' ? t.amount : -t.amount), 0);
    
    cashFlow.investingTotal = cashFlow.investing.reduce((sum, t) => 
      sum + (t.transactionType === 'credit' ? t.amount : -t.amount), 0);
    
    cashFlow.financingTotal = cashFlow.financing.reduce((sum, t) => 
      sum + (t.transactionType === 'credit' ? t.amount : -t.amount), 0);
    
    cashFlow.netCashFlow = cashFlow.operatingTotal + cashFlow.investingTotal + cashFlow.financingTotal;
    
    // Generate PDF
    const pdfBuffer = await pdfGenerator.generateCashFlowPDF(cashFlow, start, end);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=cash-flow-${start.toISOString().split('T')[0]}-to-${end.toISOString().split('T')[0]}.pdf`);
    
    // Send PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating cash flow:', error);
    res.status(500).json({ message: 'Error generating cash flow statement', error: error.message });
  }
};

module.exports = {
  generateBalanceSheet,
  generateProfitLoss,
  generateCashFlow
}; 