const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Log available models
console.log('Available Prisma models:', Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_')));

// @desc    Get all account types
// @route   GET /api/account-types
// @access  Private
const getAccountTypes = async (req, res) => {
  try {
    // Check if accountType model exists
    if (prisma.accountType) {
      const types = await prisma.accountType.findMany({
        include: {
          categories: true,
        },
      });
      res.json(types);
    } else if (prisma.accountCategory) {
      // Try to get account types from categories
      const categories = await prisma.accountCategory.findMany({
        distinct: ['typeId'],
        include: {
          type: true,
        },
      });
      
      // Extract unique types
      const types = categories.map(cat => cat.type).filter((type, index, self) => 
        index === self.findIndex(t => t.id === type.id)
      );
      
      res.json(types);
    } else {
      // Return empty array if no model is available
      res.json([]);
    }
  } catch (error) {
    console.error("Get account types error:", error);
    res.status(500).json({ message: "Error retrieving account types" });
  }
};

// @desc    Create account type
// @route   POST /api/account-types
// @access  Private/Admin
const createAccountType = async (req, res) => {
  try {
    const { value, label } = req.body;

    // Validate input
    if (!value || !label) {
      return res.status(400).json({ message: "Value and label are required" });
    }

    // Check if type already exists
    const existingType = await prisma.accountType.findUnique({
      where: { value },
    });

    if (existingType) {
      return res.status(400).json({ message: "Account type already exists" });
    }

    const type = await prisma.accountType.create({
      data: {
        value,
        label,
      },
    });

    res.status(201).json(type);
  } catch (error) {
    console.error("Create account type error:", error);
    res.status(500).json({ message: "Error creating account type" });
  }
};

// @desc    Update account type
// @route   PUT /api/account-types/:id
// @access  Private/Admin
const updateAccountType = async (req, res) => {
  try {
    const { id } = req.params;
    const { value, label } = req.body;

    // Validate input
    if (!value || !label) {
      return res.status(400).json({ message: "Value and label are required" });
    }

    // Check if type exists
    const existingType = await prisma.accountType.findUnique({
      where: { id },
    });

    if (!existingType) {
      return res.status(404).json({ message: "Account type not found" });
    }

    // Check if new value conflicts with existing type
    if (value !== existingType.value) {
      const conflictType = await prisma.accountType.findUnique({
        where: { value },
      });

      if (conflictType) {
        return res
          .status(400)
          .json({ message: "Account type value already exists" });
      }
    }

    const updatedType = await prisma.accountType.update({
      where: { id },
      data: {
        value,
        label,
      },
    });

    res.json(updatedType);
  } catch (error) {
    console.error("Update account type error:", error);
    res.status(500).json({ message: "Error updating account type" });
  }
};

// @desc    Delete account type
// @route   DELETE /api/account-types/:id
// @access  Private/Admin
const deleteAccountType = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if type exists
    const existingType = await prisma.accountType.findUnique({
      where: { id },
      include: {
        accounts: true,
        categories: true,
      },
    });

    if (!existingType) {
      return res.status(404).json({ message: "Account type not found" });
    }

    // Check if type is in use
    if (
      existingType.accounts.length > 0 ||
      existingType.categories.length > 0
    ) {
      return res.status(400).json({
        message: "Cannot delete account type that is in use",
        accounts: existingType.accounts.length,
        categories: existingType.categories.length,
      });
    }

    await prisma.accountType.delete({
      where: { id },
    });

    res.json({ message: "Account type deleted successfully" });
  } catch (error) {
    console.error("Delete account type error:", error);
    res.status(500).json({ message: "Error deleting account type" });
  }
};

// @desc    Create default account types
// @route   POST /api/account-types/default
// @access  Private/Admin
const createDefaultAccountTypes = async (req, res) => {
  try {
    const defaultTypes = [
      { value: "asset", label: "Asset" },
      { value: "liability", label: "Liability" },
      { value: "equity", label: "Equity" },
      { value: "revenue", label: "Revenue" },
      { value: "expense", label: "Expense" },
    ];

    const createdTypes = await Promise.all(
      defaultTypes.map(async (type) => {
        const existingType = await prisma.accountType.findUnique({
          where: { value: type.value },
        });

        if (!existingType) {
          return prisma.accountType.create({
            data: type,
          });
        }
        return existingType;
      }),
    );

    res.status(201).json(createdTypes);
  } catch (error) {
    console.error("Create default account types error:", error);
    res.status(500).json({ message: "Error creating default account types" });
  }
};

module.exports = {
  getAccountTypes,
  createAccountType,
  updateAccountType,
  deleteAccountType,
  createDefaultAccountTypes,
};
