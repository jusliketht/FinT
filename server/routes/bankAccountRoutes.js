const express = require("express");

const router = express.Router();
const {
  createBankAccount,
  getBankAccounts,
  getBankAccountById,
  updateBankAccount,
  deleteBankAccount,
  updateLastReconciled,
} = require("../controllers/bankAccountController");

// Bank Account routes
router.route("/")
  .get(getBankAccounts)
  .post(createBankAccount);

router.route("/:id")
  .get(getBankAccountById)
  .put(updateBankAccount)
  .delete(deleteBankAccount);

// Update last reconciled date
router.put("/:id/reconcile", updateLastReconciled);

module.exports = router;
