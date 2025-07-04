import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';

const prisma = new PrismaClient();

@Injectable()
export class AccountsService {
  async create(createAccountDto: CreateAccountDto & { userId: string }) {
    return prisma.account.create({
      data: {
        name: createAccountDto.name,
        type: createAccountDto.type,
        code: createAccountDto.code,
        userId: createAccountDto.userId,
      },
    });
  }

  async findAll() {
    return prisma.account.findMany();
  }

  async findOne(id: string) {
    const account = await prisma.account.findUnique({
      where: { id },
    });
    
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    
    return account;
  }

  async update(id: string, updateAccountDto: UpdateAccountDto) {
    await this.findOne(id); // Verify account exists
    
    return prisma.account.update({
      where: { id },
      data: updateAccountDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verify account exists
    
    return prisma.account.delete({
      where: { id },
    });
  }

  async getTrialBalance() {
    // This is a placeholder implementation
    // You'll need to implement the actual trial balance logic
    return {
      message: 'Trial balance functionality to be implemented',
      data: []
    };
  }
} 