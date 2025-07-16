import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, AccountCategory } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AccountCategoriesService {
  /**
   * Get standard accounting categories
   */
  async getStandardCategories(): Promise<AccountCategory[]> {
    const standardCategories = [
      { name: 'Asset', description: 'Assets - what the business owns' },
      { name: 'Liability', description: 'Liabilities - what the business owes' },
      { name: 'Equity', description: 'Equity - owner\'s investment and retained earnings' },
      { name: 'Revenue', description: 'Revenue - income from business activities' },
      { name: 'Expense', description: 'Expenses - costs of doing business' }
    ];

    // Ensure all standard categories exist
    const existingCategories = await prisma.accountCategory.findMany();
    const existingNames = existingCategories.map(c => c.name.toLowerCase());

    for (const category of standardCategories) {
      if (!existingNames.includes(category.name.toLowerCase())) {
        await prisma.accountCategory.create({
          data: category
        });
      }
    }

    return prisma.accountCategory.findMany({
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Create a custom account category
   */
  async createCategory(createCategoryDto: any): Promise<AccountCategory> {
    // Check if category with same name already exists
    const existingCategory = await prisma.accountCategory.findFirst({
      where: {
        name: {
          equals: createCategoryDto.name,
          mode: 'insensitive'
        }
      }
    });

    if (existingCategory) {
      throw new BadRequestException('Category with this name already exists');
    }

    return prisma.accountCategory.create({
      data: createCategoryDto
    });
  }

  /**
   * Update an account category
   */
  async updateCategory(id: string, updateCategoryDto: any): Promise<AccountCategory> {
    const category = await prisma.accountCategory.findUnique({
      where: { id }
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if new name conflicts with existing category
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await prisma.accountCategory.findFirst({
        where: {
          name: {
            equals: updateCategoryDto.name,
            mode: 'insensitive'
          },
          id: { not: id }
        }
      });

      if (existingCategory) {
        throw new BadRequestException('Category with this name already exists');
      }
    }

    return prisma.accountCategory.update({
      where: { id },
      data: updateCategoryDto
    });
  }

  /**
   * Delete an account category
   */
  async deleteCategory(id: string): Promise<void> {
    const category = await prisma.accountCategory.findUnique({
      where: { id },
      include: {
        AccountHead: true
      }
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if category has associated account heads
    if (category.AccountHead.length > 0) {
      throw new BadRequestException('Cannot delete category with existing account heads');
    }

    await prisma.accountCategory.delete({
      where: { id }
    });
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<AccountCategory> {
    const category = await prisma.accountCategory.findUnique({
      where: { id },
      include: {
        AccountHead: true
      }
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  /**
   * Get all categories
   */
  async getAllCategories(): Promise<AccountCategory[]> {
    return prisma.accountCategory.findMany({
      include: {
        AccountHead: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }
} 