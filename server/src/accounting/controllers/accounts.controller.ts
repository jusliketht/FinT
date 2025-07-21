import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountsService } from '../services/accounts.service';

@ApiTags('Accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  async createAccount(
    @Request() req,
    @Body() data: {
      code: string;
      name: string;
      type: string;
      description?: string;
      businessId?: string;
    }
  ) {
    return this.accountsService.createAccount({
      ...data,
      userId: req.user.id
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts for current context' })
  @ApiResponse({ status: 200, description: 'Return all accounts' })
  async getAccounts(
    @Request() req,
    @Query('businessId') businessId?: string,
    @Query('includePersonal') includePersonal?: string
  ) {
    const includePersonalBool = includePersonal === 'true';
    return this.accountsService.getAccounts(req.user.id, businessId, includePersonalBool);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all account types' })
  @ApiResponse({ status: 200, description: 'Return account types' })
  async getAccountTypes() {
    return this.accountsService.getAccountTypes();
  }

  @Get('by-type')
  @ApiOperation({ summary: 'Get accounts by type' })
  @ApiResponse({ status: 200, description: 'Return accounts filtered by type' })
  async getAccountsByType(
    @Request() req,
    @Query('type') type?: string,
    @Query('businessId') businessId?: string
  ) {
    return this.accountsService.getAccountsByType(req.user.id, businessId, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiResponse({ status: 200, description: 'Return the account' })
  async getAccount(@Param('id') id: string, @Request() req) {
    return this.accountsService.getAccount(id, req.user.id);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get account balance' })
  @ApiResponse({ status: 200, description: 'Return account balance' })
  async getAccountBalance(@Param('id') id: string, @Request() req) {
    return this.accountsService.getAccountBalance(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update account' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  async updateAccount(
    @Param('id') id: string,
    @Body() data: {
      code?: string;
      name?: string;
      type?: string;
      description?: string;
      isActive?: boolean;
    },
    @Request() req
  ) {
    return this.accountsService.updateAccount(id, data, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  async deleteAccount(@Param('id') id: string, @Request() req) {
    await this.accountsService.deleteAccount(id, req.user.id);
    return { message: 'Account deleted successfully' };
  }

  @Post('seed-personal')
  @ApiOperation({ summary: 'Seed personal accounts for user' })
  @ApiResponse({ status: 201, description: 'Personal accounts seeded successfully' })
  async seedPersonalAccounts(@Request() req) {
    return this.accountsService.seedPersonalAccounts(req.user.id);
  }
} 