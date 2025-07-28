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
  BadRequestException,
} from '@nestjs/common';
import { InvoicesService } from '../services/invoices.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req: any) {
    const { businessId } = req.user;
    if (!businessId) {
      throw new BadRequestException('Business ID is required');
    }

    return await this.invoicesService.createInvoice(createInvoiceDto, req.user.id, businessId);
  }

  @Get()
  async getAllInvoices(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string
  ) {
    const { businessId } = req.user;
    if (!businessId) {
      throw new BadRequestException('Business ID is required');
    }

    return await this.invoicesService.getAllInvoices(
      businessId,
      parseInt(page) || 1,
      parseInt(limit) || 10,
      status
    );
  }

  @Get('stats')
  async getInvoiceStats(@Request() req: any) {
    const { businessId } = req.user;
    if (!businessId) {
      throw new BadRequestException('Business ID is required');
    }

    return await this.invoicesService.getInvoiceStats(businessId);
  }

  @Get(':id')
  async getInvoiceById(@Param('id') id: string, @Request() req: any) {
    const { businessId } = req.user;
    if (!businessId) {
      throw new BadRequestException('Business ID is required');
    }

    return await this.invoicesService.getInvoiceById(id, businessId);
  }

  @Put(':id/status')
  async updateInvoiceStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req: any
  ) {
    const { businessId } = req.user;
    if (!businessId) {
      throw new BadRequestException('Business ID is required');
    }

    return await this.invoicesService.updateInvoiceStatus(id, status, businessId);
  }

  @Put(':id/mark-paid')
  async markInvoiceAsPaid(
    @Param('id') id: string,
    @Request() req: any,
    @Body('paymentDate') paymentDate?: string
  ) {
    const { businessId } = req.user;
    if (!businessId) {
      throw new BadRequestException('Business ID is required');
    }

    const paymentDateObj = paymentDate ? new Date(paymentDate) : undefined;
    return await this.invoicesService.markInvoiceAsPaid(id, businessId, paymentDateObj);
  }

  @Delete(':id')
  async deleteInvoice(@Param('id') id: string, @Request() req: any) {
    const { businessId } = req.user;
    if (!businessId) {
      throw new BadRequestException('Business ID is required');
    }

    await this.invoicesService.deleteInvoice(id, businessId);
    return { message: 'Invoice deleted successfully' };
  }
}
