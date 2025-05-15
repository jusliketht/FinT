const express = require("express");

const router = express.Router();
const {
  createCreditCard,
  getCreditCards,
  getCreditCardById,
  updateCreditCard,
  deleteCreditCard,
  getStatement,
  getUpcomingStatements,
} = require("../controllers/creditCardController");

// Credit Card routes
router.route("/")
  .get(getCreditCards)
  .post(createCreditCard);

router.route("/:id")
  .get(getCreditCardById)
  .put(updateCreditCard)
  .delete(deleteCreditCard);

// Statement routes
router.get("/:id/statement", getStatement);
router.get("/upcoming", getUpcomingStatements);

module.exports = router;
