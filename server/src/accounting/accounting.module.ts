import { Module } from '@nestjs/common';
import { InventoryService } from './services/inventory.service';
import { AnalyticsService } from './services/analytics.service';
import { IntegrationService } from './services/integration.service';
import { TaxCalculationService } from './services/tax-calculation.service';
import { InventoryController } from './controllers/inventory.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { IntegrationController } from './controllers/integration.controller';
import { TaxCalculationController } from './controllers/tax-calculation.controller';

@Module({
  controllers: [
    InventoryController,
    AnalyticsController,
    IntegrationController,
    TaxCalculationController,
  ],
  providers: [
    InventoryService,
    AnalyticsService,
    IntegrationService,
    TaxCalculationService,
  ],
  exports: [
    InventoryService,
    AnalyticsService,
    IntegrationService,
    TaxCalculationService,
  ],
})
export class AccountingModule {} 