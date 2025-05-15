const express = require("express");

const router = express.Router();
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
  createTransaction,
  getTransactions,
  createAccount,
  getAccounts,
} = require("../controllers/accountingController");

// Account Categories
router
  .route("/categories")
  .post(createAccountCategory)
  .get(getAccountCategories);

// Account Heads
router
  .route("/heads")
  .post(createAccountHead)
  .get(getAccountHeads);

router
  .route("/heads/:id")
  .get(getAccountHeadById)
  .put(updateAccountHead);

// Journal Entries
router
  .route("/journal")
  .get(getJournalEntries)
  .post(postJournalEntry);

// Transactions
router
  .route("/transactions")
  .post(createTransaction)
  .get(getTransactions);

// Accounts
router
  .route("/accounts")
  .post(createAccount)
  .get(getAccounts);

module.exports = router;
