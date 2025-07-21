import { Controller, Get } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get()
  async getReport() {
    return this.reportsService.generateReport();
  }
} 