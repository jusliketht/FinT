const express = require('express');
const {
  getGeneralLedger,
  getAccountLedger,
  getTrialBalance,
  postJournalEntry,
  getJournalEntry,
  getAllJournalEntries
} = require('../controllers/ledgerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// General ledger routes
router.get('/general', getGeneralLedger);

// Account ledger routes
router.get('/account/:accountId', getAccountLedger);

// Trial balance routes
router.get('/trial-balance', getTrialBalance);

// Journal entry routes
router.route('/journal-entries')
  .get(getAllJournalEntries)
  .post(postJournalEntry);

router.get('/journal-entries/:id', getJournalEntry);

module.exports = router; 