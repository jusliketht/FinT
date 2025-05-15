const express = require("express");
const router = express.Router();
const {
  generateBalanceSheet,
  generateProfitLoss,
  generateCashFlow,
} = require("../controllers/reportController");

// Trial Balance (not implemented)
// router.get("/trial-balance", getTrialBalance);

// Balance Sheet
router.get("/balance-sheet", generateBalanceSheet);

// Income Statement
router.get("/income-statement", generateProfitLoss);

// Cash Flow
router.get("/cash-flow", generateCashFlow);

module.exports = router;
