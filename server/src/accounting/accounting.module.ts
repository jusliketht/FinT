import { Module } from '@nestjs/common';
import { AccountsController } from './controllers/accounts.controller';
import { JournalEntriesController } from './controllers/journal-entries.controller';
import { ReportsController } from './controllers/reports.controller';
import { ReconciliationController } from './controllers/reconciliation.controller';
import { AccountsService } from './services/accounts.service';
import { JournalEntriesService } from './services/journal-entries.service';
import { ReportsService } from './services/reports.service';
import { ReconciliationService } from './services/reconciliation.service';

@Module({
  controllers: [
    AccountsController,
    JournalEntriesController,
    ReportsController,
    ReconciliationController,
  ],
  providers: [
    AccountsService,
    JournalEntriesService,
    ReportsService,
    ReconciliationService,
  ],
  exports: [
    AccountsService,
    JournalEntriesService,
    ReportsService,
    ReconciliationService,
  ],
})
export class AccountingModule {} 