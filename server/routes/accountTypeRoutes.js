const express = require("express");

const router = express.Router();
const {
  getAccountTypes,
  createAccountType,
  updateAccountType,
  deleteAccountType,
  createDefaultAccountTypes,
} = require("../controllers/accountTypeController");

// Account Type routes
router.route("/")
  .get(getAccountTypes)
  .post(createAccountType);

router.route("/:id")
  .put(updateAccountType)
  .delete(deleteAccountType);

// Create default account types
router.post("/default", createDefaultAccountTypes);

module.exports = router;
