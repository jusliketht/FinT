import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AccountingModule } from './accounting/accounting.module';
import { ReconciliationModule } from './reconciliation/reconciliation.module';
import { PdfStatementModule } from './pdf-statement/pdf-statement.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    TransactionsModule,
    AccountingModule,
    ReconciliationModule,
    PdfStatementModule,
    InvoicesModule,
  ],
})
export class AppModule {} 