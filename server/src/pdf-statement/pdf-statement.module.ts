import { Module } from '@nestjs/common';
import { PdfStatementController } from './pdf-statement.controller';
import { PdfStatementService } from './pdf-statement.service';

@Module({
  controllers: [PdfStatementController],
  providers: [PdfStatementService],
  exports: [PdfStatementService],
})
export class PdfStatementModule {} 