const express = require('express');
const { generateBalanceSheet, generateProfitLoss, generateCashFlow } = require('../controllers/reportController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reports/balance-sheet
// @desc    Generate Balance Sheet
// @access  Private
router.get('/balance-sheet', auth, generateBalanceSheet);

// @route   GET /api/reports/profit-loss
// @desc    Generate Profit & Loss Statement
// @access  Private
router.get('/profit-loss', auth, generateProfitLoss);

// @route   GET /api/reports/cash-flow
// @desc    Generate Cash Flow Statement
// @access  Private
router.get('/cash-flow', auth, generateCashFlow);

module.exports = router; 