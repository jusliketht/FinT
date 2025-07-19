# Detailed Prompt for Cursor: Invoice and Bill Management (Accounts Receivable/Payable)

## Objective
Implement comprehensive invoice and bill management functionality for the FinT accounting application. This system will enable businesses to create, send, and track invoices (accounts receivable) and manage bills from vendors (accounts payable), providing complete financial workflow management.

## Feature Overview

### Invoices (Accounts Receivable)
- Create and customize invoices for customers
- Track invoice status (draft, sent, paid, overdue)
- Generate PDF invoices
- Send invoices via email
- Record payments against invoices
- Aging reports for outstanding receivables

### Bills (Accounts Payable)
- Record bills from vendors/suppliers
- Track bill status (received, approved, paid)
- Schedule bill payments
- Record bill payments
- Vendor management
- Aging reports for outstanding payables

## Database Schema Implementation

### 1. Update Prisma Schema
Add the following models to `server/prisma/schema.prisma`:

```prisma
// Customer model for invoice management
model Customer {
  id            String   @id @default(uuid())
  name          String
  email         String?
  phone         String?
  address       String?
  city          String?
  state         String?
  postalCode    String?
  country       String?
  taxId         String?  // Customer's tax ID/GST number
  creditLimit   Float?   // Credit limit for the customer
  paymentTerms  Int      @default(30) // Payment terms in days
  userId        String
  businessId    String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  User          User     @relation(fields: [userId], references: [id])
  Business      Business? @relation(fields: [businessId], references: [id])
  Invoices      Invoice[]

  @@index([userId])
  @@index([businessId])
  @@index([isActive])
}

// Vendor model for bill management
model Vendor {
  id            String   @id @default(uuid())
  name          String
  email         String?
  phone         String?
  address       String?
  city          String?
  state         String?
  postalCode    String?
  country       String?
  taxId         String?  // Vendor's tax ID/GST number
  paymentTerms  Int      @default(30) // Payment terms in days
  userId        String
  businessId    String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  User          User     @relation(fields: [userId], references: [id])
  Business      Business? @relation(fields: [businessId], references: [id])
  Bills         Bill[]

  @@index([userId])
  @@index([businessId])
  @@index([isActive])
}

// Invoice model
model Invoice {
  id              String   @id @default(uuid())
  invoiceNumber   String   @unique
  customerId      String
  customer        Customer @relation(fields: [customerId], references: [id])
  issueDate       DateTime
  dueDate         DateTime
  status          String   @default("DRAFT") // DRAFT, SENT, PAID, OVERDUE, CANCELLED
  subtotal        Float
  taxAmount       Float    @default(0)
  discountAmount  Float    @default(0)
  totalAmount     Float
  paidAmount      Float    @default(0)
  balanceAmount   Float    // totalAmount - paidAmount
  notes           String?
  terms           String?  // Payment terms and conditions
  userId          String
  businessId      String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  User            User     @relation(fields: [userId], references: [id])
  Business        Business? @relation(fields: [businessId], references: [id])
  InvoiceItems    InvoiceItem[]
  InvoicePayments InvoicePayment[]

  @@index([invoiceNumber])
  @@index([customerId])
  @@index([status])
  @@index([dueDate])
  @@index([userId])
  @@index([businessId])
}

// Invoice Item model
model InvoiceItem {
  id          String  @id @default(uuid())
  invoiceId   String
  invoice     Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  description String
  quantity    Float
  unitPrice   Float
  amount      Float   // quantity * unitPrice
  taxRate     Float   @default(0)
  taxAmount   Float   @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([invoiceId])
}

// Invoice Payment model
model InvoicePayment {
  id            String   @id @default(uuid())
  invoiceId     String
  invoice       Invoice  @relation(fields: [invoiceId], references: [id])
  paymentDate   DateTime
  amount        Float
  paymentMethod String   // CASH, BANK_TRANSFER, CHEQUE, CARD, etc.
  reference     String?  // Payment reference number
  notes         String?
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([invoiceId])
  @@index([paymentDate])
  @@index([userId])
}

// Bill model
model Bill {
  id              String   @id @default(uuid())
  billNumber      String   // Vendor's bill number
  vendorId        String
  vendor          Vendor   @relation(fields: [vendorId], references: [id])
  billDate        DateTime
  dueDate         DateTime
  status          String   @default("RECEIVED") // RECEIVED, APPROVED, PAID, OVERDUE
  subtotal        Float
  taxAmount       Float    @default(0)
  discountAmount  Float    @default(0)
  totalAmount     Float
  paidAmount      Float    @default(0)
  balanceAmount   Float    // totalAmount - paidAmount
  notes           String?
  userId          String
  businessId      String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  User            User     @relation(fields: [userId], references: [id])
  Business        Business? @relation(fields: [businessId], references: [id])
  BillItems       BillItem[]
  BillPayments    BillPayment[]

  @@index([billNumber])
  @@index([vendorId])
  @@index([status])
  @@index([dueDate])
  @@index([userId])
  @@index([businessId])
}

// Bill Item model
model BillItem {
  id          String @id @default(uuid())
  billId      String
  bill        Bill   @relation(fields: [billId], references: [id], onDelete: Cascade)
  description String
  quantity    Float
  unitPrice   Float
  amount      Float  // quantity * unitPrice
  taxRate     Float  @default(0)
  taxAmount   Float  @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([billId])
}

// Bill Payment model
model BillPayment {
  id            String   @id @default(uuid())
  billId        String
  bill          Bill     @relation(fields: [billId], references: [id])
  paymentDate   DateTime
  amount        Float
  paymentMethod String   // CASH, BANK_TRANSFER, CHEQUE, CARD, etc.
  reference     String?  // Payment reference number
  notes         String?
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([billId])
  @@index([paymentDate])
  @@index([userId])
}
```

### 2. Update User Model
Add relations to the User model:

```prisma
model User {
  // ... existing fields
  Customers       Customer[]
  Vendors         Vendor[]
  Invoices        Invoice[]
  Bills           Bill[]
  InvoicePayments InvoicePayment[]
  BillPayments    BillPayment[]
  // ... rest of relations
}
```

### 3. Update Business Model
Add relations to the Business model:

```prisma
model Business {
  // ... existing fields
  Customers       Customer[]
  Vendors         Vendor[]
  Invoices        Invoice[]
  Bills           Bill[]
  // ... rest of relations
}
```

## Backend Implementation

### 1. Customer Service
Create `server/src/accounting/services/customer.service.ts`:

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto, GetCustomersQueryDto } from '../dto/customer';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto, userId: string) {
    return this.prisma.customer.create({
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

    return this.prisma.customer.findMany({
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
    const customer = await this.prisma.customer.findFirst({
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
    const customer = await this.prisma.customer.findFirst({
      where: { id, userId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async remove(id: string, userId: string) {
    const customer = await this.prisma.customer.findFirst({
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
      return this.prisma.customer.update({
        where: { id },
        data: { isActive: false },
      });
    }

    // Hard delete if no invoices
    return this.prisma.customer.delete({
      where: { id },
    });
  }

  async getCustomerBalance(customerId: string, userId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, userId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const invoices = await this.prisma.invoice.findMany({
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
```

### 2. Invoice Service
Create `server/src/accounting/services/invoice.service.ts`:

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto, GetInvoicesQueryDto, RecordPaymentDto } from '../dto/invoice';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async create(createInvoiceDto: CreateInvoiceDto, userId: string) {
    const { items, ...invoiceData } = createInvoiceDto;
    
    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(invoiceData.businessId);
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalAmount = subtotal + taxAmount - (invoiceData.discountAmount || 0);
    
    return this.prisma.invoice.create({
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
        Customer: true,
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

    return this.prisma.invoice.findMany({
      where,
      orderBy: { issueDate: 'desc' },
      include: {
        Customer: true,
        InvoiceItems: true,
        _count: {
          select: { InvoicePayments: true },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, userId },
      include: {
        Customer: true,
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
    const invoice = await this.prisma.invoice.findFirst({
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
      const taxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0);
      const totalAmount = subtotal + taxAmount - (invoiceData.discountAmount || invoice.discountAmount);
      
      return this.prisma.invoice.update({
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
          Customer: true,
        },
      });
    }

    return this.prisma.invoice.update({
      where: { id },
      data: invoiceData,
      include: {
        InvoiceItems: true,
        Customer: true,
      },
    });
  }

  async recordPayment(id: string, recordPaymentDto: RecordPaymentDto, userId: string) {
    const invoice = await this.prisma.invoice.findFirst({
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

    return this.prisma.$transaction([
      this.prisma.invoicePayment.create({
        data: {
          ...recordPaymentDto,
          invoiceId: id,
          userId,
        },
      }),
      this.prisma.invoice.update({
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
    const invoices = await this.prisma.invoice.findMany({
      where: {
        userId,
        businessId,
        balanceAmount: { gt: 0 },
      },
      include: {
        Customer: true,
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
    
    const lastInvoice = await this.prisma.invoice.findFirst({
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
```

### 3. Vendor and Bill Services
Create similar services for `VendorService` and `BillService` following the same patterns as Customer and Invoice services.

### 4. Controllers
Create controllers for each service:
- `CustomerController`
- `InvoiceController`
- `VendorController`
- `BillController`

### 5. DTOs
Create comprehensive DTOs for all entities with proper validation.

## Frontend Implementation

### 1. Customer Management
Create React components:
- `CustomerList.jsx`
- `CustomerForm.jsx`
- `CustomerDetails.jsx`

### 2. Invoice Management
Create React components:
- `InvoiceList.jsx`
- `InvoiceForm.jsx`
- `InvoiceDetails.jsx`
- `InvoicePaymentForm.jsx`
- `InvoicePDF.jsx` (for PDF generation)

### 3. Vendor Management
Create React components:
- `VendorList.jsx`
- `VendorForm.jsx`
- `VendorDetails.jsx`

### 4. Bill Management
Create React components:
- `BillList.jsx`
- `BillForm.jsx`
- `BillDetails.jsx`
- `BillPaymentForm.jsx`

### 5. Reports
Create React components:
- `AccountsReceivableReport.jsx`
- `AccountsPayableReport.jsx`
- `AgingReport.jsx`

## Integration with Accounting System

### 1. Journal Entry Integration
- Automatically create journal entries when invoices are created
- Record journal entries for invoice payments
- Record journal entries for bill payments

### 2. Chart of Accounts Integration
- Link invoices to Accounts Receivable account
- Link bills to Accounts Payable account
- Proper categorization in financial statements

### 3. Financial Statements Integration
- Include A/R and A/P in Balance Sheet
- Include invoice income in P&L Statement
- Include bill expenses in P&L Statement

## Implementation Priority

1. **Phase 1**: Database schema and migrations
2. **Phase 2**: Customer and Vendor management (backend + frontend)
3. **Phase 3**: Invoice management (backend + frontend)
4. **Phase 4**: Bill management (backend + frontend)
5. **Phase 5**: Payment recording and tracking
6. **Phase 6**: Reports and aging analysis
7. **Phase 7**: Integration with journal entries and financial statements

This implementation will provide comprehensive invoice and bill management capabilities, enabling businesses to effectively manage their accounts receivable and accounts payable processes.