import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountsService } from '../services/accounts.service';

@ApiTags('Accounts')
@Controller('accounts')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  async createAccount(@Body() createAccountDto: any) {
    return this.accountsService.createAccount(createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiResponse({ status: 200, description: 'Return all accounts' })
  async getAllAccounts(@Request() req, @Query('businessId') businessId?: string) {
    return this.accountsService.getAccounts(req.user?.id, businessId, true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiResponse({ status: 200, description: 'Return account details' })
  async getAccountById(@Param('id') id: string, @Request() req) {
    return this.accountsService.getAccount(id, req.user?.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update account' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  async updateAccount(@Param('id') id: string, @Body() updateAccountDto: any, @Request() req) {
    return this.accountsService.updateAccount(id, updateAccountDto, req.user?.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  async deleteAccount(@Param('id') id: string, @Request() req) {
    return this.accountsService.deleteAccount(id, req.user?.id);
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
    return this.accountsService.getAccountsByType(req.user?.id, businessId, type);
  }
} 