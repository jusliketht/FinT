import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '../../constants/enums';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

@Injectable()
export class UsersService {
  async create(createUserDto: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    dateOfBirth?: Date;
    taxId?: string;
  }) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    return prisma.user.create({
      data: {
        ...createUserDto,
        id: uuidv4(),
        updatedAt: new Date(),
      },
    });
  }

  async findAll() {
    return prisma.user.findMany();
  }

  async findOne(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: any) {
    await this.findOne(id); // Verify user exists

    return prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verify user exists

    return prisma.user.delete({
      where: { id },
    });
  }

  async updateRole(id: string, role: UserRole) {
    const user = await this.findOne(id);
    return prisma.user.update({
      where: { id },
      data: { 
        role,
        updatedAt: new Date(),
      },
    });
  }

  async updatePermissions(id: string, permissions: string[]) {
    // Note: The current Prisma schema doesn't have a permissions field
    // This is a placeholder implementation
    const user = await this.findOne(id);
    // For now, we'll just return the user without updating permissions
    return user;
  }

  async getUserBusinesses(userId: string) {
    // Note: The current Prisma schema doesn't have a business relationship
    // This is a placeholder implementation
    return [];
  }
} 