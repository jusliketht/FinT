import { Injectable } from '@nestjs/common';
import { PrismaClient, InventoryItem, InventoryMovement } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class InventoryService {
  async createInventoryItem(data: any): Promise<InventoryItem> {
    const item = await prisma.inventoryItem.create({
      data: {
        ...data,
        sku: data.sku || await this.generateSKU(data.businessId)
      }
    });
    await prisma.inventoryLevel.create({
      data: {
        itemId: item.id,
        quantityOnHand: 0,
        quantityAvailable: 0,
        averageCost: 0,
        totalValue: 0
      }
    });
    return item;
  }

  async recordInventoryMovement(data: any): Promise<InventoryMovement> {
    const movement = await prisma.inventoryMovement.create({ data });
    await this.updateInventoryLevels(movement);
    // Journal entries would be created here (requires JournalEntryService)
    return movement;
  }

  private async updateInventoryLevels(movement: InventoryMovement): Promise<void> {
    const currentLevel = await prisma.inventoryLevel.findUnique({
      where: {
        itemId_locationId: {
          itemId: movement.itemId,
          locationId: movement.locationId
        }
      }
    });
    if (!currentLevel) throw new Error('Inventory level not found');
    let newQuantity = currentLevel.quantityOnHand;
    let newValue = currentLevel.totalValue;
    let newAverageCost = currentLevel.averageCost;
    if (movement.movementType === 'IN') {
      newQuantity += movement.quantity;
      if (movement.unitCost) {
        const totalCost = newValue + (movement.quantity * movement.unitCost);
        newAverageCost = newQuantity > 0 ? totalCost / newQuantity : 0;
        newValue = totalCost;
      }
    } else if (movement.movementType === 'OUT') {
      if (newQuantity < movement.quantity) throw new Error('Insufficient inventory quantity');
      newQuantity -= movement.quantity;
      newValue = newQuantity * newAverageCost;
    }
    await prisma.inventoryLevel.update({
      where: {
        itemId_locationId: {
          itemId: movement.itemId,
          locationId: movement.locationId
        }
      },
      data: {
        quantityOnHand: newQuantity,
        quantityAvailable: newQuantity - currentLevel.quantityReserved,
        averageCost: newAverageCost,
        totalValue: newValue,
        lastUpdated: new Date()
      }
    });
  }

  async getInventoryValuation(businessId: string, asOfDate?: Date): Promise<any[]> {
    const whereClause = asOfDate ?
      { businessId, createdAt: { lte: asOfDate } } :
      { businessId };
    const items = await prisma.inventoryItem.findMany({
      where: whereClause,
      include: { InventoryLevels: true }
    });
    return items.map(item => ({
      itemId: item.id,
      sku: item.sku,
      name: item.name,
      quantityOnHand: item.InventoryLevels.reduce((sum, level) => sum + level.quantityOnHand, 0),
      averageCost: item.InventoryLevels[0]?.averageCost || 0,
      totalValue: item.InventoryLevels.reduce((sum, level) => sum + level.totalValue, 0)
    }));
  }

  async generateLowStockReport(businessId: string): Promise<any[]> {
    return prisma.inventoryItem.findMany({
      where: {
        businessId,
        isActive: true,
        InventoryLevels: {
          some: {
            quantityAvailable: {
              lte: prisma.inventoryItem.fields.reorderLevel
            }
          }
        }
      },
      include: { InventoryLevels: true }
    });
  }

  private async generateSKU(businessId: string): Promise<string> {
    const count = await prisma.inventoryItem.count({ where: { businessId } });
    return `SKU${(count + 1).toString().padStart(6, '0')}`;
  }
} 