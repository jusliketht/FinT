import { Transaction } from '../pdf-statement.service';

export class SbiProcessor {
  private readonly transactionPattern =
    /\d{2}\/\d{2}\/\d{4}\s+([^\s]+(?:\s+[^\s]+)*?)\s+([\d,]+\.\d{2})/g;
  private readonly datePattern = /(\d{2})\/(\d{2})\/(\d{4})/;
  private readonly amountPattern = /([\d,]+\.\d{2})/;

  /**
   * Extract transactions from SBI bank statement text
   */
  async extractTransactions(text: string): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      try {
        const transaction = this.parseTransactionLine(line);
        if (transaction) {
          transactions.push(transaction);
        }
      } catch (error) {
        // Skip lines that can't be parsed
        continue;
      }
    }

    return transactions;
  }

  /**
   * Parse a single transaction line
   */
  private parseTransactionLine(line: string): Transaction | null {
    // Skip empty lines and headers
    if (!line.trim() || this.isHeaderLine(line)) {
      return null;
    }

    // Try to match the transaction pattern
    const match = line.match(this.transactionPattern);
    if (!match) {
      return null;
    }

    try {
      // Extract date
      const dateMatch = line.match(this.datePattern);
      if (!dateMatch) {
        return null;
      }

      const [, day, month, year] = dateMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      // Extract description (everything between date and amount)
      const dateEndIndex =
        line.indexOf(`${day}/${month}/${year}`) + `${day}/${month}/${year}`.length;
      const amountMatch = line.match(this.amountPattern);
      if (!amountMatch) {
        return null;
      }

      const amountStartIndex = line.lastIndexOf(amountMatch[1]);
      const description = line.substring(dateEndIndex, amountStartIndex).trim();

      // Extract amount
      const amount = parseFloat(amountMatch[1].replace(/,/g, ''));

      // Determine transaction type (credit/debit)
      const type = this.determineTransactionType(line, amount);

      return {
        date,
        description: this.cleanDescription(description),
        amount: Math.abs(amount),
        type,
        reference: `SBI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Determine if line is a header
   */
  private isHeaderLine(line: string): boolean {
    const headerKeywords = [
      'date',
      'description',
      'amount',
      'balance',
      'particulars',
      'narration',
      'debit',
      'credit',
      'transaction',
      'details',
      'sbi',
      'state bank',
    ];

    const lowerLine = line.toLowerCase();
    return headerKeywords.some(keyword => lowerLine.includes(keyword));
  }

  /**
   * Determine transaction type (credit/debit)
   */
  private determineTransactionType(line: string, amount: number): 'credit' | 'debit' {
    const lowerLine = line.toLowerCase();

    // Look for credit indicators
    if (lowerLine.includes('cr') || lowerLine.includes('credit') || lowerLine.includes('deposit')) {
      return 'credit';
    }

    // Look for debit indicators
    if (
      lowerLine.includes('dr') ||
      lowerLine.includes('debit') ||
      lowerLine.includes('withdrawal')
    ) {
      return 'debit';
    }

    // Default based on amount position or other heuristics
    return amount > 0 ? 'credit' : 'debit';
  }

  /**
   * Clean and normalize description
   */
  private cleanDescription(description: string): string {
    return description
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s\-\.]/g, '') // Remove special characters except spaces, hyphens, and dots
      .trim();
  }
}
