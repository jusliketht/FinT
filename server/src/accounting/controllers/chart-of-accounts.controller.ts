import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ChartOfAccountsService } from '../services/chart-of-accounts.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('chart-of-accounts')
@UseGuards(JwtAuthGuard)
export class ChartOfAccountsController {
  constructor(private readonly chartOfAccountsService: ChartOfAccountsService) {}

  @Post()
  async createAccount(
    @Request() req,
    @Body() data: {
      code: string;
      name: string;
      type: string;
      description?: string;
      parentAccountId?: string;
      businessId?: string;
    }
  ) {
    return this.chartOfAccountsService.createAccount({
      ...data,
      userId: req.user.id,
      businessId: data.businessId || req.user.businessId,
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
        req.user.id,
        businessId || req.user.businessId,
        type
      );
    }

    return this.chartOfAccountsService.getAccounts(
      req.user.id,
      businessId || req.user.businessId,
      includePersonal === 'true'
    );
  }

  @Get('types')
  async getAccountTypes() {
    return this.chartOfAccountsService.getAccountTypes();
  }

  @Get(':id')
  async getAccount(
    @Request() req,
    @Param('id') id: string,
    @Query('businessId') businessId?: string
  ) {
    return this.chartOfAccountsService.getAccount(
      id,
      req.user.id,
      businessId || req.user.businessId
    );
  }

  @Get(':id/balance')
  async getAccountBalance(
    @Request() req,
    @Param('id') id: string,
    @Query('businessId') businessId?: string,
    @Query('asOfDate') asOfDate?: string
  ) {
    const date = asOfDate ? new Date(asOfDate) : undefined;
    return this.chartOfAccountsService.getAccountBalance(
      id,
      req.user.id,
      businessId || req.user.businessId,
      date
    );
  }

  @Put(':id')
  async updateAccount(
    @Request() req,
    @Param('id') id: string,
    @Body() data: {
      code?: string;
      name?: string;
      type?: string;
      description?: string;
      parentAccountId?: string;
      isActive?: boolean;
      businessId?: string;
    }
  ) {
    return this.chartOfAccountsService.updateAccount(
      id,
      data,
      req.user.id,
      data.businessId || req.user.businessId
    );
  }

  @Delete(':id')
  async deleteAccount(
    @Request() req,
    @Param('id') id: string,
    @Query('businessId') businessId?: string
  ) {
    return this.chartOfAccountsService.deleteAccount(
      id,
      req.user.id,
      businessId || req.user.businessId
    );
  }

  @Post('seed')
  async seedStandardAccounts(
    @Request() req,
    @Body() data: { businessId?: string }
  ) {
    return this.chartOfAccountsService.seedStandardAccounts(
      req.user.id,
      data.businessId || req.user.businessId
    );
  }
} 