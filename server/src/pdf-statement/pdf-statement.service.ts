import { Injectable, Logger } from '@nestjs/common';
import { createWorker } from 'tesseract.js';
import * as pdf from 'pdf-parse';
import { HdfcProcessor } from './processors/hdfc-processor';
import { IciciProcessor } from './processors/icici-processor';
import { SbiProcessor } from './processors/sbi-processor';
import { GenericProcessor } from './processors/generic-processor';

export interface Transaction {
  date: Date;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  reference?: string;
}

export interface ProcessingResult {
  success: boolean;
  transactions: Transaction[];
  journalEntries: any[];
  summary: {
    totalTransactions: number;
    totalJournalEntries: number;
    totalAmount: number;
  };
  errors?: string[];
}

@Injectable()
export class PdfStatementService {
  private readonly logger = new Logger(PdfStatementService.name);
  private readonly processors = {
    hdfc: new HdfcProcessor(),
    icici: new IciciProcessor(),
    sbi: new SbiProcessor(),
    generic: new GenericProcessor(),
  };

  /**
   * Extract text from PDF file using OCR if needed
   */
  async extractTextFromPdf(buffer: Buffer, password?: string): Promise<string> {
    try {
      this.logger.log(`Extracting text from PDF with password: ${password ? 'Provided' : 'Not provided'}`);
      
      // First try to extract text directly from PDF
      const pdfData = await pdf(buffer, {
        password: password || undefined,
      });
      
      if (pdfData.text && pdfData.text.trim().length > 0) {
        this.logger.log('Text extracted directly from PDF');
        return pdfData.text;
      }

      // If no text found, use OCR
      this.logger.log('No text found in PDF, using OCR...');
      return await this.extractTextWithOCR(buffer);
    } catch (error) {
      this.logger.error('Error extracting text from PDF:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  /**
   * Extract text using Tesseract OCR
   */
  private async extractTextWithOCR(buffer: Buffer): Promise<string> {
    const worker = await createWorker();
    
    try {
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(buffer);
      return text;
    } finally {
      await worker.terminate();
    }
  }

  /**
   * Process bank statement and extract transactions
   */
  async processBankStatement(
    file: any, // Express.Multer.File type
    bankType: string,
    password?: string
  ): Promise<ProcessingResult> {
    try {
      this.logger.log(`Processing ${bankType} bank statement: ${file.originalname}`);
      this.logger.log(`Password provided: ${password ? 'Yes' : 'No'}`);
      if (password) {
        this.logger.log(`Password length: ${password.length}`);
      }

      // Extract text from PDF
      const text = await this.extractTextFromPdf(file.buffer, password);
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from the PDF');
      }

      // Get appropriate processor
      const processor = this.processors[bankType] || this.processors.generic;
      
      // Extract transactions
      const transactions = await processor.extractTransactions(text);
      
      if (transactions.length === 0) {
        throw new Error('No transactions found in the statement');
      }

      // Generate journal entries
      const journalEntries = await this.generateJournalEntries(transactions);

      // Calculate summary
      const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        success: true,
        transactions,
        journalEntries,
        summary: {
          totalTransactions: transactions.length,
          totalJournalEntries: journalEntries.length,
          totalAmount,
        },
      };
    } catch (error) {
      this.logger.error('Error processing bank statement:', error);
      return {
        success: false,
        transactions: [],
        journalEntries: [],
        summary: {
          totalTransactions: 0,
          totalJournalEntries: 0,
          totalAmount: 0,
        },
        errors: [error.message],
      };
    }
  }

  /**
   * Generate journal entries from transactions
   */
  async generateJournalEntries(transactions: Transaction[]): Promise<any[]> {
    const journalEntries = [];

    for (const transaction of transactions) {
      try {
        const journalEntry = {
          date: transaction.date,
          reference: transaction.reference || `TXN-${Date.now()}`,
          description: transaction.description,
          items: [
            {
              accountId: this.getAccountIdForTransaction(transaction),
              debitAmount: transaction.type === 'debit' ? transaction.amount : 0,
              creditAmount: transaction.type === 'credit' ? transaction.amount : 0,
              description: transaction.description,
            },
            {
              accountId: this.getCashAccountId(),
              debitAmount: transaction.type === 'credit' ? transaction.amount : 0,
              creditAmount: transaction.type === 'debit' ? transaction.amount : 0,
              description: `Bank transaction: ${transaction.description}`,
            },
          ],
        };

        journalEntries.push(journalEntry);
      } catch (error) {
        this.logger.error(`Error generating journal entry for transaction: ${transaction.description}`, error);
      }
    }

    return journalEntries;
  }

  /**
   * Get account ID for transaction (placeholder - needs proper implementation)
   */
  private getAccountIdForTransaction(transaction: Transaction): string {
    // This should be implemented with proper account mapping logic
    // For now, return a placeholder
    return 'default-expense-account-id';
  }

  /**
   * Get cash account ID (placeholder - needs proper implementation)
   */
  private getCashAccountId(): string {
    // This should be implemented with proper account mapping logic
    // For now, return a placeholder
    return 'default-cash-account-id';
  }

  /**
   * Get supported bank types
   */
  getSupportedBanks(): string[] {
    return Object.keys(this.processors);
  }

  /**
   * Validate bank statement file
   */
  validateFile(file: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file type
    if (file.mimetype !== 'application/pdf') {
      errors.push('File must be a PDF document');
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      errors.push('File size must be less than 50MB');
    }

    // Check if file appears to be empty
    if (file.size === 0) {
      errors.push('File appears to be empty');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
} 