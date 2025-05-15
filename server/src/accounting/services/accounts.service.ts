import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Account, AccountType, NormalBalance } from '../entities/account.entity';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: TreeRepository<Account>,
    @InjectQueue('accounting')
    private readonly accountingQueue: Queue,
  ) {}

  async findAll(): Promise<Account[]> {
    return this.accountRepository.findTrees();
  }

  async findOne(id: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const { code, parentId, ...rest } = createAccountDto;

    // Check if code already exists
    const existingAccount = await this.accountRepository.findOne({
      where: { code },
    });

    if (existingAccount) {
      throw new BadRequestException(`Account code ${code} already exists`);
    }

    // Set normal balance based on account type
    const normalBalance = this.getNormalBalanceForType(createAccountDto.type);

    // Create account
    const account = this.accountRepository.create({
      ...rest,
      code,
      normalBalance,
    });

    // Set parent if provided
    if (parentId) {
      const parent = await this.accountRepository.findOne({
        where: { id: parentId },
      });

      if (!parent) {
        throw new NotFoundException(`Parent account with ID ${parentId} not found`);
      }

      account.parent = parent;
    }

    const savedAccount = await this.accountRepository.save(account);

    // Queue balance recalculation for parent accounts
    if (parentId) {
      await this.accountingQueue.add('recalculate-account-balances', {
        accountId: parentId,
      });
    }

    return savedAccount;
  }

  async update(id: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
    const { code, parentId, ...rest } = updateAccountDto;
    const account = await this.findOne(id);

    // Check if new code conflicts with existing accounts
    if (code && code !== account.code) {
      const existingAccount = await this.accountRepository.findOne({
        where: { code },
      });

      if (existingAccount && existingAccount.id !== id) {
        throw new BadRequestException(`Account code ${code} already exists`);
      }
    }

    // Update parent if provided
    if (parentId !== undefined) {
      if (parentId === null) {
        account.parent = null;
      } else {
        const parent = await this.accountRepository.findOne({
          where: { id: parentId },
        });

        if (!parent) {
          throw new NotFoundException(`Parent account with ID ${parentId} not found`);
        }

        // Prevent circular reference
        if (parentId === id) {
          throw new BadRequestException('Account cannot be its own parent');
        }

        // Check if new parent is not a descendant of this account
        const descendants = await this.accountRepository.findDescendants(account);
        if (descendants.some(desc => desc.id === parentId)) {
          throw new BadRequestException('Cannot set a descendant account as parent');
        }

        account.parent = parent;
      }
    }

    // Update account
    Object.assign(account, rest);
    if (code) account.code = code;

    const updatedAccount = await this.accountRepository.save(account);

    // Queue balance recalculation
    await this.accountingQueue.add('recalculate-account-balances', {
      accountId: id,
    });

    return updatedAccount;
  }

  async remove(id: string): Promise<void> {
    const account = await this.findOne(id);

    // Check if account has children
    const children = await this.accountRepository.findDescendants(account);
    if (children.length > 1) { // More than 1 because the account itself is included
      throw new BadRequestException('Cannot delete account with children');
    }

    // Check if account has transactions
    // TODO: Add check for journal entries

    await this.accountRepository.remove(account);

    // Queue balance recalculation for parent account
    if (account.parent) {
      await this.accountingQueue.add('recalculate-account-balances', {
        accountId: account.parent.id,
      });
    }
  }

  async getTrialBalance(): Promise<{
    accounts: Array<{
      id: string;
      code: string;
      name: string;
      type: AccountType;
      debit: number;
      credit: number;
    }>;
    totals: {
      totalDebit: number;
      totalCredit: number;
    };
  }> {
    const accounts = await this.accountRepository.find();
    
    const trialBalance = accounts.map(account => ({
      id: account.id,
      code: account.code,
      name: account.name,
      type: account.type,
      debit: account.normalBalance === NormalBalance.Debit ? Number(account.balance) : 0,
      credit: account.normalBalance === NormalBalance.Credit ? Number(account.balance) : 0,
    }));

    const totals = trialBalance.reduce(
      (acc, curr) => ({
        totalDebit: acc.totalDebit + curr.debit,
        totalCredit: acc.totalCredit + curr.credit,
      }),
      { totalDebit: 0, totalCredit: 0 }
    );

    return {
      accounts: trialBalance,
      totals,
    };
  }

  private getNormalBalanceForType(type: AccountType): NormalBalance {
    switch (type) {
      case AccountType.Asset:
      case AccountType.Expense:
        return NormalBalance.Debit;
      case AccountType.Liability:
      case AccountType.Equity:
      case AccountType.Revenue:
        return NormalBalance.Credit;
      default:
        throw new BadRequestException(`Invalid account type: ${type}`);
    }
  }
} 