import { Module } from '@nestjs/common';
import { InventoryController } from './controllers/inventory.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { IntegrationController } from './controllers/integration.controller';
import { InventoryService } from './services/inventory.service';
import { AnalyticsService } from './services/analytics.service';
import { IntegrationService } from './services/integration.service';

@Module({
  controllers: [
    InventoryController,
    AnalyticsController,
    IntegrationController,
  ],
  providers: [
    InventoryService,
    AnalyticsService,
    IntegrationService,
  ],
  exports: [
    InventoryService,
    AnalyticsService,
    IntegrationService,
  ],
})
export class AccountingModule {} 