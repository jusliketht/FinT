import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InventoryService } from '../services/inventory.service';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Post('item')
  async createInventoryItem(@Body() data: any) {
    return this.inventoryService.createInventoryItem(data);
  }

  @Post('movement')
  async recordInventoryMovement(@Body() data: any) {
    return this.inventoryService.recordInventoryMovement(data);
  }

  @Get('valuation')
  async getInventoryValuation(@Query('businessId') businessId: string, @Query('asOfDate') asOfDate?: string) {
    return this.inventoryService.getInventoryValuation(businessId, asOfDate ? new Date(asOfDate) : undefined);
  }

  @Get('low-stock')
  async generateLowStockReport(@Query('businessId') businessId: string) {
    return this.inventoryService.generateLowStockReport(businessId);
  }
} 