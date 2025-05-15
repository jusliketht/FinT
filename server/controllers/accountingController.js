const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncHandler = require("express-async-handler");

const ErrorResponse = require("../utils/errorResponse");

// @desc    Create account category
// @route   POST /api/accounting/categories
// @access  Private/Admin
const createAccountCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const existingCategory = await prisma.accountCategory.findUnique({
    where: { name },
  });

  if (existingCategory) {
    res.status(400);
    throw new Error("Account category already exists");
  }

  const category = await prisma.accountCategory.create({
    data: {
      name,
      description,
    },
  });

  res.status(201).json(category);
});

// @desc    Get all account categories
// @route   GET /api/accounting/categories
// @access  Private
const getAccountCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.accountCategory.findMany({
    include: {
      accountHeads: true,
    },
  });
  res.json(categories);
});

// @desc    Create account head
// @route   POST /api/accounting/heads
// @access  Private/Admin
const createAccountHead = asyncHandler(async (req, res) => {
  const {
    code,
    name,
    description,
    categoryId,
    parentId,
    isCustom = false,
  } = req.body;

  // Check if account code already exists
  const existingHead = await prisma.accountHead.findUnique({
    where: { code },
  });

  if (existingHead) {
    res.status(400);
    throw new Error("Account code already exists");
  }

  // Verify category exists
  const category = await prisma.accountCategory.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    res.status(404);
    throw new Error("Account category not found");
  }

  // If parentId is provided, verify parent account exists
  if (parentId) {
    const parentAccount = await prisma.accountHead.findUnique({
      where: { id: parentId },
    });

    if (!parentAccount) {
      res.status(404);
      throw new Error("Parent account not found");
    }
  }

  const accountHead = await prisma.accountHead.create({
    data: {
      code,
      name,
      description,
      categoryId,
      parentId,
      isCustom,
    },
  });

  res.status(201).json(accountHead);
});

// @desc    Get all account heads
// @route   GET /api/accounting/heads
// @access  Private
const getAccountHeads = asyncHandler(async (req, res) => {
  const accountHeads = await prisma.accountHead.findMany({
    include: {
      category: true,
      parent: true,
      subAccounts: true,
    },
  });
  res.json(accountHeads);
});

// @desc    Get account head by ID
// @route   GET /api/accounting/heads/:id
// @access  Private
const getAccountHeadById = asyncHandler(async (req, res) => {
  const accountHead = await prisma.accountHead.findUnique({
    where: { id: req.params.id },
    include: {
      category: true,
      parent: true,
      subAccounts: true,
      ledgerEntries: {
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  if (!accountHead) {
    res.status(404);
    throw new Error("Account head not found");
  }

  res.json(accountHead);
});

// @desc    Update account head
// @route   PUT /api/accounting/heads/:id
// @access  Private/Admin
const updateAccountHead = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const accountHead = await prisma.accountHead.findUnique({
    where: { id: req.params.id },
  });

  if (!accountHead) {
    res.status(404);
    throw new Error("Account head not found");
  }

  const updatedAccountHead = await prisma.accountHead.update({
    where: { id: req.params.id },
    data: {
      name,
      description,
    },
  });

  res.json(updatedAccountHead);
});

// @desc    Create journal entry
// @route   POST /api/accounting/journals
// @access  Private/Accountant
const createJournalEntry = asyncHandler(async (req, res) => {
  const { date, description, items } = req.body;

  // Generate a unique reference number (format: JE-YYYYMMDD-XXXX)
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const reference = `JE-${dateStr}-${randomSuffix}`;

  // Validate total debits equals total credits
  const totalDebits = items.reduce(
    (sum, item) => sum + (parseFloat(item.debitAmount) || 0),
    0,
  );
  const totalCredits = items.reduce(
    (sum, item) => sum + (parseFloat(item.creditAmount) || 0),
    0,
  );

  if (Math.abs(totalDebits - totalCredits) > 0.001) {
    // Using small epsilon for floating-point comparison
    res.status(400);
    throw new Error("Total debits must equal total credits");
  }

  // Create journal entry with items in a transaction
  const journalEntry = await prisma.$transaction(async (prisma) => {
    // Create the main journal entry
    const entry = await prisma.journalEntry.create({
      data: {
        date: new Date(date),
        reference,
        description,
        createdBy: req.user.id,
        items: {
          create: items.map((item) => ({
            accountHeadId: item.accountHeadId,
            description: item.description,
            debitAmount: item.debitAmount || 0,
            creditAmount: item.creditAmount || 0,
          })),
        },
      },
      include: {
        items: {
          include: {
            accountHead: true,
          },
        },
      },
    });

    // Create corresponding ledger entries
    for (const item of items) {
      await prisma.ledgerEntry.create({
        data: {
          accountHeadId: item.accountHeadId,
          date: new Date(date),
          description: `${description} (${reference})`,
          debitAmount: item.debitAmount || 0,
          creditAmount: item.creditAmount || 0,
          balance: 0, // Will be updated by updateLedgerBalances
          reference,
        },
      });
    }

    return entry;
  });

  // Update running balances for affected accounts
  await updateLedgerBalances(
    journalEntry.items.map((item) => item.accountHeadId),
  );

  res.status(201).json(journalEntry);
});

// @desc    Get all journal entries
// @route   GET /api/accounting/journals
// @access  Private
const getJournalEntries = asyncHandler(async (req, res) => {
  const { startDate, endDate, status } = req.query;

  const where = {};
  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }
  if (status) {
    where.status = status;
  }

  const journalEntries = await prisma.journalEntry.findMany({
    where,
    include: {
      items: {
        include: {
          accountHead: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  res.json(journalEntries);
});

// @desc    Post journal entry
// @route   PUT /api/accounting/journals/:id/post
// @access  Private/Accountant
const postJournalEntry = asyncHandler(async (req, res) => {
  const entry = await prisma.journalEntry.findUnique({
    where: { id: req.params.id },
    include: {
      items: true,
    },
  });

  if (!entry) {
    res.status(404);
    throw new Error("Journal entry not found");
  }

  if (entry.status !== "draft") {
    res.status(400);
    throw new Error("Only draft entries can be posted");
  }

  const updatedEntry = await prisma.journalEntry.update({
    where: { id: req.params.id },
    data: {
      status: "posted",
    },
    include: {
      items: {
        include: {
          accountHead: true,
        },
      },
    },
  });

  res.json(updatedEntry);
});

// @desc    Create a new transaction
// @route   POST /api/v1/transactions
// @access  Private
const createTransaction = asyncHandler(async (req, res) => {
  const { type, amount, description, accountId } = req.body;

  const transaction = await prisma.transaction.create({
    data: {
      type,
      amount,
      description,
      accountId,
      userId: req.user.id,
    },
  });

  res.status(201).json({
    success: true,
    data: transaction,
  });
});

// @desc    Get all transactions for a user
// @route   GET /api/v1/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      account: true,
    },
  });

  res.status(200).json({
    success: true,
    data: transactions,
  });
});

// @desc    Create a new account
// @route   POST /api/v1/accounts
// @access  Private
const createAccount = asyncHandler(async (req, res) => {
  const { name, type, balance } = req.body;

  const account = await prisma.account.create({
    data: {
      name,
      type,
      balance,
      userId: req.user.id,
    },
  });

  res.status(201).json({
    success: true,
    data: account,
  });
});

// @desc    Get all accounts for a user
// @route   GET /api/v1/accounts
// @access  Private
const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await prisma.account.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      transactions: true,
    },
  });

  res.status(200).json({
    success: true,
    data: accounts,
  });
});

module.exports = {
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
};
