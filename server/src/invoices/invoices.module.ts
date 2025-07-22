import { Module } from '@nestjs/common';
import { InvoicesController } from './controllers/invoices.controller';
import { BillsController } from './controllers/bills.controller';
import { InvoicesService } from './services/invoices.service';
import { BillsService } from './services/bills.service';

@Module({
  controllers: [InvoicesController, BillsController],
  providers: [InvoicesService, BillsService],
  exports: [InvoicesService, BillsService],
})
export class InvoicesModule {} 