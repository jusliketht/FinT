const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// @desc    Get all account categories
// @route   GET /api/account-categories
// @access  Private
const getAccountCategories = async (req, res) => {
  try {
    const categories = await prisma.accountCategory.findMany({
      include: {
        type: true,
        accounts: true,
      },
    });
    res.json(categories);
  } catch (error) {
    console.error("Get account categories error:", error);
    res.status(500).json({ message: "Error retrieving account categories" });
  }
};

// @desc    Create account category
// @route   POST /api/account-categories
// @access  Private/Admin
const createAccountCategory = async (req, res) => {
  try {
    const { name, typeId } = req.body;

    // Validate input
    if (!name || !typeId) {
      return res.status(400).json({ message: "Name and typeId are required" });
    }

    // Check if type exists
    const type = await prisma.accountType.findUnique({
      where: { id: typeId },
    });

    if (!type) {
      return res.status(404).json({ message: "Account type not found" });
    }

    // Check if category already exists for this type
    const existingCategory = await prisma.accountCategory.findFirst({
      where: {
        name,
        typeId,
      },
    });

    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Category already exists for this type" });
    }

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
    console.error("Create account category error:", error);
    res.status(500).json({ message: "Error creating account category" });
  }
};

// @desc    Update account category
// @route   PUT /api/account-categories/:id
// @access  Private/Admin
const updateAccountCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, typeId } = req.body;

    // Validate input
    if (!name || !typeId) {
      return res.status(400).json({ message: "Name and typeId are required" });
    }

    // Check if category exists
    const existingCategory = await prisma.accountCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return res.status(404).json({ message: "Account category not found" });
    }

    // Check if type exists
    const type = await prisma.accountType.findUnique({
      where: { id: typeId },
    });

    if (!type) {
      return res.status(404).json({ message: "Account type not found" });
    }

    // Check if new name conflicts with existing category for this type
    if (name !== existingCategory.name || typeId !== existingCategory.typeId) {
      const conflictCategory = await prisma.accountCategory.findFirst({
        where: {
          name,
          typeId,
          id: { not: id },
        },
      });

      if (conflictCategory) {
        return res
          .status(400)
          .json({ message: "Category name already exists for this type" });
      }
    }

    const updatedCategory = await prisma.accountCategory.update({
      where: { id },
      data: {
        name,
        typeId,
      },
      include: {
        type: true,
      },
    });

    res.json(updatedCategory);
  } catch (error) {
    console.error("Update account category error:", error);
    res.status(500).json({ message: "Error updating account category" });
  }
};

// @desc    Delete account category
// @route   DELETE /api/account-categories/:id
// @access  Private/Admin
const deleteAccountCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await prisma.accountCategory.findUnique({
      where: { id },
      include: {
        accounts: true,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({ message: "Account category not found" });
    }

    // Check if category is in use
    if (existingCategory.accounts.length > 0) {
      return res.status(400).json({
        message: "Cannot delete category that is in use",
        accounts: existingCategory.accounts.length,
      });
    }

    await prisma.accountCategory.delete({
      where: { id },
    });

    res.json({ message: "Account category deleted successfully" });
  } catch (error) {
    console.error("Delete account category error:", error);
    res.status(500).json({ message: "Error deleting account category" });
  }
};

// @desc    Create default categories for a type
// @route   POST /api/account-categories/default/:typeId
// @access  Private/Admin
const createDefaultCategories = async (req, res) => {
  try {
    const { typeId } = req.params;

    // Check if type exists
    const type = await prisma.accountType.findUnique({
      where: { id: typeId },
    });

    if (!type) {
      return res.status(404).json({ message: "Account type not found" });
    }

    // Define default categories based on type
    const defaultCategories = {
      asset: ["Current Assets", "Fixed Assets", "Investments"],
      liability: ["Current Liabilities", "Long-term Liabilities"],
      equity: ["Capital", "Retained Earnings"],
      revenue: ["Operating Revenue", "Non-operating Revenue"],
      expense: ["Operating Expenses", "Non-operating Expenses"],
    };

    const categories = defaultCategories[type.value] || [];

    const createdCategories = await Promise.all(
      categories.map(async (name) => {
        const existingCategory = await prisma.accountCategory.findFirst({
          where: {
            name,
            typeId,
          },
        });

        if (!existingCategory) {
          return prisma.accountCategory.create({
            data: {
              name,
              typeId,
            },
          });
        }
        return existingCategory;
      }),
    );

    res.status(201).json(createdCategories);
  } catch (error) {
    console.error("Create default categories error:", error);
    res.status(500).json({ message: "Error creating default categories" });
  }
};

module.exports = {
  getAccountCategories,
  createAccountCategory,
  updateAccountCategory,
  deleteAccountCategory,
  createDefaultCategories,
};
