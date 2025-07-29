import { Controller, Post, Get, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InventoryService } from '../services/inventory.service';

@ApiTags('Inventory')
@Controller('businesses/:businessId/inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Post('item')
  @ApiOperation({ summary: 'Create inventory item' })
  @ApiResponse({ status: 201, description: 'Inventory item created successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async createInventoryItem(
    @Param('businessId') businessId: string,
    @Request() req,
    @Body() data: any
  ) {
    return this.inventoryService.createInventoryItem({ ...data, businessId });
  }

  @Post('movement')
  @ApiOperation({ summary: 'Record inventory movement' })
  @ApiResponse({ status: 201, description: 'Inventory movement recorded successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async recordInventoryMovement(
    @Param('businessId') businessId: string,
    @Request() req,
    @Body() data: any
  ) {
    return this.inventoryService.recordInventoryMovement({ ...data, businessId });
  }

  @Get('valuation')
  @ApiOperation({ summary: 'Get inventory valuation' })
  @ApiResponse({ status: 200, description: 'Inventory valuation retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async getInventoryValuation(
    @Param('businessId') businessId: string,
    @Request() req
  ) {
    return this.inventoryService.getInventoryValuation(businessId);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock items' })
  @ApiResponse({ status: 200, description: 'Low stock items retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async getLowStockItems(
    @Param('businessId') businessId: string,
    @Request() req
  ) {
    return this.inventoryService.getLowStockItems(businessId);
  }

  @Get('items')
  @ApiOperation({ summary: 'Get inventory items' })
  @ApiResponse({ status: 200, description: 'Inventory items retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async getInventoryItems(
    @Param('businessId') businessId: string,
    @Request() req
  ) {
    return this.inventoryService.getInventoryItems(businessId);
  }

  @Get('locations')
  @ApiOperation({ summary: 'Get inventory locations' })
  @ApiResponse({ status: 200, description: 'Inventory locations retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async getLocations(
    @Param('businessId') businessId: string,
    @Request() req
  ) {
    return this.inventoryService.getLocations(businessId);
  }
}
