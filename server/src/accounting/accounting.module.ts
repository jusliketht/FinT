import { Module } from '@nestjs/common';
import { AccountsController } from './controllers/accounts.controller';
import { JournalEntriesController } from './controllers/journal-entries.controller';
import { ReportsController } from './controllers/reports.controller';
import { ReconciliationController } from './controllers/reconciliation.controller';
import { BusinessController } from './controllers/business.controller';
import { FinancialReportsController } from './controllers/financial-reports.controller';
import { AccountsService } from './services/accounts.service';
import { JournalEntriesService } from './services/journal-entries.service';
import { ReportsService } from './services/reports.service';
import { ReconciliationService } from './services/reconciliation.service';
import { BusinessService } from './services/business.service';
import { AccountCategoriesService } from './services/account-categories.service';
import { AccountHeadsService } from './services/account-heads.service';
import { LedgerService } from './services/ledger.service';
import { FinancialStatementsService } from './services/financial-statements.service';

@Module({
  controllers: [
    AccountsController,
    JournalEntriesController,
    ReportsController,
    ReconciliationController,
    BusinessController,
    FinancialReportsController,
  ],
  providers: [
    AccountsService,
    JournalEntriesService,
    ReportsService,
    ReconciliationService,
    BusinessService,
    AccountCategoriesService,
    AccountHeadsService,
    LedgerService,
    FinancialStatementsService,
  ],
  exports: [
    AccountsService,
    JournalEntriesService,
    ReportsService,
    ReconciliationService,
    BusinessService,
    AccountCategoriesService,
    AccountHeadsService,
    LedgerService,
    FinancialStatementsService,
  ],
})
export class AccountingModule {} 