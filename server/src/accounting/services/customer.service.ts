import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateCustomerDto, UpdateCustomerDto, GetCustomersQueryDto } from '../dto/customer';

const prisma = new PrismaClient();

@Injectable()
export class CustomerService {
  async create(createCustomerDto: CreateCustomerDto, userId: string) {
    return prisma.customer.create({
      data: {
        ...createCustomerDto,
        userId,
      },
    });
  }

  async findAll(query: GetCustomersQueryDto, userId: string) {
    const { businessId, isActive = true, search } = query;
    
    const where: any = {
      userId,
      isActive,
    };

    if (businessId) {
      where.businessId = businessId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.customer.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { Invoices: true },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id, userId },
      include: {
        Invoices: {
          orderBy: { issueDate: 'desc' },
          take: 10,
        },
        _count: {
          select: { Invoices: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, userId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id, userId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async remove(id: string, userId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { Invoices: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Soft delete if there are associated invoices
    if (customer._count.Invoices > 0) {
      return prisma.customer.update({
        where: { id },
        data: { isActive: false },
      });
    }

    // Hard delete if no invoices
    return prisma.customer.delete({
      where: { id },
    });
  }

  async getCustomerBalance(customerId: string, userId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, userId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const invoices = await prisma.invoice.findMany({
      where: { customerId },
    });

    const totalOutstanding = invoices.reduce((sum, invoice) => sum + invoice.balanceAmount, 0);
    const totalOverdue = invoices
      .filter(invoice => invoice.dueDate < new Date() && invoice.balanceAmount > 0)
      .reduce((sum, invoice) => sum + invoice.balanceAmount, 0);

    return {
      totalOutstanding,
      totalOverdue,
      invoiceCount: invoices.length,
      overdueCount: invoices.filter(invoice => invoice.dueDate < new Date() && invoice.balanceAmount > 0).length,
    };
  }
} 