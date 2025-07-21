import { Controller, Get, Query, UseGuards, Request, Param } from '@nestjs/common';
import { LedgerService } from '../services/ledger.service';
import { AccountsService } from '../services/accounts.service';
import { FinancialStatementsService } from '../services/financial-statements.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GetReportQueryDto } from '../dto/get-report-query.dto';

@ApiTags('financial-reports')
@ApiBearerAuth()
@Controller('financial-reports')
@UseGuards(JwtAuthGuard)
export class FinancialReportsController {
  constructor(
    private readonly ledgerService: LedgerService,
    private readonly accountsService: AccountsService,
    private readonly financialStatementsService: FinancialStatementsService,
  ) {}

  @Get('ledger/:accountId')
  @ApiOperation({ summary: 'Get ledger for a specific account' })
  @ApiResponse({ status: 200, description: 'Return account ledger' })
  async getAccountLedger(
    @Param('accountId') accountId: string,
    @Query() query: GetReportQueryDto,
    @Request() req,
  ) {
    const businessId = query.businessId || req.user.activeBusinessId;
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    
    return this.ledgerService.getAccountLedger(accountId, businessId, startDate, endDate);
  }

  @Get('trial-balance')
  @ApiOperation({ summary: 'Get trial balance' })
  @ApiResponse({ status: 200, description: 'Return trial balance' })
  async getTrialBalance(@Query() query: GetReportQueryDto, @Request() req) {
    const businessId = query.businessId || req.user.activeBusinessId;
    const asOfDate = query.asOfDate ? new Date(query.asOfDate) : undefined;
    
    return this.accountsService.getTrialBalance(businessId, req.user.id, asOfDate);
  }

  @Get('profit-and-loss')
  @ApiOperation({ summary: 'Get Profit & Loss Statement' })
  @ApiResponse({ status: 200, description: 'Return Profit & Loss Statement' })
  async getProfitAndLoss(@Query() query: GetReportQueryDto, @Request() req) {
    const businessId = query.businessId || req.user.activeBusinessId;
    const startDate = query.startDate ? new Date(query.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    
    return this.financialStatementsService.getProfitAndLoss(businessId, startDate, endDate);
  }

  @Get('balance-sheet')
  @ApiOperation({ summary: 'Get Balance Sheet' })
  @ApiResponse({ status: 200, description: 'Return Balance Sheet' })
  async getBalanceSheet(@Query() query: GetReportQueryDto, @Request() req) {
    const businessId = query.businessId || req.user.activeBusinessId;
    const asOfDate = query.asOfDate ? new Date(query.asOfDate) : new Date();
    
    return this.financialStatementsService.getBalanceSheet(businessId, asOfDate);
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Get Cash Flow Statement' })
  @ApiResponse({ status: 200, description: 'Return Cash Flow Statement' })
  async getCashFlowStatement(@Query() query: GetReportQueryDto, @Request() req) {
    const businessId = query.businessId || req.user.activeBusinessId;
    const startDate = query.startDate ? new Date(query.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    
    return this.financialStatementsService.getCashFlowStatement(businessId, startDate, endDate);
  }
} 