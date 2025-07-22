import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient, JournalEntry, JournalEntryLine } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  async createInvoice(createInvoiceDto: any, userId: string, businessId: string): Promise<any> {
    const { items, ...invoiceData } = createInvoiceDto;

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;

    items.forEach(item => {
      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;
      taxAmount += itemTotal * (item.taxRate || 0) / 100;
    });

    const totalAmount = subtotal + taxAmount;

    // Generate invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      where: { businessId },
      orderBy: { invoiceNumber: 'desc' },
    });

    const invoiceNumber = lastInvoice 
      ? `INV-${businessId.slice(0, 8)}-${String(parseInt(lastInvoice.invoiceNumber.split('-')[2]) + 1).padStart(6, '0')}`
      : `INV-${businessId.slice(0, 8)}-000001`;

    try {
      const invoice = await prisma.invoice.create({
        data: {
          ...invoiceData,
          invoiceNumber,
          subtotal,
          taxAmount,
          totalAmount,
          businessId,
          userId,
          issueDate: new Date(),
          dueDate: new Date(invoiceData.dueDate),
        },
        include: {
          InvoiceItems: true,
        },
      });

      // Create invoice items
      for (const item of items) {
        const itemTotal = item.quantity * item.unitPrice;
        const itemTaxAmount = itemTotal * (item.taxRate || 0) / 100;

        await prisma.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: itemTotal,
            taxRate: item.taxRate || 0,
            taxAmount: itemTaxAmount,
          },
        });
      }

      return invoice;
    } catch (error) {
      this.logger.error(`Error creating invoice: ${error.message}`);
      throw new BadRequestException('Failed to create invoice');
    }
  }

  async getAllInvoices(businessId: string, page = 1, limit = 10, status?: string): Promise<any> {
    const skip = (page - 1) * limit;
    
    const where: any = { businessId };
    if (status) {
      where.status = status;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          InvoiceItems: true,
          User: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getInvoiceById(id: string, businessId: string): Promise<any> {
    const invoice = await prisma.invoice.findFirst({
      where: { id, businessId },
      include: {
        InvoiceItems: true,
        User: {
          select: { name: true, email: true },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async updateInvoiceStatus(id: string, status: string, businessId: string): Promise<any> {
    const invoice = await this.getInvoiceById(id, businessId);

    if (!['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'VOID'].includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    return await prisma.invoice.update({
      where: { id },
      data: { status },
      include: {
        InvoiceItems: true,
      },
    });
  }

  async markInvoiceAsPaid(id: string, businessId: string, paymentDate?: Date): Promise<any> {
    const invoice = await this.getInvoiceById(id, businessId);

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Invoice is already paid');
    }

    // Create journal entry for payment
    const journalEntry = await this.createPaymentJournalEntry(invoice, paymentDate);

    // Update invoice status
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { 
        status: 'PAID',
        updatedAt: new Date(),
      },
      include: {
        InvoiceItems: true,
      },
    });

    return {
      invoice: updatedInvoice,
      journalEntry,
    };
  }

  async deleteInvoice(id: string, businessId: string): Promise<void> {
    const invoice = await this.getInvoiceById(id, businessId);

    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException('Only draft invoices can be deleted');
    }

    await prisma.invoice.delete({
      where: { id },
    });
  }

  async getInvoiceStats(businessId: string): Promise<any> {
    const [
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      draftInvoices,
      totalAmount,
      paidAmount,
      overdueAmount,
    ] = await Promise.all([
      prisma.invoice.count({ where: { businessId } }),
      prisma.invoice.count({ where: { businessId, status: 'PAID' } }),
      prisma.invoice.count({ where: { businessId, status: 'OVERDUE' } }),
      prisma.invoice.count({ where: { businessId, status: 'DRAFT' } }),
      prisma.invoice.aggregate({
        where: { businessId },
        _sum: { totalAmount: true },
      }),
      prisma.invoice.aggregate({
        where: { businessId, status: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prisma.invoice.aggregate({
        where: { businessId, status: 'OVERDUE' },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      draftInvoices,
      totalAmount: totalAmount._sum.totalAmount || 0,
      paidAmount: paidAmount._sum.totalAmount || 0,
      overdueAmount: overdueAmount._sum.totalAmount || 0,
      collectionRate: totalAmount._sum.totalAmount 
        ? (paidAmount._sum.totalAmount || 0) / totalAmount._sum.totalAmount * 100 
        : 0,
    };
  }

  private async createPaymentJournalEntry(invoice: any, paymentDate?: Date): Promise<JournalEntry> {
    // Get accounts for journal entry
    const accounts = await prisma.account.findMany({
      where: { businessId: invoice.businessId },
    });

    const accountsReceivable = accounts.find(a => a.type === 'asset' && a.name.toLowerCase().includes('receivable'));
    const cashAccount = accounts.find(a => a.type === 'asset' && a.name.toLowerCase().includes('cash'));
    const salesAccount = accounts.find(a => a.type === 'revenue' && a.name.toLowerCase().includes('sales'));

    if (!accountsReceivable || !cashAccount || !salesAccount) {
      throw new BadRequestException('Required accounts not found. Please set up Chart of Accounts.');
    }

    // Create journal entry
    const journalEntry = await prisma.journalEntry.create({
      data: {
        date: paymentDate || new Date(),
        description: `Payment received for invoice ${invoice.invoiceNumber}`,
        referenceNumber: `PAY-${invoice.invoiceNumber}`,
        status: 'POSTED',
        userId: invoice.userId,
        businessId: invoice.businessId,
        invoiceId: invoice.id,
      },
    });

    // Create journal entry lines
    await Promise.all([
      // Debit Cash
      prisma.journalEntryLine.create({
        data: {
          journalEntryId: journalEntry.id,
          accountId: cashAccount.id,
          description: `Payment received from ${invoice.customerName}`,
          debit: invoice.totalAmount,
          credit: 0,
        },
      }),
      // Credit Accounts Receivable
      prisma.journalEntryLine.create({
        data: {
          journalEntryId: journalEntry.id,
          accountId: accountsReceivable.id,
          description: `Payment for invoice ${invoice.invoiceNumber}`,
          debit: 0,
          credit: invoice.totalAmount,
        },
      }),
    ]);

    return journalEntry;
  }
} 