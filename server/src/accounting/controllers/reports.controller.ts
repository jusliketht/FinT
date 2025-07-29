import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReportsService } from '../services/reports.service';

@ApiTags('Reports')
@Controller('businesses/:businessId/reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('ledger')
  @ApiOperation({ summary: 'Generate account ledger' })
  @ApiResponse({ status: 200, description: 'Ledger report generated successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'accountId', required: true, description: 'Account ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'format', required: false, description: 'Response format (json, pdf, excel)' })
  async generateLedger(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('accountId') accountId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format: string = 'json'
  ) {
    try {
      return await this.reportsService.generateGeneralLedger(
        req.user.id,
        businessId,
        accountId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
        1,
        20
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate ledger report',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('trial-balance')
  @ApiOperation({ summary: 'Generate trial balance' })
  @ApiResponse({ status: 200, description: 'Trial balance generated successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'asOfDate', required: false, description: 'As of date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'format', required: false, description: 'Response format (json, pdf, excel)' })
  async generateTrialBalance(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('asOfDate') asOfDate?: string,
    @Query('format') format: string = 'json'
  ) {
    try {
      return await this.reportsService.generateTrialBalance(
        req.user.id,
        businessId,
        asOfDate ? new Date(asOfDate) : new Date()
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate trial balance',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('balance-sheet')
  @ApiOperation({ summary: 'Generate balance sheet' })
  @ApiResponse({ status: 200, description: 'Balance sheet generated successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'asOfDate', required: false, description: 'As of date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'compareDate', required: false, description: 'Comparison date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'format', required: false, description: 'Response format (json, pdf, excel)' })
  async generateBalanceSheet(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('asOfDate') asOfDate?: string,
    @Query('compareDate') compareDate?: string,
    @Query('format') format: string = 'json'
  ) {
    try {
      return await this.reportsService.generateBalanceSheet(
        req.user.id,
        businessId,
        asOfDate ? new Date(asOfDate) : new Date()
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate balance sheet',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('profit-loss')
  @ApiOperation({ summary: 'Generate profit & loss statement' })
  @ApiResponse({ status: 200, description: 'Profit & loss statement generated successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'compareStartDate', required: false, description: 'Comparison start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'compareEndDate', required: false, description: 'Comparison end date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'format', required: false, description: 'Response format (json, pdf, excel)' })
  async generateProfitLoss(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('compareStartDate') compareStartDate?: string,
    @Query('compareEndDate') compareEndDate?: string,
    @Query('format') format: string = 'json'
  ) {
    try {
      return await this.reportsService.generateProfitAndLoss(
        req.user.id,
        businessId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate profit & loss statement',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Generate cash flow statement' })
  @ApiResponse({ status: 200, description: 'Cash flow statement generated successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'format', required: false, description: 'Response format (json, pdf, excel)' })
  async generateCashFlow(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format: string = 'json'
  ) {
    try {
      return await this.reportsService.generateCashFlow(
        req.user.id,
        businessId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate cash flow statement',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
