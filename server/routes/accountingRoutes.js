const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createAccountCategory,
  getAccountCategories,
  createAccountHead,
  getAccountHeads,
  getAccountHeadById,
  updateAccountHead,
  createJournalEntry,
  getJournalEntries,
  postJournalEntry,
  getLedgerEntries,
  getTrialBalance
} = require('../controllers/accountingController');

// Account Categories
router.route('/categories')
  .post(protect, authorize('admin'), createAccountCategory)
  .get(protect, getAccountCategories);

// Account Heads
router.route('/heads')
  .post(protect, authorize('admin'), createAccountHead)
  .get(protect, getAccountHeads);

router.route('/heads/:id')
  .get(protect, getAccountHeadById)
  .put(protect, authorize('admin'), updateAccountHead);

// Journal Entries
router.route('/journals')
  .post(protect, createJournalEntry)
  .get(protect, getJournalEntries);

router.route('/journals/:id/post')
  .put(protect, authorize('admin'), postJournalEntry);

// Ledger
router.route('/ledger/:accountId')
  .get(protect, getLedgerEntries);

// Reports
router.route('/trial-balance')
  .get(protect, getTrialBalance);

module.exports = router; 