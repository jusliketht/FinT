import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccountTypeDto } from '../dto/account-type/create-account-type.dto';
import { UpdateAccountTypeDto } from '../dto/account-type/update-account-type.dto';

@Injectable()
export class AccountTypesService {
  private readonly logger = new Logger(AccountTypesService.name);

  constructor(private prisma: PrismaService) {}

  async create(createAccountTypeDto: CreateAccountTypeDto) {
    try {
      // Check if account type with same value already exists
      const existingType = await this.prisma.accountType.findFirst({
        where: { value: createAccountTypeDto.value }
      });

      if (existingType) {
        throw new BadRequestException(`Account type with value '${createAccountTypeDto.value}' already exists`);
      }

      const accountType = await this.prisma.accountType.create({
        data: createAccountTypeDto
      });

      this.logger.log(`Created account type: ${accountType.label} (${accountType.value})`);
      return accountType;
    } catch (error) {
      this.logger.error(`Error creating account type: ${error.message}`);
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.prisma.accountType.findMany({
        orderBy: { value: 'asc' }
      });
    } catch (error) {
      this.logger.error(`Error fetching account types: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const accountType = await this.prisma.accountType.findUnique({
        where: { id }
      });

      if (!accountType) {
        throw new NotFoundException(`Account type with ID ${id} not found`);
      }

      return accountType;
    } catch (error) {
      this.logger.error(`Error fetching account type: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, updateAccountTypeDto: UpdateAccountTypeDto) {
    try {
      // Check if account type exists
      const existingType = await this.prisma.accountType.findUnique({
        where: { id }
      });

      if (!existingType) {
        throw new NotFoundException(`Account type with ID ${id} not found`);
      }

      // If value is being updated, check for duplicates
      if (updateAccountTypeDto.value && updateAccountTypeDto.value !== existingType.value) {
        const duplicateType = await this.prisma.accountType.findFirst({
          where: { 
            value: updateAccountTypeDto.value,
            id: { not: id }
          }
        });

        if (duplicateType) {
          throw new BadRequestException(`Account type with value '${updateAccountTypeDto.value}' already exists`);
        }
      }

      const updatedType = await this.prisma.accountType.update({
        where: { id },
        data: updateAccountTypeDto
      });

      this.logger.log(`Updated account type: ${updatedType.label} (${updatedType.value})`);
      return updatedType;
    } catch (error) {
      this.logger.error(`Error updating account type: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Check if account type exists
      const existingType = await this.prisma.accountType.findUnique({
        where: { id }
      });

      if (!existingType) {
        throw new NotFoundException(`Account type with ID ${id} not found`);
      }

      // Check if account type is being used by any accounts
      const accountsUsingType = await this.prisma.account.findFirst({
        where: { type: existingType.value }
      });

      if (accountsUsingType) {
        throw new BadRequestException(`Cannot delete account type '${existingType.value}' as it is being used by accounts`);
      }

      await this.prisma.accountType.delete({
        where: { id }
      });

      this.logger.log(`Deleted account type: ${existingType.label} (${existingType.value})`);
      return { message: 'Account type deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting account type: ${error.message}`);
      throw error;
    }
  }

  async createDefaults() {
    try {
      const defaultTypes = [
        { value: 'asset', label: 'Asset', description: 'Resources owned by the business' },
        { value: 'liability', label: 'Liability', description: 'Obligations owed by the business' },
        { value: 'equity', label: 'Equity', description: 'Owner\'s investment in the business' },
        { value: 'revenue', label: 'Revenue', description: 'Income earned by the business' },
        { value: 'expense', label: 'Expense', description: 'Costs incurred by the business' }
      ];

      const createdTypes = [];

      for (const typeData of defaultTypes) {
        const existingType = await this.prisma.accountType.findFirst({
          where: { value: typeData.value }
        });

        if (!existingType) {
          const createdType = await this.prisma.accountType.create({
            data: typeData
          });
          createdTypes.push(createdType);
        }
      }

      this.logger.log(`Created ${createdTypes.length} default account types`);
      return createdTypes;
    } catch (error) {
      this.logger.error(`Error creating default account types: ${error.message}`);
      throw error;
    }
  }
} 