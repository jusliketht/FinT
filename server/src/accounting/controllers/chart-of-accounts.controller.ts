import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChartOfAccountsService } from '../services/chart-of-accounts.service';

@ApiTags('Chart of Accounts')
@Controller('businesses/:businessId/chart-of-accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChartOfAccountsController {
  constructor(private readonly chartOfAccountsService: ChartOfAccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async createAccount(
    @Param('businessId') businessId: string,
    @Request() req,
    @Body()
    data: {
      code: string;
      name: string;
      type: string;
      description?: string;
    }
  ) {
    return this.chartOfAccountsService.createAccount({
      ...data,
      businessId,
      userId: req.user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get chart of accounts' })
  @ApiResponse({ status: 200, description: 'Chart of accounts retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'includePersonal', required: false, description: 'Include personal accounts' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by account type' })
  async getAccounts(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('includePersonal') includePersonal?: string,
    @Query('type') type?: string
  ) {
    if (type) {
      return this.chartOfAccountsService.getAccountsByType(
        req.user.id,
        businessId,
        type
      );
    }

    return this.chartOfAccountsService.getAccounts(
      req.user.id,
      businessId,
      includePersonal === 'true'
    );
  }

  @Get('types')
  @ApiOperation({ summary: 'Get account types' })
  @ApiResponse({ status: 200, description: 'Account types retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async getAccountTypes(@Param('businessId') businessId: string) {
    return this.chartOfAccountsService.getAccountTypes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiResponse({ status: 200, description: 'Return the account' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  async getAccount(
    @Param('businessId') businessId: string,
    @Param('id') id: string, 
    @Request() req
  ) {
    return this.chartOfAccountsService.getAccount(id, req.user.id);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get account balance' })
  @ApiResponse({ status: 200, description: 'Return account balance' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  async getAccountBalance(
    @Param('businessId') businessId: string,
    @Param('id') id: string, 
    @Request() req
  ) {
    return this.chartOfAccountsService.getAccountBalance(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update account' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  async updateAccount(
    @Param('businessId') businessId: string,
    @Param('id') id: string,
    @Body()
    data: {
      code?: string;
      name?: string;
      type?: string;
      description?: string;
      isActive?: boolean;
    },
    @Request() req
  ) {
    return this.chartOfAccountsService.updateAccount(id, data, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  async deleteAccount(
    @Param('businessId') businessId: string,
    @Param('id') id: string, 
    @Request() req
  ) {
    await this.chartOfAccountsService.deleteAccount(id, req.user.id);
    return { message: 'Account deleted successfully' };
  }
}
