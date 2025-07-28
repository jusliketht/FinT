import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChartOfAccountsService } from '../services/chart-of-accounts.service';

@ApiTags('Chart of Accounts')
@Controller('chart-of-accounts')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class ChartOfAccountsController {
  constructor(private readonly chartOfAccountsService: ChartOfAccountsService) {}

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
    return this.chartOfAccountsService.createAccount({
      ...data,
      userId: req.user?.id || 'test-user-id'
    });
  }

  @Get()
  async getAccounts(
    @Request() req,
    @Query('businessId') businessId?: string,
    @Query('includePersonal') includePersonal?: string,
    @Query('type') type?: string
  ) {
    if (type) {
      return this.chartOfAccountsService.getAccountsByType(
        req.user?.id || 'test-user-id',
        businessId || req.user?.businessId,
        type
      );
    }

    return this.chartOfAccountsService.getAccounts(
      req.user?.id || 'test-user-id',
      businessId || req.user?.businessId,
      includePersonal === 'true'
    );
  }

  @Get('types')
  async getAccountTypes() {
    return this.chartOfAccountsService.getAccountTypes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiResponse({ status: 200, description: 'Return the account' })
  async getAccount(@Param('id') id: string, @Request() req) {
    return this.chartOfAccountsService.getAccount(id, req.user?.id || 'test-user-id');
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get account balance' })
  @ApiResponse({ status: 200, description: 'Return account balance' })
  async getAccountBalance(@Param('id') id: string, @Request() req) {
    return this.chartOfAccountsService.getAccountBalance(id, req.user?.id || 'test-user-id');
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
    return this.chartOfAccountsService.updateAccount(id, data, req.user?.id || 'test-user-id');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  async deleteAccount(@Param('id') id: string, @Request() req) {
    await this.chartOfAccountsService.deleteAccount(id, req.user?.id || 'test-user-id');
    return { message: 'Account deleted successfully' };
  }


} 