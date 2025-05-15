const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// @desc    Create bank account
// @route   POST /api/bank-accounts
// @access  Private
const createBankAccount = async (req, res) => {
  try {
    const { accountId, bankName, accountNumber, routingNumber, accountType } =
      req.body;

    // Validate input
    if (!accountId || !bankName || !accountNumber || !accountType) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Check if account exists
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Check if bank account already exists for this account
    const existingBankAccount = await prisma.bankAccount.findUnique({
      where: { accountId },
    });

    if (existingBankAccount) {
      return res
        .status(400)
        .json({ message: "Bank account already exists for this account" });
    }

    // Create bank account
    const bankAccount = await prisma.bankAccount.create({
      data: {
        accountId,
        bankName,
        accountNumber,
        routingNumber,
        accountType,
      },
      include: {
        account: true,
      },
    });

    res.status(201).json(bankAccount);
  } catch (error) {
    console.error("Create bank account error:", error);
    res.status(500).json({ message: "Error creating bank account" });
  }
};

// @desc    Get all bank accounts
// @route   GET /api/bank-accounts
// @access  Private
const getBankAccounts = async (req, res) => {
  try {
    const bankAccounts = await prisma.bankAccount.findMany({
      include: {
        account: true,
      },
    });
    res.json(bankAccounts);
  } catch (error) {
    console.error("Get bank accounts error:", error);
    res.status(500).json({ message: "Error retrieving bank accounts" });
  }
};

// @desc    Get bank account by ID
// @route   GET /api/bank-accounts/:id
// @access  Private
const getBankAccountById = async (req, res) => {
  try {
    const { id } = req.params;

    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id },
      include: {
        account: true,
      },
    });

    if (!bankAccount) {
      return res.status(404).json({ message: "Bank account not found" });
    }

    res.json(bankAccount);
  } catch (error) {
    console.error("Get bank account error:", error);
    res.status(500).json({ message: "Error retrieving bank account" });
  }
};

// @desc    Update bank account
// @route   PUT /api/bank-accounts/:id
// @access  Private
const updateBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { bankName, accountNumber, routingNumber, accountType } = req.body;

    // Validate input
    if (!bankName || !accountNumber || !accountType) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Check if bank account exists
    const existingBankAccount = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!existingBankAccount) {
      return res.status(404).json({ message: "Bank account not found" });
    }

    // Update bank account
    const updatedBankAccount = await prisma.bankAccount.update({
      where: { id },
      data: {
        bankName,
        accountNumber,
        routingNumber,
        accountType,
      },
      include: {
        account: true,
      },
    });

    res.json(updatedBankAccount);
  } catch (error) {
    console.error("Update bank account error:", error);
    res.status(500).json({ message: "Error updating bank account" });
  }
};

// @desc    Delete bank account
// @route   DELETE /api/bank-accounts/:id
// @access  Private
const deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if bank account exists
    const existingBankAccount = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!existingBankAccount) {
      return res.status(404).json({ message: "Bank account not found" });
    }

    // Delete bank account
    await prisma.bankAccount.delete({
      where: { id },
    });

    res.json({ message: "Bank account deleted successfully" });
  } catch (error) {
    console.error("Delete bank account error:", error);
    res.status(500).json({ message: "Error deleting bank account" });
  }
};

// @desc    Update last reconciled date
// @route   PATCH /api/bank-accounts/:id/reconcile
// @access  Private
const updateLastReconciled = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if bank account exists
    const existingBankAccount = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!existingBankAccount) {
      return res.status(404).json({ message: "Bank account not found" });
    }

    // Update last reconciled date
    const updatedBankAccount = await prisma.bankAccount.update({
      where: { id },
      data: {
        lastReconciled: new Date(),
      },
      include: {
        account: true,
      },
    });

    res.json(updatedBankAccount);
  } catch (error) {
    console.error("Update last reconciled error:", error);
    res.status(500).json({ message: "Error updating last reconciled date" });
  }
};

module.exports = {
  createBankAccount,
  getBankAccounts,
  getBankAccountById,
  updateBankAccount,
  deleteBankAccount,
  updateLastReconciled,
};
