import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient, Business, UserBusiness } from '@prisma/client';
import { BusinessType } from '../../constants/enums';

const prisma = new PrismaClient();

@Injectable()
export class BusinessService {
  async create(createBusinessDto: any) {
    // Create business and assign owner as ADMIN
    const business = await prisma.business.create({
      data: {
        ...createBusinessDto,
        Users: {
          create: [{
            userId: createBusinessDto.ownerId,
            role: 'ADMIN',
          }],
        },
      },
    });
    return business;
  }

  async findAll() {
    return prisma.business.findMany({
      include: { Users: true },
    });
  }

  async findOne(id: string) {
    const business = await prisma.business.findUnique({
      where: { id },
      include: { Users: true },
    });
    if (!business) throw new NotFoundException(`Business with ID ${id} not found`);
    return business;
  }

  async update(id: string, updateBusinessDto: any) {
    const business = await prisma.business.update({
      where: { id },
      data: updateBusinessDto,
    });
    return business;
  }

  async remove(id: string) {
    await prisma.business.delete({ where: { id } });
    return { message: 'Business deleted successfully' };
  }

  async getUserBusinesses(userId: string) {
    // Get businesses where user is assigned
    const userBusinesses = await prisma.userBusiness.findMany({
      where: { userId },
      include: { Business: true },
    });
    return userBusinesses.map(ub => ub.Business);
  }

  async addUser(businessId: string, userId: string, role: string = 'VIEWER') {
    // Only allow if business exists
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException(`Business with ID ${businessId} not found`);
    // Add user to business
    return prisma.userBusiness.create({
      data: {
        businessId,
        userId,
        role,
      },
    });
  }

  async removeUser(businessId: string, userId: string) {
    // Remove user from business
    await prisma.userBusiness.delete({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    });
    return { message: 'User removed from business successfully' };
  }
} 