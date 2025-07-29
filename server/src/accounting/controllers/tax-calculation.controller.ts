import {
  Controller,
  Post,
  Get,
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
import {
  TaxCalculationService,
  CreateTaxRateDto,
  TaxRate,
  TaxTransaction,
} from '../services/tax-calculation.service';

@ApiTags('Tax Calculation')
@Controller('businesses/:businessId/tax')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TaxCalculationController {
  constructor(private taxCalculationService: TaxCalculationService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate tax' })
  @ApiResponse({ status: 200, description: 'Tax calculated successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async calculateTax(
    @Param('businessId') businessId: string,
    @Request() req,
    @Body() body: { amount: number; taxType: string }
  ) {
    return this.taxCalculationService.calculateTax(body.amount, body.taxType, businessId);
  }

  @Post('rates')
  @ApiOperation({ summary: 'Create tax rate' })
  @ApiResponse({ status: 201, description: 'Tax rate created successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async createTaxRate(
    @Param('businessId') businessId: string,
    @Request() req,
    @Body() data: CreateTaxRateDto
  ): Promise<TaxRate> {
    return this.taxCalculationService.createTaxRate({ ...data, businessId });
  }

  @Put('rates/:id')
  @ApiOperation({ summary: 'Update tax rate' })
  @ApiResponse({ status: 200, description: 'Tax rate updated successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiParam({ name: 'id', description: 'Tax rate ID' })
  async updateTaxRate(
    @Param('businessId') businessId: string,
    @Param('id') id: string,
    @Request() req,
    @Body() data: Partial<CreateTaxRateDto>
  ): Promise<TaxRate> {
    return this.taxCalculationService.updateTaxRate(id, data);
  }

  @Get('rates')
  @ApiOperation({ summary: 'Get tax rates' })
  @ApiResponse({ status: 200, description: 'Tax rates retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async getTaxRates(
    @Param('businessId') businessId: string,
    @Request() req
  ): Promise<TaxRate[]> {
    return this.taxCalculationService.getTaxRates(businessId);
  }

  @Get('rates/:id')
  @ApiOperation({ summary: 'Get tax rate by ID' })
  @ApiResponse({ status: 200, description: 'Tax rate retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiParam({ name: 'id', description: 'Tax rate ID' })
  async getTaxRate(
    @Param('businessId') businessId: string,
    @Param('id') id: string,
    @Request() req
  ): Promise<TaxRate | null> {
    return this.taxCalculationService.getTaxRate(id);
  }

  @Delete('rates/:id')
  @ApiOperation({ summary: 'Delete tax rate' })
  @ApiResponse({ status: 200, description: 'Tax rate deleted successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiParam({ name: 'id', description: 'Tax rate ID' })
  async deleteTaxRate(
    @Param('businessId') businessId: string,
    @Param('id') id: string,
    @Request() req
  ): Promise<void> {
    return this.taxCalculationService.deleteTaxRate(id);
  }

  @Get('report')
  @ApiOperation({ summary: 'Generate tax report' })
  @ApiResponse({ status: 200, description: 'Tax report generated successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'fromDate', required: true, description: 'From date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'toDate', required: true, description: 'To date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'taxType', required: false, description: 'Tax type filter' })
  async generateTaxReport(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('taxType') taxType?: string
  ) {
    return this.taxCalculationService.generateTaxReport(
      businessId,
      new Date(fromDate),
      new Date(toDate),
      taxType
    );
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get tax summary' })
  @ApiResponse({ status: 200, description: 'Tax summary retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'fromDate', required: true, description: 'From date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'toDate', required: true, description: 'To date (YYYY-MM-DD)' })
  async getTaxSummary(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string
  ) {
    return this.taxCalculationService.calculateTaxSummary(
      businessId,
      new Date(fromDate),
      new Date(toDate)
    );
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get tax transactions' })
  @ApiResponse({ status: 200, description: 'Tax transactions retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'fromDate', required: true, description: 'From date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'toDate', required: true, description: 'To date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'taxType', required: false, description: 'Tax type filter' })
  async getTaxTransactions(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('taxType') taxType?: string
  ): Promise<TaxTransaction[]> {
    return this.taxCalculationService.getTaxTransactionsByPeriod(
      businessId,
      new Date(fromDate),
      new Date(toDate),
      taxType
    );
  }
}
