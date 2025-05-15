import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  async generateReport() {
    return { report: 'dummy-report' };
  }
} 