import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateInvoiceDto, UpdateInvoiceDto, GetInvoicesQueryDto, RecordPaymentDto } from '../dto/invoice';

const prisma = new PrismaClient();

@Injectable()
export class InvoiceService {
  async create(createInvoiceDto: CreateInvoiceDto, userId: string) {
    const { items, ...invoiceData } = createInvoiceDto;
    
    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(invoiceData.businessId);
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
    const totalAmount = subtotal + taxAmount - (invoiceData.discountAmount || 0);
    
    return prisma.invoice.create({
      data: {
        ...invoiceData,
        invoiceNumber,
        subtotal,
        taxAmount,
        totalAmount,
        balanceAmount: totalAmount,
        userId,
        InvoiceItems: {
          create: items.map(item => ({
            ...item,
            amount: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        InvoiceItems: true,
        customer: true,
      },
    });
  }

  async findAll(query: GetInvoicesQueryDto, userId: string) {
    const { businessId, status, customerId, startDate, endDate } = query;
    
    const where: any = { userId };

    if (businessId) where.businessId = businessId;
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) where.issueDate.gte = startDate;
      if (endDate) where.issueDate.lte = endDate;
    }

    return prisma.invoice.findMany({
      where,
      orderBy: { issueDate: 'desc' },
      include: {
        customer: true,
        InvoiceItems: true,
        _count: {
          select: { InvoicePayments: true },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
      include: {
        customer: true,
        InvoiceItems: true,
        InvoicePayments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto, userId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Cannot update a paid invoice');
    }

    const { items, ...invoiceData } = updateInvoiceDto;
    
    // Recalculate totals if items are provided
    if (items) {
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
      const totalAmount = subtotal + taxAmount - (invoiceData.discountAmount || invoice.discountAmount);
      
      return prisma.invoice.update({
        where: { id },
        data: {
          ...invoiceData,
          subtotal,
          taxAmount,
          totalAmount,
          balanceAmount: totalAmount - invoice.paidAmount,
          InvoiceItems: {
            deleteMany: {},
            create: items.map(item => ({
              ...item,
              amount: item.quantity * item.unitPrice,
            })),
          },
        },
        include: {
          InvoiceItems: true,
          customer: true,
        },
      });
    }

    return prisma.invoice.update({
      where: { id },
      data: invoiceData,
      include: {
        InvoiceItems: true,
        customer: true,
      },
    });
  }

  async recordPayment(id: string, recordPaymentDto: RecordPaymentDto, userId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    if (recordPaymentDto.amount > invoice.balanceAmount) {
      throw new BadRequestException('Payment amount cannot exceed balance amount');
    }

    const newPaidAmount = invoice.paidAmount + recordPaymentDto.amount;
    const newBalanceAmount = invoice.totalAmount - newPaidAmount;
    const newStatus = newBalanceAmount === 0 ? 'PAID' : invoice.status;

    return prisma.$transaction([
      prisma.invoicePayment.create({
        data: {
          ...recordPaymentDto,
          invoiceId: id,
          userId,
        },
      }),
      prisma.invoice.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          balanceAmount: newBalanceAmount,
          status: newStatus,
        },
      }),
    ]);
  }

  async getAgingReport(businessId: string, userId: string) {
    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
        businessId,
        balanceAmount: { gt: 0 },
      },
      include: {
        customer: true,
      },
    });

    const today = new Date();
    const aging = {
      current: 0,      // 0-30 days
      days31to60: 0,   // 31-60 days
      days61to90: 0,   // 61-90 days
      over90: 0,       // Over 90 days
    };

    invoices.forEach(invoice => {
      const daysPastDue = Math.floor((today.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysPastDue <= 30) {
        aging.current += invoice.balanceAmount;
      } else if (daysPastDue <= 60) {
        aging.days31to60 += invoice.balanceAmount;
      } else if (daysPastDue <= 90) {
        aging.days61to90 += invoice.balanceAmount;
      } else {
        aging.over90 += invoice.balanceAmount;
      }
    });

    return {
      aging,
      totalOutstanding: aging.current + aging.days31to60 + aging.days61to90 + aging.over90,
      invoiceCount: invoices.length,
    };
  }

  private async generateInvoiceNumber(businessId?: string): Promise<string> {
    const prefix = 'INV';
    const year = new Date().getFullYear();
    
    const lastInvoice = await prisma.invoice.findFirst({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastNumber = lastInvoice.invoiceNumber;
      const lastSequence = parseInt(lastNumber.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `${prefix}-${year}-${sequence.toString().padStart(4, '0')}`;
  }
} 