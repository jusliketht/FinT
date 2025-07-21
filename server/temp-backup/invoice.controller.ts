import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { InvoiceService } from '../services/invoice.service';
import { CreateInvoiceDto, UpdateInvoiceDto, GetInvoicesQueryDto, RecordPaymentDto } from '../dto/invoice';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
    return this.invoiceService.create(createInvoiceDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({ status: 200, description: 'Return all invoices' })
  findAll(@Query() query: GetInvoicesQueryDto, @Request() req) {
    return this.invoiceService.findAll(query, req.user.id);
  }

  @Get('aging-report')
  @ApiOperation({ summary: 'Get accounts receivable aging report' })
  @ApiResponse({ status: 200, description: 'Return aging report' })
  getAgingReport(@Query('businessId') businessId: string, @Request() req) {
    return this.invoiceService.getAgingReport(businessId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invoice by id' })
  @ApiResponse({ status: 200, description: 'Return the invoice' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.invoiceService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @Request() req,
  ) {
    return this.invoiceService.update(id, updateInvoiceDto, req.user.id);
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Record a payment for an invoice' })
  @ApiResponse({ status: 201, description: 'Payment recorded successfully' })
  recordPayment(
    @Param('id') id: string,
    @Body() recordPaymentDto: RecordPaymentDto,
    @Request() req,
  ) {
    return this.invoiceService.recordPayment(id, recordPaymentDto, req.user.id);
  }
} 