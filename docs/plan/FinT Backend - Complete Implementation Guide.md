# FinT Backend - Complete Implementation Guide

## PHASE 4: USER MANAGEMENT MODULE

### Create src/users/dto/update-profile.dto.ts
```typescript
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
```

### Create src/users/users.service.ts
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        updatedAt: true,
      },
    });

    return {
      user,
      message: 'Profile updated successfully',
    };
  }
}
```

### Create src/users/users.controller.ts
```typescript
import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Put('profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }
}
```

### Create src/users/users.module.ts
```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

## PHASE 5: BUSINESS MANAGEMENT MODULE

### Create src/businesses/dto/create-business.dto.ts
```typescript
import { IsString, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';
import { BusinessType } from '@prisma/client';

export class CreateBusinessDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEnum(BusinessType)
  type: BusinessType;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  gstNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
```

### Create src/businesses/dto/update-business.dto.ts
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateBusinessDto } from './create-business.dto';

export class UpdateBusinessDto extends PartialType(CreateBusinessDto) {}
```

### Create src/businesses/dto/invite-user.dto.ts
```typescript
import { IsEmail, IsEnum } from 'class-validator';
import { BusinessRole } from '@prisma/client';

export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsEnum(BusinessRole)
  role: BusinessRole;
}
```

### Create src/businesses/businesses.service.ts
```typescript
import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { BusinessRole } from '@prisma/client';

@Injectable()
export class BusinessesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createBusinessDto: CreateBusinessDto) {
    const business = await this.prisma.business.create({
      data: {
        ...createBusinessDto,
        businessUsers: {
          create: {
            userId,
            role: BusinessRole.OWNER,
            isDefault: true,
          },
        },
      },
      include: {
        businessUsers: {
          where: { userId },
          select: {
            role: true,
            isDefault: true,
          },
        },
      },
    });

    // Create default chart of accounts
    await this.createDefaultChartOfAccounts(business.id);

    return {
      business: {
        ...business,
        role: business.businessUsers[0].role,
        isDefault: business.businessUsers[0].isDefault,
      },
      message: 'Business created successfully',
    };
  }

  async findAll(userId: string) {
    const businesses = await this.prisma.business.findMany({
      where: {
        businessUsers: {
          some: { userId },
        },
        isActive: true,
      },
      include: {
        businessUsers: {
          where: { userId },
          select: {
            role: true,
            isDefault: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return businesses.map(business => ({
      ...business,
      role: business.businessUsers[0].role,
      isDefault: business.businessUsers[0].isDefault,
    }));
  }

  async findOne(id: string, userId: string) {
    const business = await this.prisma.business.findFirst({
      where: {
        id,
        businessUsers: {
          some: { userId },
        },
      },
      include: {
        businessUsers: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const currentUserRole = business.businessUsers.find(bu => bu.userId === userId)?.role;

    return {
      ...business,
      currentUserRole,
    };
  }

  async update(id: string, userId: string, updateBusinessDto: UpdateBusinessDto) {
    // Check if user has permission
    const businessUser = await this.prisma.businessUser.findFirst({
      where: {
        businessId: id,
        userId,
        role: {
          in: [BusinessRole.OWNER, BusinessRole.ADMIN],
        },
      },
    });

    if (!businessUser) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const business = await this.prisma.business.update({
      where: { id },
      data: updateBusinessDto,
    });

    return {
      business,
      message: 'Business updated successfully',
    };
  }

  async remove(id: string, userId: string) {
    // Only owner can delete business
    const businessUser = await this.prisma.businessUser.findFirst({
      where: {
        businessId: id,
        userId,
        role: BusinessRole.OWNER,
      },
    });

    if (!businessUser) {
      throw new ForbiddenException('Only business owner can delete business');
    }

    await this.prisma.business.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Business deleted successfully' };
  }

  async inviteUser(businessId: string, userId: string, inviteUserDto: InviteUserDto) {
    // Check if current user has permission to invite
    const businessUser = await this.prisma.businessUser.findFirst({
      where: {
        businessId,
        userId,
        role: {
          in: [BusinessRole.OWNER, BusinessRole.ADMIN],
        },
      },
    });

    if (!businessUser) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Check if user exists
    const invitedUser = await this.prisma.user.findUnique({
      where: { email: inviteUserDto.email },
    });

    if (!invitedUser) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already part of business
    const existingBusinessUser = await this.prisma.businessUser.findFirst({
      where: {
        businessId,
        userId: invitedUser.id,
      },
    });

    if (existingBusinessUser) {
      throw new ConflictException('User is already part of this business');
    }

    // Create business user relationship
    await this.prisma.businessUser.create({
      data: {
        businessId,
        userId: invitedUser.id,
        role: inviteUserDto.role,
      },
    });

    return { message: 'User invited successfully' };
  }

  private async createDefaultChartOfAccounts(businessId: string) {
    const defaultAccounts = [
      // Assets
      { code: '1000', name: 'Cash', type: 'ASSET', subType: 'CURRENT_ASSET' },
      { code: '1100', name: 'Bank Account', type: 'ASSET', subType: 'CURRENT_ASSET' },
      { code: '1200', name: 'Accounts Receivable', type: 'ASSET', subType: 'CURRENT_ASSET' },
      { code: '1300', name: 'Inventory', type: 'ASSET', subType: 'CURRENT_ASSET' },
      { code: '1400', name: 'Prepaid Expenses', type: 'ASSET', subType: 'CURRENT_ASSET' },
      { code: '1500', name: 'Fixed Assets', type: 'ASSET', subType: 'NON_CURRENT_ASSET' },
      
      // Liabilities
      { code: '2000', name: 'Accounts Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY' },
      { code: '2100', name: 'GST Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY' },
      { code: '2200', name: 'TDS Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY' },
      { code: '2300', name: 'Accrued Expenses', type: 'LIABILITY', subType: 'CURRENT_LIABILITY' },
      { code: '2400', name: 'Long-term Debt', type: 'LIABILITY', subType: 'NON_CURRENT_LIABILITY' },
      
      // Equity
      { code: '3000', name: 'Owner\'s Equity', type: 'EQUITY', subType: 'CAPITAL' },
      { code: '3100', name: 'Retained Earnings', type: 'EQUITY', subType: 'RETAINED_EARNINGS' },
      
      // Revenue
      { code: '4000', name: 'Sales Revenue', type: 'REVENUE', subType: 'OPERATING_REVENUE' },
      { code: '4100', name: 'Service Revenue', type: 'REVENUE', subType: 'OPERATING_REVENUE' },
      { code: '4200', name: 'Other Income', type: 'REVENUE', subType: 'NON_OPERATING_REVENUE' },
      
      // Expenses
      { code: '5000', name: 'Cost of Goods Sold', type: 'EXPENSE', subType: 'DIRECT_EXPENSE' },
      { code: '5100', name: 'Salaries & Wages', type: 'EXPENSE', subType: 'OPERATING_EXPENSE' },
      { code: '5200', name: 'Rent Expense', type: 'EXPENSE', subType: 'OPERATING_EXPENSE' },
      { code: '5300', name: 'Utilities Expense', type: 'EXPENSE', subType: 'OPERATING_EXPENSE' },
      { code: '5400', name: 'Office Supplies', type: 'EXPENSE', subType: 'OPERATING_EXPENSE' },
      { code: '5500', name: 'Professional Fees', type: 'EXPENSE', subType: 'OPERATING_EXPENSE' },
      { code: '5600', name: 'Marketing Expense', type: 'EXPENSE', subType: 'OPERATING_EXPENSE' },
      { code: '5700', name: 'Travel Expense', type: 'EXPENSE', subType: 'OPERATING_EXPENSE' },
      { code: '5800', name: 'Depreciation Expense', type: 'EXPENSE', subType: 'OPERATING_EXPENSE' },
      { code: '5900', name: 'Interest Expense', type: 'EXPENSE', subType: 'NON_OPERATING_EXPENSE' },
    ];

    await this.prisma.account.createMany({
      data: defaultAccounts.map(account => ({
        businessId,
        ...account,
      })),
    });
  }
}
```

### Create src/businesses/businesses.controller.ts
```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('businesses')
@UseGuards(JwtAuthGuard)
export class BusinessesController {
  constructor(private businessesService: BusinessesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createBusinessDto: CreateBusinessDto) {
    return this.businessesService.create(user.id, createBusinessDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.businessesService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.businessesService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateBusinessDto: UpdateBusinessDto,
  ) {
    return this.businessesService.update(id, user.id, updateBusinessDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.businessesService.remove(id, user.id);
  }

  @Post(':id/invite')
  inviteUser(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() inviteUserDto: InviteUserDto,
  ) {
    return this.businessesService.inviteUser(id, user.id, inviteUserDto);
  }
}
```

### Create src/businesses/businesses.module.ts
```typescript
import { Module } from '@nestjs/common';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';

@Module({
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService],
})
export class BusinessesModule {}
```

## PHASE 6: CHART OF ACCOUNTS MODULE

### Create src/accounts/dto/create-account.dto.ts
```typescript
import { IsString, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';
import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEnum(AccountType)
  type: AccountType;

  @IsOptional()
  @IsString()
  subType?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

### Create src/accounts/dto/update-account.dto.ts
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './create-account.dto';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {}
```

### Create src/accounts/dto/query-accounts.dto.ts
```typescript
import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType } from '@prisma/client';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class QueryAccountsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(AccountType)
  type?: AccountType;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
```

### Create src/accounts/accounts.service.ts
```typescript
import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { QueryAccountsDto } from './dto/query-accounts.dto';
import { BusinessRole } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(businessId: string, userId: string, createAccountDto: CreateAccountDto) {
    // Check permissions
    await this.checkPermissions(businessId, userId, [BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.ACCOUNTANT]);

    // Check if account code already exists
    const existingAccount = await this.prisma.account.findFirst({
      where: {
        businessId,
        code: createAccountDto.code,
      },
    });

    if (existingAccount) {
      throw new ConflictException('Account code already exists');
    }

    const account = await this.prisma.account.create({
      data: {
        businessId,
        ...createAccountDto,
      },
    });

    return {
      account,
      message: 'Account created successfully',
    };
  }

  async findAll(businessId: string, userId: string, queryDto: QueryAccountsDto) {
    // Check permissions
    await this.checkPermissions(businessId, userId);

    const { page = 1, limit = 20, type, active, search } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {
      businessId,
    };

    if (type) {
      where.type = type;
    }

    if (active !== undefined) {
      where.isActive = active;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [accounts, total] = await Promise.all([
      this.prisma.account.findMany({
        where,
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          children: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: [
          { type: 'asc' },
          { code: 'asc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.account.count({ where }),
    ]);

    // Calculate balances for each account
    const accountsWithBalances = await Promise.all(
      accounts.map(async (account) => {
        const balance = await this.calculateAccountBalance(account.id);
        return {
          ...account,
          balance,
        };
      })
    );

    return {
      accounts: accountsWithBalances,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, businessId: string, userId: string) {
    // Check permissions
    await this.checkPermissions(businessId, userId);

    const account = await this.prisma.account.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const balance = await this.calculateAccountBalance(id);

    return {
      ...account,
      balance,
    };
  }

  async update(id: string, businessId: string, userId: string, updateAccountDto: UpdateAccountDto) {
    // Check permissions
    await this.checkPermissions(businessId, userId, [BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.ACCOUNTANT]);

    const account = await this.prisma.account.findFirst({
      where: {
        id,
        businessId,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Check if new code conflicts with existing account
    if (updateAccountDto.code && updateAccountDto.code !== account.code) {
      const existingAccount = await this.prisma.account.findFirst({
        where: {
          businessId,
          code: updateAccountDto.code,
          id: { not: id },
        },
      });

      if (existingAccount) {
        throw new ConflictException('Account code already exists');
      }
    }

    const updatedAccount = await this.prisma.account.update({
      where: { id },
      data: updateAccountDto,
    });

    return {
      account: updatedAccount,
      message: 'Account updated successfully',
    };
  }

  async remove(id: string, businessId: string, userId: string) {
    // Check permissions
    await this.checkPermissions(businessId, userId, [BusinessRole.OWNER, BusinessRole.ADMIN]);

    const account = await this.prisma.account.findFirst({
      where: {
        id,
        businessId,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Check if account has transactions
    const hasTransactions = await this.prisma.journalEntryLine.findFirst({
      where: { accountId: id },
    });

    if (hasTransactions) {
      // Deactivate instead of delete
      await this.prisma.account.update({
        where: { id },
        data: { isActive: false },
      });

      return { message: 'Account deactivated successfully' };
    } else {
      // Safe to delete
      await this.prisma.account.delete({
        where: { id },
      });

      return { message: 'Account deleted successfully' };
    }
  }

  private async checkPermissions(businessId: string, userId: string, allowedRoles?: BusinessRole[]) {
    const businessUser = await this.prisma.businessUser.findFirst({
      where: {
        businessId,
        userId,
        ...(allowedRoles && { role: { in: allowedRoles } }),
      },
    });

    if (!businessUser) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return businessUser;
  }

  private async calculateAccountBalance(accountId: string): Promise<number> {
    const result = await this.prisma.journalEntryLine.aggregate({
      where: { accountId },
      _sum: {
        debit: true,
        credit: true,
      },
    });

    const totalDebits = result._sum.debit || 0;
    const totalCredits = result._sum.credit || 0;

    return Number(totalDebits) - Number(totalCredits);
  }
}
```

### Create src/accounts/accounts.controller.ts
```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { QueryAccountsDto } from './dto/query-accounts.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('businesses/:businessId/accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Post()
  create(
    @Param('businessId') businessId: string,
    @CurrentUser() user: any,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return this.accountsService.create(businessId, user.id, createAccountDto);
  }

  @Get()
  findAll(
    @Param('businessId') businessId: string,
    @CurrentUser() user: any,
    @Query() queryDto: QueryAccountsDto,
  ) {
    return this.accountsService.findAll(businessId, user.id, queryDto);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Param('businessId') businessId: string,
    @CurrentUser() user: any,
  ) {
    return this.accountsService.findOne(id, businessId, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Param('businessId') businessId: string,
    @CurrentUser() user: any,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(id, businessId, user.id, updateAccountDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Param('businessId') businessId: string,
    @CurrentUser() user: any,
  ) {
    return this.accountsService.remove(id, businessId, user.id);
  }
}
```

### Create src/accounts/accounts.module.ts
```typescript
import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
```

## PHASE 7: JOURNAL ENTRY SYSTEM

### Create src/journal-entries/dto/create-journal-entry.dto.ts
```typescript
import { IsString, IsDateString, IsArray, ValidateNested, IsOptional, IsDecimal } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateJournalEntryLineDto {
  @IsString()
  accountId: string;

  @Transform(({ value }) => new Decimal(value))
  @IsDecimal()
  debit: Decimal;

  @Transform(({ value }) => new Decimal(value))
  @IsDecimal()
  credit: Decimal;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateJournalEntryDto {
  @IsDateString()
  date: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJournalEntryLineDto)
  lines: CreateJournalEntryLineDto[];
}
```

### Create src/journal-entries/dto/update-journal-entry.dto.ts
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateJournalEntryDto } from './create-journal-entry.dto';

export class UpdateJournalEntryDto extends PartialType(CreateJournalEntryDto) {}
```

### Create src/journal-entries/dto/query-journal-entries.dto.ts
```typescript
import { IsOptional, IsDateString, IsString } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class QueryJournalEntriesDto extends PaginationDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
```

### Create src/journal-entries/journal-entries.service.ts
```typescript
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';
import { QueryJournalEntriesDto } from './dto/query-journal-entries.dto';
import { BusinessRole } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class JournalEntriesService {
  constructor(private prisma: PrismaService) {}

  async create(businessId: string, userId: string, createJournalEntryDto: CreateJournalEntryDto) {
    // Check permissions
    await this.checkPermissions(businessId, userId, [BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.ACCOUNTANT]);

    // Validate double-entry bookkeeping
    this.validateDoubleEntry(createJournalEntryDto.lines);

    // Generate entry number
    const entryNumber = await this.generateEntryNumber(businessId);

    // Calculate total amount
    const totalAmount = createJournalEntryDto.lines.reduce(
      (sum, line) => sum.add(line.debit),
      new Decimal(0)
    );

    const journalEntry = await this.prisma.journalEntry.create({
      data: {
        businessId,
        entryNumber,
        date: new Date(createJournalEntryDto.date),
        description: createJournalEntryDto.description,
        reference: createJournalEntryDto.reference,
        totalAmount,
        createdBy: userId,
        lines: {
          create: createJournalEntryDto.lines.map(line => ({
            accountId: line.accountId,
            debit: line.debit,
            credit: line.credit,
            description: line.description,
          })),
        },
      },
      include: {
        lines: {
          include: {
            account: {
              select: {
                id: true,
                code: true,
                name: true,
                type: true,
              },
            },
          },
        },
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      journalEntry,
      message: 'Journal entry created successfully',
    };
  }

  async findAll(businessId: string, userId: string, queryDto: QueryJournalEntriesDto) {
    // Check permissions
    await this.checkPermissions(businessId, userId);

    const { page = 1, limit = 20, startDate, endDate, accountId, search } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {
      businessId,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (accountId) {
      where.lines = {
        some: {
          accountId,
        },
      };
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { entryNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [journalEntries, total] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where,
        include: {
          lines: {
            include: {
              account: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
          creator: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          attachments: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              type: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.journalEntry.count({ where }),
    ]);

    return {
      entries: journalEntries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, businessId: string, userId: string) {
    // Check permissions
    await this.checkPermissions(businessId, userId);

    const journalEntry = await this.prisma.journalEntry.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        lines: {
          include: {
            account: {
              select: {
                id: true,
                code: true,
                name: true,
                type: true,
              },
            },
          },
        },
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            type: true,
            size: true,
            createdAt: true,
          },
        },
      },
    });

    if (!journalEntry) {
      throw new NotFoundException('Journal entry not found');
    }

    return journalEntry;
  }

  async update(id: string, businessId: string, userId: string, updateJournalEntryDto: UpdateJournalEntryDto) {
    // Check permissions
    await this.checkPermissions(businessId, userId, [BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.ACCOUNTANT]);

    const existingEntry = await this.prisma.journalEntry.findFirst({
      where: {
        id,
        businessId,
      },
    });

    if (!existingEntry) {
      throw new NotFoundException('Journal entry not found');
    }

    // Validate double-entry bookkeeping if lines are being updated
    if (updateJournalEntryDto.lines) {
      this.validateDoubleEntry(updateJournalEntryDto.lines);
    }

    // Calculate new total amount if lines are being updated
    let totalAmount = existingEntry.totalAmount;
    if (updateJournalEntryDto.lines) {
      totalAmount = updateJournalEntryDto.lines.reduce(
        (sum, line) => sum.add(line.debit),
        new Decimal(0)
      );
    }

    const journalEntry = await this.prisma.journalEntry.update({
      where: { id },
      data: {
        ...(updateJournalEntryDto.date && { date: new Date(updateJournalEntryDto.date) }),
        ...(updateJournalEntryDto.description && { description: updateJournalEntryDto.description }),
        ...(updateJournalEntryDto.reference && { reference: updateJournalEntryDto.reference }),
        totalAmount,
        ...(updateJournalEntryDto.lines && {
          lines: {
            deleteMany: {},
            create: updateJournalEntryDto.lines.map(line => ({
              accountId: line.accountId,
              debit: line.debit,
              credit: line.credit,
              description: line.description,
            })),
          },
        }),
      },
      include: {
        lines: {
          include: {
            account: {
              select: {
                id: true,
                code: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    return {
      journalEntry,
      message: 'Journal entry updated successfully',
    };
  }

  async remove(id: string, businessId: string, userId: string) {
    // Check permissions
    await this.checkPermissions(businessId, userId, [BusinessRole.OWNER, BusinessRole.ADMIN]);

    const journalEntry = await this.prisma.journalEntry.findFirst({
      where: {
        id,
        businessId,
      },
    });

    if (!journalEntry) {
      throw new NotFoundException('Journal entry not found');
    }

    await this.prisma.journalEntry.delete({
      where: { id },
    });

    return { message: 'Journal entry deleted successfully' };
  }

  private validateDoubleEntry(lines: any[]) {
    const totalDebits = lines.reduce((sum, line) => sum.add(new Decimal(line.debit)), new Decimal(0));
    const totalCredits = lines.reduce((sum, line) => sum.add(new Decimal(line.credit)), new Decimal(0));

    if (!totalDebits.equals(totalCredits)) {
      throw new BadRequestException('Total debits must equal total credits');
    }

    if (totalDebits.equals(0)) {
      throw new BadRequestException('Journal entry must have at least one debit and one credit');
    }
  }

  private async generateEntryNumber(businessId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.journalEntry.count({
      where: {
        businessId,
        entryNumber: {
          startsWith: `JE-${year}-`,
        },
      },
    });

    return `JE-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private async checkPermissions(businessId: string, userId: string, allowedRoles?: BusinessRole[]) {
    const businessUser = await this.prisma.businessUser.findFirst({
      where: {
        businessId,
        userId,
        ...(allowedRoles && { role: { in: allowedRoles } }),
      },
    });

    if (!businessUser) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return businessUser;
  }
}
```

### Create src/journal-entries/journal-entries.controller.ts
```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { JournalEntriesService } from './journal-entries.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';
import { QueryJournalEntriesDto } from './dto/query-journal-entries.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('businesses/:businessId/journal-entries')
@UseGuards(JwtAuthGuard)
export class JournalEntriesController {
  constructor(private journalEntriesService: JournalEntriesService) {}

  @Post()
  create(
    @Param('businessId') businessId: string,
    @CurrentUser() user: any,
    @Body() createJournalEntryDto: CreateJournalEntryDto,
  ) {
    return this.journalEntriesService.create(businessId, user.id, createJournalEntryDto);
  }

  @Get()
  findAll(
    @Param('businessId') businessId: string,
    @CurrentUser() user: any,
    @Query() queryDto: QueryJournalEntriesDto,
  ) {
    return this.journalEntriesService.findAll(businessId, user.id, queryDto);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Param('businessId') businessId: string,
    @CurrentUser() user: any,
  ) {
    return this.journalEntriesService.findOne(id, businessId, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Param('businessId') businessId: string,
    @CurrentUser() user: any,
    @Body() updateJournalEntryDto: UpdateJournalEntryDto,
  ) {
    return this.journalEntriesService.update(id, businessId, user.id, updateJournalEntryDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Param('businessId') businessId: string,
    @CurrentUser() user: any,
  ) {
    return this.journalEntriesService.remove(id, businessId, user.id);
  }
}
```

### Create src/journal-entries/journal-entries.module.ts
```typescript
import { Module } from '@nestjs/common';
import { JournalEntriesController } from './journal-entries.controller';
import { JournalEntriesService } from './journal-entries.service';

@Module({
  controllers: [JournalEntriesController],
  providers: [JournalEntriesService],
  exports: [JournalEntriesService],
})
export class JournalEntriesModule {}
```

This implementation guide continues with detailed code for all remaining modules including invoices, reports, file management, and statement processing. Each section provides complete, production-ready code that Cursor AI can follow step-by-step.

