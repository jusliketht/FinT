import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ThirdPartyService {
  async create(createThirdPartyDto: any, userId: string) {
    return prisma.thirdParty.create({
      data: {
        ...createThirdPartyDto,
        userId,
      },
    });
  }

  async findAll(query: any, userId: string) {
    const { businessId, type, isActive = true, search } = query;
    
    const where: any = {
      userId,
      isActive,
    };

    if (businessId) {
      where.businessId = businessId;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.thirdParty.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { Transactions: true },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const thirdParty = await prisma.thirdParty.findFirst({
      where: { id, userId },
      include: {
        Transactions: {
          orderBy: { date: 'desc' },
          take: 10, // Last 10 transactions
        },
        _count: {
          select: { Transactions: true },
        },
      },
    });

    if (!thirdParty) {
      throw new NotFoundException(`Third party with ID ${id} not found`);
    }

    return thirdParty;
  }

  async update(id: string, updateThirdPartyDto: any, userId: string) {
    const thirdParty = await prisma.thirdParty.findFirst({
      where: { id, userId },
    });

    if (!thirdParty) {
      throw new NotFoundException(`Third party with ID ${id} not found`);
    }

    return prisma.thirdParty.update({
      where: { id },
      data: updateThirdPartyDto,
    });
  }

  async remove(id: string, userId: string) {
    const thirdParty = await prisma.thirdParty.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { Transactions: true },
        },
      },
    });

    if (!thirdParty) {
      throw new NotFoundException(`Third party with ID ${id} not found`);
    }

    // Soft delete if there are associated transactions
    if (thirdParty._count.Transactions > 0) {
      return prisma.thirdParty.update({
        where: { id },
        data: { isActive: false },
      });
    }

    // Hard delete if no transactions
    return prisma.thirdParty.delete({
      where: { id },
    });
  }

  async getThirdPartyTransactions(id: string, userId: string, page = 1, limit = 20) {
    const thirdParty = await prisma.thirdParty.findFirst({
      where: { id, userId },
    });

    if (!thirdParty) {
      throw new NotFoundException(`Third party with ID ${id} not found`);
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { thirdPartyId: id },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({
        where: { thirdPartyId: id },
      }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getThirdPartyStats(userId: string, businessId?: string) {
    const where: any = { userId };
    if (businessId) {
      where.businessId = businessId;
    }

    const [totalThirdParties, activeThirdParties, thirdPartyTypes] = await Promise.all([
      prisma.thirdParty.count({ where }),
      prisma.thirdParty.count({ where: { ...where, isActive: true } }),
      prisma.thirdParty.groupBy({
        by: ['type'],
        where,
        _count: { id: true },
      }),
    ]);

    return {
      totalThirdParties,
      activeThirdParties,
      inactiveThirdParties: totalThirdParties - activeThirdParties,
      typeBreakdown: thirdPartyTypes.map(item => ({
        type: item.type,
        count: item._count.id,
      })),
    };
  }
} 