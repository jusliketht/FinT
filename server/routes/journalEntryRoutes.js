const express = require("express");

const router = express.Router();

// DEV ONLY: Mock req.user for development
router.use((req, res, next) => {
  if (!req.user) {
    req.user = { id: "dev-user-id" };
  }
  next();
});

const {
  createJournalEntry,
  getJournalEntries,
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry,
  getAccountReconciliation,
} = require("../controllers/journalEntryController");

// Journal Entry routes
router.route("/")
  .get(getJournalEntries)
  .post(createJournalEntry);

router.route("/:id")
  .get(getJournalEntryById)
  .put(updateJournalEntry)
  .delete(deleteJournalEntry);

// Account reconciliation
router.get("/reconciliation/:accountId", getAccountReconciliation);

module.exports = router;
