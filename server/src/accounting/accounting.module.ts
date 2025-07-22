import { Module } from '@nestjs/common';
import { InventoryService } from './services/inventory.service';
import { AnalyticsService } from './services/analytics.service';
import { IntegrationService } from './services/integration.service';
import { TaxCalculationService } from './services/tax-calculation.service';
import { BusinessService } from './services/business.service';
import { AccountsService } from './services/accounts.service';
import { JournalEntriesService } from './services/journal-entries.service';
import { ChartOfAccountsService } from './services/chart-of-accounts.service';
import { JournalEntryService } from './services/journal-entry.service';
import { ReportsService } from './services/reports.service';
import { InventoryController } from './controllers/inventory.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { IntegrationController } from './controllers/integration.controller';
import { TaxCalculationController } from './controllers/tax-calculation.controller';
import { BusinessController } from './controllers/business.controller';
import { AccountsController } from './controllers/accounts.controller';
import { JournalEntriesController } from './controllers/journal-entries.controller';
import { ChartOfAccountsController } from './controllers/chart-of-accounts.controller';
import { JournalEntryController } from './controllers/journal-entry.controller';
import { ReportsController } from './controllers/reports.controller';

@Module({
  controllers: [
    InventoryController,
    AnalyticsController,
    IntegrationController,
    TaxCalculationController,
    BusinessController,
    AccountsController,
    JournalEntriesController,
    ChartOfAccountsController,
    JournalEntryController,
    ReportsController,
  ],
  providers: [
    InventoryService,
    AnalyticsService,
    IntegrationService,
    TaxCalculationService,
    BusinessService,
    AccountsService,
    JournalEntriesService,
    ChartOfAccountsService,
    JournalEntryService,
    ReportsService,
  ],
  exports: [
    InventoryService,
    AnalyticsService,
    IntegrationService,
    TaxCalculationService,
    BusinessService,
    AccountsService,
    JournalEntriesService,
    ChartOfAccountsService,
    JournalEntryService,
    ReportsService,
  ],
})
export class AccountingModule {} 