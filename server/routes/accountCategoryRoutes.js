const express = require("express");
const router = express.Router();
const {
  getAccountCategories,
  createAccountCategory,
  updateAccountCategory,
  deleteAccountCategory,
  createDefaultCategories,
} = require("../controllers/accountCategoryController");

// Account Category routes
router.route("/")
  .get(getAccountCategories)
  .post(createAccountCategory);

router.route("/:id")
  .put(updateAccountCategory)
  .delete(deleteAccountCategory);

// Create default categories
router.post("/default", createDefaultCategories);

module.exports = router;
