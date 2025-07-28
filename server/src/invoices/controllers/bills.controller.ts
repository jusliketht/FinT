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
import { BillsService } from '../services/bills.service';
import { CreateBillDto } from '../dto/create-bill.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('bills')
@UseGuards(JwtAuthGuard)
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  async createBill(@Body() createBillDto: CreateBillDto, @Request() req: any) {
    const { businessId } = req.user;
    if (!businessId) {
      throw new BadRequestException('Business ID is required');
    }

    return await this.billsService.createBill(createBillDto, req.user.id, businessId);
  }

  @Get()
  async getAllBills(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string
  ) {
    const { businessId } = req.user;
    if (!businessId) {
      throw new BadRequestException('Business ID is required');
    }

    return await this.billsService.getAllBills(
      businessId,
      parseInt(page) || 1,
      parseInt(limit) || 10,
      status
    );
  }

  @Get('stats')
  async getBillStats(@Request() req: any) {
    const { businessId } = req.user;
    if (!businessId) {
      throw new BadRequestException('Business ID is required');
    }

    return await this.billsService.getBillStats(businessId);
  }

  @Get(':id')
  async getBillById(@Param('id') id: string, @Request() req: any) {
    const { businessId } = req.user;
    if (!businessId) {
      throw new BadRequestException('Business ID is required');
    }

    return await this.billsService.getBillById(id, businessId);
  }

  @Put(':id/status')
  async updateBillStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req: any
  ) {
    const { businessId } = req.user;
    if (!businessId) {
      throw new BadRequestException('Business ID is required');
    }

    return await this.billsService.updateBillStatus(id, status, businessId);
  }

  @Put(':id/mark-paid')
  async markBillAsPaid(
    @Param('id') id: string,
    @Request() req: any,
    @Body('paymentDate') paymentDate?: string
  ) {
    const { businessId } = req.user;
    if (!businessId) {
      throw new BadRequestException('Business ID is required');
    }

    const paymentDateObj = paymentDate ? new Date(paymentDate) : undefined;
    return await this.billsService.markBillAsPaid(id, businessId, paymentDateObj);
  }

  @Delete(':id')
  async deleteBill(@Param('id') id: string, @Request() req: any) {
    const { businessId } = req.user;
    if (!businessId) {
      throw new BadRequestException('Business ID is required');
    }

    await this.billsService.deleteBill(id, businessId);
    return { message: 'Bill deleted successfully' };
  }
}
