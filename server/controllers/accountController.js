const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Account Type Controllers
const getAccountTypes = async (req, res) => {
  try {
    const types = await prisma.accountType.findMany({
      include: {
        categories: true,
      },
    });
    res.json(types);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch account types", error: error.message });
  }
};

const createAccountType = async (req, res) => {
  const { value, label } = req.body;
  try {
    const type = await prisma.accountType.create({
      data: {
        value,
        label,
      },
    });
    res.status(201).json(type);
  } catch (error) {
    if (error.code === "P2002") {
      res.status(400).json({ message: "Account type value already exists" });
    } else {
      res.status(500).json({
        message: "Failed to create account type",
        error: error.message,
      });
    }
  }
};

const updateAccountType = async (req, res) => {
  const { id } = req.params;
  const { value, label } = req.body;
  try {
    const type = await prisma.accountType.update({
      where: { id },
      data: {
        value,
        label,
      },
    });
    res.json(type);
  } catch (error) {
    if (error.code === "P2002") {
      res.status(400).json({ message: "Account type value already exists" });
    } else {
      res.status(500).json({
        message: "Failed to update account type",
        error: error.message,
      });
    }
  }
};

const deleteAccountType = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if type is in use
    const accounts = await prisma.account.findMany({
      where: { typeId: id },
    });
    if (accounts.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete account type that is in use" });
    }

    await prisma.accountType.delete({
      where: { id },
    });
    res.json({ message: "Account type deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete account type", error: error.message });
  }
};

// Account Category Controllers
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.accountCategory.findMany({
      include: {
        type: true,
      },
    });
    res.json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch categories", error: error.message });
  }
};

const createCategory = async (req, res) => {
  const { name, typeId } = req.body;
  try {
    const category = await prisma.accountCategory.create({
      data: {
        name,
        typeId,
      },
      include: {
        type: true,
      },
    });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === "P2002") {
      res
        .status(400)
        .json({ message: "Category name already exists for this type" });
    } else {
      res
        .status(500)
        .json({ message: "Failed to create category", error: error.message });
    }
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, typeId } = req.body;
  try {
    const category = await prisma.accountCategory.update({
      where: { id },
      data: {
        name,
        typeId,
      },
      include: {
        type: true,
      },
    });
    res.json(category);
  } catch (error) {
    if (error.code === "P2002") {
      res
        .status(400)
        .json({ message: "Category name already exists for this type" });
    } else {
      res
        .status(500)
        .json({ message: "Failed to update category", error: error.message });
    }
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if category is in use
    const accounts = await prisma.account.findMany({
      where: { categoryId: id },
    });
    if (accounts.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete category that is in use" });
    }

    await prisma.accountCategory.delete({
      where: { id },
    });
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete category", error: error.message });
  }
};

// Account Controllers
const getAccounts = async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        type: true,
        category: true,
      },
    });
    res.json(accounts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch accounts", error: error.message });
  }
};

const createAccount = async (req, res) => {
  const { code, name, typeId, categoryId, description } = req.body;
  try {
    const account = await prisma.account.create({
      data: {
        code,
        name,
        typeId,
        categoryId,
        description,
        userId: req.user.id,
      },
      include: {
        type: true,
        category: true,
      },
    });
    res.status(201).json(account);
  } catch (error) {
    if (error.code === "P2002") {
      res.status(400).json({ message: "Account code already exists" });
    } else {
      res
        .status(500)
        .json({ message: "Failed to create account", error: error.message });
    }
  }
};

const updateAccount = async (req, res) => {
  const { id } = req.params;
  const { code, name, typeId, categoryId, description } = req.body;
  try {
    const account = await prisma.account.update({
      where: { id },
      data: {
        code,
        name,
        typeId,
        categoryId,
        description,
      },
      include: {
        type: true,
        category: true,
      },
    });
    res.json(account);
  } catch (error) {
    if (error.code === "P2002") {
      res.status(400).json({ message: "Account code already exists" });
    } else {
      res
        .status(500)
        .json({ message: "Failed to update account", error: error.message });
    }
  }
};

const deleteAccount = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if account has transactions
    const transactions = await prisma.journalEntry.findMany({
      where: {
        OR: [{ debitAccountId: id }, { creditAccountId: id }],
      },
    });
    if (transactions.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete account with transactions" });
    }

    await prisma.account.delete({
      where: { id },
    });
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete account", error: error.message });
  }
};

module.exports = {
  // Account Type exports
  getAccountTypes,
  createAccountType,
  updateAccountType,
  deleteAccountType,
  // Category exports
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  // Account exports
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
};
