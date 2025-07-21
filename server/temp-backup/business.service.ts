import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Business, UserBusiness } from '@prisma/client';
import { AccountSetupService } from './account-setup.service';

const prisma = new PrismaClient();

@Injectable()
export class BusinessService {
  constructor(private accountSetupService: AccountSetupService) {}

  /**
   * Create a new business with owner and default chart of accounts
   */
  async createBusiness(createBusinessDto: any, ownerId: string): Promise<Business> {
    // Validate business data
    if (!createBusinessDto.name || !createBusinessDto.type) {
      throw new BadRequestException('Business name and type are required');
    }

    // Create business and assign owner as ADMIN
    const business = await prisma.business.create({
      data: {
        ...createBusinessDto,
        ownerId,
        Users: {
          create: [{
            userId: ownerId,
            role: 'ADMIN',
          }],
        },
      },
      include: {
        Users: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Automatically seed Chart of Accounts for the new business
    await this.accountSetupService.initializeStandardChartOfAccounts(business.id);

    return business;
  }

  /**
   * Get all businesses where user has access
   */
  async getBusinessesByUser(userId: string): Promise<Business[]> {
    const userBusinesses = await prisma.userBusiness.findMany({
      where: { userId },
      include: { 
        Business: {
          include: {
            Users: {
              include: {
                User: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
    });
    
    return userBusinesses.map(ub => ub.Business);
  }

  /**
   * Get a single business with access verification
   */
  async findOne(id: string, userId: string): Promise<Business> {
    // Verify user has access to this business
    const userBusiness = await prisma.userBusiness.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId: id,
        },
      },
    });

    if (!userBusiness) {
      throw new ForbiddenException('Access denied to this business');
    }

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        Users: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    return business;
  }

  /**
   * Update business (only owner or admin can update)
   */
  async updateBusiness(id: string, updateBusinessDto: any, userId: string): Promise<Business> {
    // Verify user has permission to update
    const userBusiness = await prisma.userBusiness.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId: id,
        },
      },
    });

    if (!userBusiness || !['ADMIN', 'BUSINESS_OWNER'].includes(userBusiness.role)) {
      throw new ForbiddenException('Insufficient permissions to update business');
    }

    return prisma.business.update({
      where: { id },
      data: updateBusinessDto,
      include: {
        Users: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Delete business (only owner can delete)
   */
  async deleteBusiness(id: string, userId: string): Promise<void> {
    // Verify user is the owner
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        JournalEntries: true,
        Accounts: true,
        Transactions: true
      }
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    if (business.ownerId !== userId) {
      throw new ForbiddenException('Only the business owner can delete the business');
    }

    // Check if business has data
    if (business.JournalEntries.length > 0 || business.Accounts.length > 0 || business.Transactions.length > 0) {
      throw new BadRequestException('Cannot delete business with existing data. Please archive instead.');
    }

    // Delete business and all related data
    await prisma.$transaction([
      prisma.userBusiness.deleteMany({ where: { businessId: id } }),
      prisma.business.delete({ where: { id } })
    ]);
  }

  /**
   * Add user to business
   */
  async addUserToBusiness(businessId: string, userId: string, role: string, ownerId: string): Promise<UserBusiness> {
    // Verify the person adding is owner or admin
    const ownerBusiness = await prisma.userBusiness.findUnique({
      where: {
        userId_businessId: {
          userId: ownerId,
          businessId,
        },
      },
    });

    if (!ownerBusiness || !['ADMIN', 'BUSINESS_OWNER'].includes(ownerBusiness.role)) {
      throw new ForbiddenException('Insufficient permissions to add users');
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already in the business
    const existingUserBusiness = await prisma.userBusiness.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    });

    if (existingUserBusiness) {
      throw new BadRequestException('User is already a member of this business');
    }

    return prisma.userBusiness.create({
      data: {
        businessId,
        userId,
        role,
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        Business: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  /**
   * Remove user from business
   */
  async removeUserFromBusiness(businessId: string, userId: string, ownerId: string): Promise<void> {
    // Verify the person removing is owner or admin
    const ownerBusiness = await prisma.userBusiness.findUnique({
      where: {
        userId_businessId: {
          userId: ownerId,
          businessId,
        },
      },
    });

    if (!ownerBusiness || !['ADMIN', 'BUSINESS_OWNER'].includes(ownerBusiness.role)) {
      throw new ForbiddenException('Insufficient permissions to remove users');
    }

    // Prevent removing the owner
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (business?.ownerId === userId) {
      throw new BadRequestException('Cannot remove the business owner');
    }

    await prisma.userBusiness.delete({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    });
  }

  /**
   * Get all users for a business
   */
  async getBusinessUsers(businessId: string, userId: string): Promise<UserBusiness[]> {
    // Verify user has access to this business
    const userBusiness = await prisma.userBusiness.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    });

    if (!userBusiness) {
      throw new ForbiddenException('Access denied to this business');
    }

    return prisma.userBusiness.findMany({
      where: { businessId },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }


} 