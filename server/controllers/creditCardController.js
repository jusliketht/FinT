const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { addDays, setDate } = require("date-fns");

// @desc    Create credit card
// @route   POST /api/credit-cards
// @access  Private
const createCreditCard = async (req, res) => {
  try {
    const {
      accountId,
      cardName,
      cardNumber,
      cardType,
      creditLimit,
      statementCycle,
      dueDate,
    } = req.body;

    // Validate input
    if (
      !accountId ||
      !cardName ||
      !cardNumber ||
      !cardType ||
      !creditLimit ||
      !statementCycle ||
      !dueDate
    ) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Validate statement cycle and due date
    if (statementCycle < 1 || statementCycle > 31) {
      return res
        .status(400)
        .json({ message: "Statement cycle must be between 1 and 31" });
    }

    if (dueDate < 1 || dueDate > 31) {
      return res
        .status(400)
        .json({ message: "Due date must be between 1 and 31" });
    }

    // Check if account exists
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Check if credit card already exists for this account
    const existingCreditCard = await prisma.creditCard.findUnique({
      where: { accountId },
    });

    if (existingCreditCard) {
      return res
        .status(400)
        .json({ message: "Credit card already exists for this account" });
    }

    // Calculate next statement date
    const today = new Date();
    let nextStatement = setDate(today, statementCycle);
    if (nextStatement < today) {
      nextStatement = setDate(
        new Date(today.getFullYear(), today.getMonth() + 1, 1),
        statementCycle,
      );
    }

    // Create credit card
    const creditCard = await prisma.creditCard.create({
      data: {
        accountId,
        cardName,
        cardNumber,
        cardType,
        creditLimit,
        statementCycle,
        dueDate,
        nextStatement,
      },
      include: {
        account: true,
      },
    });

    res.status(201).json(creditCard);
  } catch (error) {
    console.error("Create credit card error:", error);
    res.status(500).json({ message: "Error creating credit card" });
  }
};

// @desc    Get all credit cards
// @route   GET /api/credit-cards
// @access  Private
const getCreditCards = async (req, res) => {
  try {
    const creditCards = await prisma.creditCard.findMany({
      include: {
        account: true,
      },
    });
    res.json(creditCards);
  } catch (error) {
    console.error("Get credit cards error:", error);
    res.status(500).json({ message: "Error retrieving credit cards" });
  }
};

// @desc    Get credit card by ID
// @route   GET /api/credit-cards/:id
// @access  Private
const getCreditCardById = async (req, res) => {
  try {
    const { id } = req.params;

    const creditCard = await prisma.creditCard.findUnique({
      where: { id },
      include: {
        account: true,
      },
    });

    if (!creditCard) {
      return res.status(404).json({ message: "Credit card not found" });
    }

    res.json(creditCard);
  } catch (error) {
    console.error("Get credit card error:", error);
    res.status(500).json({ message: "Error retrieving credit card" });
  }
};

// @desc    Update credit card
// @route   PUT /api/credit-cards/:id
// @access  Private
const updateCreditCard = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cardName,
      cardNumber,
      cardType,
      creditLimit,
      statementCycle,
      dueDate,
    } = req.body;

    // Validate input
    if (
      !cardName ||
      !cardNumber ||
      !cardType ||
      !creditLimit ||
      !statementCycle ||
      !dueDate
    ) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Validate statement cycle and due date
    if (statementCycle < 1 || statementCycle > 31) {
      return res
        .status(400)
        .json({ message: "Statement cycle must be between 1 and 31" });
    }

    if (dueDate < 1 || dueDate > 31) {
      return res
        .status(400)
        .json({ message: "Due date must be between 1 and 31" });
    }

    // Check if credit card exists
    const existingCreditCard = await prisma.creditCard.findUnique({
      where: { id },
    });

    if (!existingCreditCard) {
      return res.status(404).json({ message: "Credit card not found" });
    }

    // Calculate next statement date if statement cycle changed
    let nextStatement = existingCreditCard.nextStatement;
    if (statementCycle !== existingCreditCard.statementCycle) {
      const today = new Date();
      nextStatement = setDate(today, statementCycle);
      if (nextStatement < today) {
        nextStatement = setDate(
          new Date(today.getFullYear(), today.getMonth() + 1, 1),
          statementCycle,
        );
      }
    }

    // Update credit card
    const updatedCreditCard = await prisma.creditCard.update({
      where: { id },
      data: {
        cardName,
        cardNumber,
        cardType,
        creditLimit,
        statementCycle,
        dueDate,
        nextStatement,
      },
      include: {
        account: true,
      },
    });

    res.json(updatedCreditCard);
  } catch (error) {
    console.error("Update credit card error:", error);
    res.status(500).json({ message: "Error updating credit card" });
  }
};

// @desc    Delete credit card
// @route   DELETE /api/credit-cards/:id
// @access  Private
const deleteCreditCard = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if credit card exists
    const existingCreditCard = await prisma.creditCard.findUnique({
      where: { id },
    });

    if (!existingCreditCard) {
      return res.status(404).json({ message: "Credit card not found" });
    }

    // Delete credit card
    await prisma.creditCard.delete({
      where: { id },
    });

    res.json({ message: "Credit card deleted successfully" });
  } catch (error) {
    console.error("Delete credit card error:", error);
    res.status(500).json({ message: "Error deleting credit card" });
  }
};

// @desc    Update statement dates
// @route   PATCH /api/credit-cards/:id/statement
// @access  Private
const updateStatementDates = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if credit card exists
    const existingCreditCard = await prisma.creditCard.findUnique({
      where: { id },
    });

    if (!existingCreditCard) {
      return res.status(404).json({ message: "Credit card not found" });
    }

    // Calculate next statement date
    const today = new Date();
    let nextStatement = setDate(today, existingCreditCard.statementCycle);
    if (nextStatement < today) {
      nextStatement = setDate(
        new Date(today.getFullYear(), today.getMonth() + 1, 1),
        existingCreditCard.statementCycle,
      );
    }

    // Update statement dates
    const updatedCreditCard = await prisma.creditCard.update({
      where: { id },
      data: {
        lastStatement: new Date(),
        nextStatement,
      },
      include: {
        account: true,
      },
    });

    res.json(updatedCreditCard);
  } catch (error) {
    console.error("Update statement dates error:", error);
    res.status(500).json({ message: "Error updating statement dates" });
  }
};

// @desc    Get upcoming statements
// @route   GET /api/credit-cards/upcoming
// @access  Private
const getUpcomingStatements = async (req, res) => {
  try {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const creditCards = await prisma.creditCard.findMany({
      where: {
        nextStatement: {
          lte: nextMonth,
        },
      },
      include: {
        account: true,
      },
      orderBy: {
        nextStatement: "asc",
      },
    });

    const upcomingStatements = creditCards.map((card) => ({
      ...card,
      dueDate: addDays(card.nextStatement, card.dueDate),
    }));

    res.json(upcomingStatements);
  } catch (error) {
    console.error("Get upcoming statements error:", error);
    res.status(500).json({ message: "Error retrieving upcoming statements" });
  }
};

// Insert stub functions for getStatement and getUpcomingStatements
const getStatement = (req, res) => { res.send("Statement endpoint stub."); };

module.exports = {
  createCreditCard,
  getCreditCards,
  getCreditCardById,
  updateCreditCard,
  deleteCreditCard,
  getStatement,
  getUpcomingStatements,
};
