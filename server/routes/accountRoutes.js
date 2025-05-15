const express = require("express");

const router = express.Router();
const {
  // Account Type controllers
  getAccountTypes,
  createAccountType,
  updateAccountType,
  deleteAccountType,
  // Category controllers
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  // Account controllers
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} = require("../controllers/accountController");

// Account Type routes
router
  .route("/types")
  .get(getAccountTypes)
  .post(createAccountType);

router
  .route("/types/:id")
  .put(updateAccountType)
  .delete(deleteAccountType);

// Category routes
router
  .route("/categories")
  .get(getCategories)
  .post(createCategory);

router
  .route("/categories/:id")
  .put(updateCategory)
  .delete(deleteCategory);

// Account routes
router
  .route("/")
  .get(getAccounts)
  .post(createAccount);

router
  .route("/:id")
  .put(updateAccount)
  .delete(deleteAccount);

module.exports = router;
