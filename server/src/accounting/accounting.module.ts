import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Account } from './entities/account.entity';
import { JournalEntry, JournalEntryLine } from './entities/journal-entry.entity';
import { AccountsService } from './services/accounts.service';
import { JournalEntriesService } from './services/journal-entries.service';
import { AccountsController } from './controllers/accounts.controller';
import { JournalEntriesController } from './controllers/journal-entries.controller';
import { ReportsService } from './services/reports.service';
import { ReportsController } from './controllers/reports.controller';
import { AccountingProcessor } from './processors/accounting.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, JournalEntry, JournalEntryLine]),
    BullModule.registerQueue({
      name: 'accounting',
    }),
  ],
  controllers: [
    AccountsController,
    JournalEntriesController,
    ReportsController,
  ],
  providers: [
    AccountsService,
    JournalEntriesService,
    ReportsService,
    AccountingProcessor,
  ],
  exports: [
    AccountsService,
    JournalEntriesService,
    ReportsService,
  ],
})
export class AccountingModule {} 