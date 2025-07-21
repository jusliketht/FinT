import { Module } from '@nestjs/common';
import { InventoryService } from './services/inventory.service';
import { AnalyticsService } from './services/analytics.service';
import { IntegrationService } from './services/integration.service';
import { TaxCalculationService } from './services/tax-calculation.service';
import { BusinessService } from './services/business.service';
import { AccountsService } from './services/accounts.service';
import { JournalEntriesService } from './services/journal-entries.service';
import { InventoryController } from './controllers/inventory.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { IntegrationController } from './controllers/integration.controller';
import { TaxCalculationController } from './controllers/tax-calculation.controller';
import { BusinessController } from './controllers/business.controller';
import { AccountsController } from './controllers/accounts.controller';
import { JournalEntriesController } from './controllers/journal-entries.controller';

@Module({
  controllers: [
    InventoryController,
    AnalyticsController,
    IntegrationController,
    TaxCalculationController,
    BusinessController,
    AccountsController,
    JournalEntriesController,
  ],
  providers: [
    InventoryService,
    AnalyticsService,
    IntegrationService,
    TaxCalculationService,
    BusinessService,
    AccountsService,
    JournalEntriesService,
  ],
  exports: [
    InventoryService,
    AnalyticsService,
    IntegrationService,
    TaxCalculationService,
    BusinessService,
    AccountsService,
    JournalEntriesService,
  ],
})
export class AccountingModule {} 