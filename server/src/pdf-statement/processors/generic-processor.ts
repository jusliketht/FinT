import { Transaction } from '../pdf-statement.service';

export class GenericProcessor {
  private readonly datePatterns = [
    /(\d{2})\/(\d{2})\/(\d{4})/g, // DD/MM/YYYY
    /(\d{2})-(\w{3})-(\d{4})/g,  // DD-MMM-YYYY
    /(\d{4})-(\d{2})-(\d{2})/g,  // YYYY-MM-DD
  ];
  private readonly amountPattern = /([\d,]+\.\d{2})/g;

  /**
   * Extract transactions from generic bank statement text
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
   * Parse a single transaction line using generic patterns
   */
  private parseTransactionLine(line: string): Transaction | null {
    // Skip empty lines and headers
    if (!line.trim() || this.isHeaderLine(line)) {
      return null;
    }

    try {
      // Try to find a date in the line
      const date = this.extractDate(line);
      if (!date) {
        return null;
      }

      // Try to find an amount in the line
      const amount = this.extractAmount(line);
      if (!amount) {
        return null;
      }

      // Extract description (everything between date and amount)
      const description = this.extractDescription(line, date, amount);

      // Determine transaction type
      const type = this.determineTransactionType(line, amount);

      return {
        date,
        description: this.cleanDescription(description),
        amount: Math.abs(amount),
        type,
        reference: `GEN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract date from line using multiple patterns
   */
  private extractDate(line: string): Date | null {
    for (const pattern of this.datePatterns) {
      const match = line.match(pattern);
      if (match) {
        try {
          if (pattern.source.includes('MMM')) {
            // DD-MMM-YYYY format
            const [, day, month, year] = match;
            return this.parseDateWithMonth(day, month, year);
          } else if (pattern.source.includes('YYYY-MM-DD')) {
            // YYYY-MM-DD format
            const [, year, month, day] = match;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else {
            // DD/MM/YYYY format
            const [, day, month, year] = match;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }
        } catch (error) {
          continue;
        }
      }
    }
    return null;
  }

  /**
   * Parse date with month name
   */
  private parseDateWithMonth(day: string, month: string, year: string): Date {
    const monthMap: { [key: string]: number } = {
      'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
      'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
    };

    const monthIndex = monthMap[month.toLowerCase()];
    if (monthIndex === undefined) {
      throw new Error(`Invalid month: ${month}`);
    }

    return new Date(parseInt(year), monthIndex, parseInt(day));
  }

  /**
   * Extract amount from line
   */
  private extractAmount(line: string): number | null {
    const match = line.match(this.amountPattern);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
    return null;
  }

  /**
   * Extract description from line
   */
  private extractDescription(line: string, date: Date, amount: number): string {
    // Find the date string in the line
    const dateStr = this.findDateString(line, date);
    if (!dateStr) {
      return line.trim();
    }

    // Find the amount string in the line
    const amountStr = amount.toFixed(2);
    
    // Extract text between date and amount
    const dateIndex = line.indexOf(dateStr);
    const amountIndex = line.lastIndexOf(amountStr);
    
    if (dateIndex !== -1 && amountIndex !== -1) {
      const startIndex = dateIndex + dateStr.length;
      const endIndex = amountIndex;
      return line.substring(startIndex, endIndex).trim();
    }

    return line.trim();
  }

  /**
   * Find the date string in the line
   */
  private findDateString(line: string, date: Date): string | null {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    // Try different formats
    const formats = [
      `${day}/${month}/${year}`,
      `${day}-${this.getMonthName(date.getMonth())}-${year}`,
      `${year}-${month}-${day}`,
    ];

    for (const format of formats) {
      if (line.includes(format)) {
        return format;
      }
    }

    return null;
  }

  /**
   * Get month name
   */
  private getMonthName(monthIndex: number): string {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    return months[monthIndex];
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
      'bank',
      'statement',
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
    if (lowerLine.includes('dr') || lowerLine.includes('debit') || lowerLine.includes('withdrawal')) {
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