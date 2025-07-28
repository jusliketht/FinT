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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  TaxCalculationService,
  CreateTaxRateDto,
  TaxRate,
  TaxTransaction,
} from '../services/tax-calculation.service';

@Controller('tax')
@UseGuards(JwtAuthGuard)
export class TaxCalculationController {
  constructor(private taxCalculationService: TaxCalculationService) {}

  @Post('calculate')
  async calculateTax(@Body() body: { amount: number; taxType: string; businessId?: string }) {
    return this.taxCalculationService.calculateTax(body.amount, body.taxType, body.businessId);
  }

  @Post('rates')
  async createTaxRate(@Body() data: CreateTaxRateDto): Promise<TaxRate> {
    return this.taxCalculationService.createTaxRate(data);
  }

  @Put('rates/:id')
  async updateTaxRate(
    @Param('id') id: string,
    @Body() data: Partial<CreateTaxRateDto>
  ): Promise<TaxRate> {
    return this.taxCalculationService.updateTaxRate(id, data);
  }

  @Get('rates')
  async getTaxRates(@Query('businessId') businessId?: string): Promise<TaxRate[]> {
    return this.taxCalculationService.getTaxRates(businessId);
  }

  @Get('rates/:id')
  async getTaxRate(@Param('id') id: string): Promise<TaxRate | null> {
    return this.taxCalculationService.getTaxRate(id);
  }

  @Delete('rates/:id')
  async deleteTaxRate(@Param('id') id: string): Promise<void> {
    return this.taxCalculationService.deleteTaxRate(id);
  }

  @Get('report')
  async generateTaxReport(
    @Query('businessId') businessId: string,
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
  async getTaxSummary(
    @Query('businessId') businessId: string,
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
  async getTaxTransactions(
    @Query('businessId') businessId: string,
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
