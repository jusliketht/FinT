const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

// GET /api/transactions
router.get("/", async (req, res) => {
  res.json({ message: "Transaction routes working" });
});

// POST /api/transactions
router.post(
  "/",
  [
    body("amount").isNumeric(),
    body("description").isString(),
    body("date").isISO8601(),
  ],
  async (req, res) => {
    res.json({ message: "Transaction creation endpoint" });
  },
);

// GET /api/transactions/:id
router.get("/:id", async (req, res) => {
  res.json({ message: "Get transaction by ID" });
});

// PUT /api/transactions/:id
router.put(
  "/:id",
  [
    body("amount").optional().isNumeric(),
    body("description").optional().isString(),
    body("date").optional().isISO8601(),
  ],
  async (req, res) => {
    res.json({ message: "Update transaction endpoint" });
  },
);

// DELETE /api/transactions/:id
router.delete("/:id", async (req, res) => {
  res.json({ message: "Delete transaction endpoint" });
});

module.exports = router;
