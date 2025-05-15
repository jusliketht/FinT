const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// @desc    Create journal entry
// @route   POST /api/journal-entries
// @access  Private
const createJournalEntry = async (req, res) => {
  try {
    const { date, description, debitAccountId, creditAccountId, amount } =
      req.body;

    // Validate input
    if (
      !date ||
      !description ||
      !debitAccountId ||
      !creditAccountId ||
      !amount
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // Check if accounts exist
    const [debitAccount, creditAccount] = await Promise.all([
      prisma.account.findUnique({ where: { id: debitAccountId } }),
      prisma.account.findUnique({ where: { id: creditAccountId } }),
    ]);

    if (!debitAccount || !creditAccount) {
      return res
        .status(404)
        .json({ message: "One or both accounts not found" });
    }

    // Create journal entry and update balances in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create journal entry
      const journalEntry = await tx.journalEntry.create({
        data: {
          date: new Date(date),
          description,
          amount,
          debitAccountId,
          creditAccountId,
          userId: req.user.id,
        },
      });

      // Update debit account balance
      await tx.account.update({
        where: { id: debitAccountId },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      // Update credit account balance
      await tx.account.update({
        where: { id: creditAccountId },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      return journalEntry;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Create journal entry error:", error);
    res.status(500).json({ message: "Error creating journal entry" });
  }
};

// @desc    Get all journal entries
// @route   GET /api/journal-entries
// @access  Private
const getJournalEntries = async (req, res) => {
  try {
    const { startDate, endDate, accountId } = req.query;

    const where = {
      userId: req.user.id,
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (accountId) {
      where.OR = [
        { debitAccountId: accountId },
        { creditAccountId: accountId },
      ];
    }

    const entries = await prisma.journalEntry.findMany({
      where,
      include: {
        debitAccount: true,
        creditAccount: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    res.json(entries);
  } catch (error) {
    console.error("Get journal entries error:", error);
    res.status(500).json({ message: "Error retrieving journal entries" });
  }
};

// @desc    Get journal entry by ID
// @route   GET /api/journal-entries/:id
// @access  Private
const getJournalEntryById = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await prisma.journalEntry.findUnique({
      where: { id },
      include: {
        debitAccount: true,
        creditAccount: true,
      },
    });

    if (!entry) {
      return res.status(404).json({ message: "Journal entry not found" });
    }

    res.json(entry);
  } catch (error) {
    console.error("Get journal entry error:", error);
    res.status(500).json({ message: "Error retrieving journal entry" });
  }
};

// @desc    Update journal entry
// @route   PUT /api/journal-entries/:id
// @access  Private
const updateJournalEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, description, debitAccountId, creditAccountId, amount } =
      req.body;

    // Validate input
    if (
      !date ||
      !description ||
      !debitAccountId ||
      !creditAccountId ||
      !amount
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // Get existing entry
    const existingEntry = await prisma.journalEntry.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return res.status(404).json({ message: "Journal entry not found" });
    }

    // Update entry and adjust balances in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Reverse old balances
      await tx.account.update({
        where: { id: existingEntry.debitAccountId },
        data: {
          balance: {
            decrement: existingEntry.amount,
          },
        },
      });

      await tx.account.update({
        where: { id: existingEntry.creditAccountId },
        data: {
          balance: {
            increment: existingEntry.amount,
          },
        },
      });

      // Update entry
      const updatedEntry = await tx.journalEntry.update({
        where: { id },
        data: {
          date: new Date(date),
          description,
          amount,
          debitAccountId,
          creditAccountId,
        },
      });

      // Apply new balances
      await tx.account.update({
        where: { id: debitAccountId },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      await tx.account.update({
        where: { id: creditAccountId },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      return updatedEntry;
    });

    res.json(result);
  } catch (error) {
    console.error("Update journal entry error:", error);
    res.status(500).json({ message: "Error updating journal entry" });
  }
};

// @desc    Delete journal entry
// @route   DELETE /api/journal-entries/:id
// @access  Private
const deleteJournalEntry = async (req, res) => {
  try {
    const { id } = req.params;

    // Get existing entry
    const existingEntry = await prisma.journalEntry.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return res.status(404).json({ message: "Journal entry not found" });
    }

    // Delete entry and adjust balances in a transaction
    await prisma.$transaction(async (tx) => {
      // Reverse balances
      await tx.account.update({
        where: { id: existingEntry.debitAccountId },
        data: {
          balance: {
            decrement: existingEntry.amount,
          },
        },
      });

      await tx.account.update({
        where: { id: existingEntry.creditAccountId },
        data: {
          balance: {
            increment: existingEntry.amount,
          },
        },
      });

      // Delete entry
      await tx.journalEntry.delete({
        where: { id },
      });
    });

    res.json({ message: "Journal entry deleted successfully" });
  } catch (error) {
    console.error("Delete journal entry error:", error);
    res.status(500).json({ message: "Error deleting journal entry" });
  }
};

// @desc    Get account reconciliation
// @route   GET /api/journal-entries/reconcile/:accountId
// @access  Private
const getAccountReconciliation = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate dates
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }

    // Get account
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Get journal entries
    const entries = await prisma.journalEntry.findMany({
      where: {
        OR: [{ debitAccountId: accountId }, { creditAccountId: accountId }],
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Calculate running balance
    let runningBalance = account.balance;
    const reconciliation = entries
      .map((entry) => {
        const isDebit = entry.debitAccountId === accountId;
        const amount = isDebit ? entry.amount : -entry.amount;
        runningBalance -= amount; // Subtract because we're going backwards

        return {
          date: entry.date,
          description: entry.description,
          amount,
          runningBalance,
          type: isDebit ? "debit" : "credit",
        };
      })
      .reverse(); // Reverse to show oldest first

    res.json({
      account,
      reconciliation,
      startBalance: runningBalance,
      endBalance: account.balance,
    });
  } catch (error) {
    console.error("Get account reconciliation error:", error);
    res
      .status(500)
      .json({ message: "Error retrieving account reconciliation" });
  }
};

module.exports = {
  createJournalEntry,
  getJournalEntries,
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry,
  getAccountReconciliation,
};
