import { Module } from '@nestjs/common';
import { AccountsController } from './controllers/accounts.controller';
import { JournalEntriesController } from './controllers/journal-entries.controller';
import { ReportsController } from './controllers/reports.controller';
import { ReconciliationController } from './controllers/reconciliation.controller';
import { BusinessController } from './controllers/business.controller';
import { AccountsService } from './services/accounts.service';
import { JournalEntriesService } from './services/journal-entries.service';
import { ReportsService } from './services/reports.service';
import { ReconciliationService } from './services/reconciliation.service';
import { BusinessService } from './services/business.service';
import { AccountCategoriesService } from './services/account-categories.service';
import { AccountHeadsService } from './services/account-heads.service';

@Module({
  controllers: [
    AccountsController,
    JournalEntriesController,
    ReportsController,
    ReconciliationController,
    BusinessController,
  ],
  providers: [
    AccountsService,
    JournalEntriesService,
    ReportsService,
    ReconciliationService,
    BusinessService,
    AccountCategoriesService,
    AccountHeadsService,
  ],
  exports: [
    AccountsService,
    JournalEntriesService,
    ReportsService,
    ReconciliationService,
    BusinessService,
    AccountCategoriesService,
    AccountHeadsService,
  ],
})
export class AccountingModule {} 