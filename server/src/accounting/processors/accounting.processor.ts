import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('accounting')
export class AccountingProcessor {
  @Process('process-transaction')
  async handleTransaction(job: Job) {
    // Process accounting transactions
    console.log('Processing transaction:', job.data);
  }
} 