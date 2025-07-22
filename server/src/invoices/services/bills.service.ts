import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient, JournalEntry, JournalEntryLine } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class BillsService {
  private readonly logger = new Logger(BillsService.name);

  async createBill(createBillDto: any, userId: string, businessId: string): Promise<any> {
    const { items, ...billData } = createBillDto;

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;

    items.forEach(item => {
      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;
      taxAmount += itemTotal * (item.taxRate || 0) / 100;
    });

    const totalAmount = subtotal + taxAmount;

    // Generate bill number
    const lastBill = await prisma.bill.findFirst({
      where: { businessId },
      orderBy: { billNumber: 'desc' },
    });

    const billNumber = lastBill 
      ? `BILL-${businessId.slice(0, 8)}-${String(parseInt(lastBill.billNumber.split('-')[2]) + 1).padStart(6, '0')}`
      : `BILL-${businessId.slice(0, 8)}-000001`;

    try {
      const bill = await prisma.bill.create({
        data: {
          ...billData,
          billNumber,
          subtotal,
          taxAmount,
          totalAmount,
          businessId,
          userId,
          issueDate: new Date(),
          dueDate: new Date(billData.dueDate),
        },
        include: {
          BillItems: true,
        },
      });

      // Create bill items
      for (const item of items) {
        const itemTotal = item.quantity * item.unitPrice;
        const itemTaxAmount = itemTotal * (item.taxRate || 0) / 100;

        await prisma.billItem.create({
          data: {
            billId: bill.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: itemTotal,
            taxRate: item.taxRate || 0,
            taxAmount: itemTaxAmount,
          },
        });
      }

      return bill;
    } catch (error) {
      this.logger.error(`Error creating bill: ${error.message}`);
      throw new BadRequestException('Failed to create bill');
    }
  }

  async getAllBills(businessId: string, page = 1, limit = 10, status?: string): Promise<any> {
    const skip = (page - 1) * limit;
    
    const where: any = { businessId };
    if (status) {
      where.status = status;
    }

    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        include: {
          BillItems: true,
          User: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.bill.count({ where }),
    ]);

    return {
      bills,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getBillById(id: string, businessId: string): Promise<any> {
    const bill = await prisma.bill.findFirst({
      where: { id, businessId },
      include: {
        BillItems: true,
        User: {
          select: { name: true, email: true },
        },
      },
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    return bill;
  }

  async updateBillStatus(id: string, status: string, businessId: string): Promise<any> {
    const bill = await this.getBillById(id, businessId);

    if (!['DRAFT', 'RECEIVED', 'PAID', 'OVERDUE', 'VOID'].includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    return await prisma.bill.update({
      where: { id },
      data: { status },
      include: {
        BillItems: true,
      },
    });
  }

  async markBillAsPaid(id: string, businessId: string, paymentDate?: Date): Promise<any> {
    const bill = await this.getBillById(id, businessId);

    if (bill.status === 'PAID') {
      throw new BadRequestException('Bill is already paid');
    }

    // Create journal entry for payment
    const journalEntry = await this.createPaymentJournalEntry(bill, paymentDate);

    // Update bill status
    const updatedBill = await prisma.bill.update({
      where: { id },
      data: { 
        status: 'PAID',
        updatedAt: new Date(),
      },
      include: {
        BillItems: true,
      },
    });

    return {
      bill: updatedBill,
      journalEntry,
    };
  }

  async deleteBill(id: string, businessId: string): Promise<void> {
    const bill = await this.getBillById(id, businessId);

    if (bill.status !== 'DRAFT') {
      throw new BadRequestException('Only draft bills can be deleted');
    }

    await prisma.bill.delete({
      where: { id },
    });
  }

  async getBillStats(businessId: string): Promise<any> {
    const [
      totalBills,
      paidBills,
      overdueBills,
      draftBills,
      totalAmount,
      paidAmount,
      overdueAmount,
    ] = await Promise.all([
      prisma.bill.count({ where: { businessId } }),
      prisma.bill.count({ where: { businessId, status: 'PAID' } }),
      prisma.bill.count({ where: { businessId, status: 'OVERDUE' } }),
      prisma.bill.count({ where: { businessId, status: 'DRAFT' } }),
      prisma.bill.aggregate({
        where: { businessId },
        _sum: { totalAmount: true },
      }),
      prisma.bill.aggregate({
        where: { businessId, status: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prisma.bill.aggregate({
        where: { businessId, status: 'OVERDUE' },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalBills,
      paidBills,
      overdueBills,
      draftBills,
      totalAmount: totalAmount._sum.totalAmount || 0,
      paidAmount: paidAmount._sum.totalAmount || 0,
      overdueAmount: overdueAmount._sum.totalAmount || 0,
      paymentRate: totalAmount._sum.totalAmount 
        ? (paidAmount._sum.totalAmount || 0) / totalAmount._sum.totalAmount * 100 
        : 0,
    };
  }

  private async createPaymentJournalEntry(bill: any, paymentDate?: Date): Promise<JournalEntry> {
    // Get accounts for journal entry
    const accounts = await prisma.account.findMany({
      where: { businessId: bill.businessId },
    });

    const accountsPayable = accounts.find(a => a.type === 'liability' && a.name.toLowerCase().includes('payable'));
    const cashAccount = accounts.find(a => a.type === 'asset' && a.name.toLowerCase().includes('cash'));
    const expenseAccount = accounts.find(a => a.type === 'expense' && a.name.toLowerCase().includes('expense'));

    if (!accountsPayable || !cashAccount || !expenseAccount) {
      throw new BadRequestException('Required accounts not found. Please set up Chart of Accounts.');
    }

    // Create journal entry
    const journalEntry = await prisma.journalEntry.create({
      data: {
        date: paymentDate || new Date(),
        description: `Payment made for bill ${bill.billNumber}`,
        referenceNumber: `PAY-${bill.billNumber}`,
        status: 'POSTED',
        userId: bill.userId,
        businessId: bill.businessId,
        billId: bill.id,
      },
    });

    // Create journal entry lines
    await Promise.all([
      // Debit Accounts Payable
      prisma.journalEntryLine.create({
        data: {
          journalEntryId: journalEntry.id,
          accountId: accountsPayable.id,
          description: `Payment to ${bill.vendorName}`,
          debit: bill.totalAmount,
          credit: 0,
        },
      }),
      // Credit Cash
      prisma.journalEntryLine.create({
        data: {
          journalEntryId: journalEntry.id,
          accountId: cashAccount.id,
          description: `Payment for bill ${bill.billNumber}`,
          debit: 0,
          credit: bill.totalAmount,
        },
      }),
    ]);

    return journalEntry;
  }
} 