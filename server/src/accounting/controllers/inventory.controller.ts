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
  async getInventoryValuation(@Query('businessId') businessId: string) {
    return this.inventoryService.getInventoryValuation(businessId);
  }

  @Get('low-stock')
  async getLowStockItems(@Query('businessId') businessId: string) {
    return this.inventoryService.getLowStockItems(businessId);
  }

  @Get('items')
  async getInventoryItems(@Query('businessId') businessId: string) {
    return this.inventoryService.getInventoryItems(businessId);
  }

  @Get('locations')
  async getLocations(@Query('businessId') businessId: string) {
    return this.inventoryService.getLocations(businessId);
  }
} 