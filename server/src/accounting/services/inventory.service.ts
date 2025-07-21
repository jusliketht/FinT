import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class InventoryService {
  async createInventoryItem(data: any): Promise<any> {
    return prisma.inventoryItem.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description,
        category: data.category,
        unitOfMeasure: data.unitOfMeasure || 'EACH',
        costMethod: data.costMethod || 'FIFO',
        reorderLevel: data.reorderLevel || 0,
        reorderQuantity: data.reorderQuantity || 0,
        isActive: data.isActive !== false,
        businessId: data.businessId
      }
    });
  }

  async getInventoryItems(businessId: string): Promise<any[]> {
    return prisma.inventoryItem.findMany({
      where: { businessId, isActive: true },
      include: {
        InventoryLevels: {
          include: {
            Location: true
          }
        }
      }
    });
  }

  async getInventoryItem(id: string): Promise<any> {
    return prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        InventoryLevels: {
          include: {
            Location: true
          }
        },
        InventoryMovements: {
          orderBy: { movementDate: 'desc' },
          take: 10
        }
      }
    });
  }

  async updateInventoryItem(id: string, data: any): Promise<any> {
    return prisma.inventoryItem.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        unitOfMeasure: data.unitOfMeasure,
        costMethod: data.costMethod,
        reorderLevel: data.reorderLevel,
        reorderQuantity: data.reorderQuantity,
        isActive: data.isActive
      }
    });
  }

  async deleteInventoryItem(id: string): Promise<any> {
    return prisma.inventoryItem.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async recordInventoryMovement(data: any): Promise<any> {
    const movement = await prisma.inventoryMovement.create({
      data: {
        inventoryItemId: data.inventoryItemId,
        locationId: data.locationId,
        movementType: data.movementType,
        quantity: data.quantity,
        unitCost: data.unitCost,
        totalValue: data.totalValue,
        referenceId: data.referenceId,
        description: data.description,
        businessId: data.businessId
      }
    });

    // Update inventory level
    await this.updateInventoryLevel(data.inventoryItemId, data.locationId, data.quantity, data.movementType);

    return movement;
  }

  private async updateInventoryLevel(inventoryItemId: string, locationId: string, quantity: number, movementType: string): Promise<void> {
    const existingLevel = await prisma.inventoryLevel.findUnique({
      where: {
        inventoryItemId_locationId: {
          inventoryItemId,
          locationId
        }
      }
    });

    if (existingLevel) {
      const newQuantity = movementType === 'IN' || movementType === 'ADJUSTMENT' 
        ? existingLevel.quantity + quantity
        : existingLevel.quantity - quantity;

      await prisma.inventoryLevel.update({
        where: { id: existingLevel.id },
        data: {
          quantity: Math.max(0, newQuantity),
          lastUpdated: new Date()
        }
      });
    } else if (movementType === 'IN' || movementType === 'ADJUSTMENT') {
      await prisma.inventoryLevel.create({
        data: {
          inventoryItemId,
          locationId,
          quantity: Math.max(0, quantity),
          unitCost: 0,
          totalValue: 0
        }
      });
    }
  }

  async getLowStockItems(businessId: string): Promise<any[]> {
    return prisma.inventoryLevel.findMany({
      where: {
        InventoryItem: {
          businessId,
          isActive: true
        },
        quantity: {
          lte: prisma.inventoryItem.fields.reorderLevel
        }
      },
      include: {
        InventoryItem: true,
        Location: true
      }
    });
  }

  async getInventoryValuation(businessId: string): Promise<any> {
    const levels = await prisma.inventoryLevel.findMany({
      where: {
        InventoryItem: {
          businessId,
          isActive: true
        }
      },
      include: {
        InventoryItem: true
      }
    });

    const totalValue = levels.reduce((sum, level) => sum + level.totalValue, 0);
    const itemCount = levels.length;

    return {
      totalValue,
      itemCount,
      levels
    };
  }

  async createLocation(data: any): Promise<any> {
    return prisma.location.create({
      data: {
        code: data.code,
        name: data.name,
        type: data.type || 'WAREHOUSE',
        address: data.address,
        isActive: data.isActive !== false,
        businessId: data.businessId
      }
    });
  }

  async getLocations(businessId: string): Promise<any[]> {
    return prisma.location.findMany({
      where: { businessId, isActive: true }
    });
  }
} 