import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient, Business, UserBusiness } from '@prisma/client';
import { BusinessType } from '../../constants/enums';
import { CreateBusinessDto } from '../dto/business/create-business.dto';
import { UpdateBusinessDto } from '../dto/business/update-business.dto';
import { AddUserToBusinessDto } from '../dto/business/add-user-to-business.dto';

const prisma = new PrismaClient();

@Injectable()
export class BusinessService {
  async create(createBusinessDto: CreateBusinessDto & { ownerId: string }) {
    // Create business and assign owner as ADMIN
    const business = await prisma.business.create({
      data: {
        ...createBusinessDto,
        Users: {
          create: [{
            userId: createBusinessDto.ownerId,
            role: 'ADMIN',
          }],
        },
      },
    });

    // Automatically seed Chart of Accounts for the new business
    await this.seedChartOfAccounts(business.id, createBusinessDto.ownerId);

    return business;
  }

  /**
   * Seeds a standard Chart of Accounts for a new business
   */
  private async seedChartOfAccounts(businessId: string, userId: string) {
    const standardAccounts = [
      // Assets (1000-1999)
      { code: '11100', name: 'Cash in Hand', type: 'asset' },
      { code: '11200', name: 'Bank Accounts', type: 'asset' },
      { code: '11210', name: 'HDFC Current Account', type: 'asset' },
      { code: '11220', name: 'ICICI Savings Account', type: 'asset' },
      { code: '11230', name: 'SBI Current Account', type: 'asset' },
      { code: '11300', name: 'Accounts Receivable (Sundry Debtors)', type: 'asset' },
      { code: '11310', name: 'Customer Receivables', type: 'asset' },
      { code: '11400', name: 'GST Input Credit', type: 'asset' },
      { code: '11410', name: 'CGST Input', type: 'asset' },
      { code: '11420', name: 'SGST Input', type: 'asset' },
      { code: '11430', name: 'IGST Input', type: 'asset' },
      { code: '12100', name: 'Office Equipment', type: 'asset' },
      { code: '12110', name: 'Computers & Laptops', type: 'asset' },
      { code: '12120', name: 'Furniture & Fixtures', type: 'asset' },
      { code: '12200', name: 'Software Licenses', type: 'asset' },
      { code: '12300', name: 'Accumulated Depreciation', type: 'asset' },

      // Liabilities (2000-2999)
      { code: '21100', name: 'Accounts Payable (Sundry Creditors)', type: 'liability' },
      { code: '21110', name: 'Vendor Payments', type: 'liability' },
      { code: '21120', name: 'Supplier Payables', type: 'liability' },
      { code: '21200', name: 'GST Payable', type: 'liability' },
      { code: '21210', name: 'CGST Payable', type: 'liability' },
      { code: '21220', name: 'SGST Payable', type: 'liability' },
      { code: '21230', name: 'IGST Payable', type: 'liability' },
      { code: '21300', name: 'TDS Payable', type: 'liability' },
      { code: '21310', name: 'TDS on Professional Fees', type: 'liability' },
      { code: '21320', name: 'TDS on Rent', type: 'liability' },
      { code: '21400', name: 'Short-Term Loans', type: 'liability' },
      { code: '22100', name: 'Business Loans (Term Loans)', type: 'liability' },
      { code: '22200', name: 'Bank Overdraft', type: 'liability' },

      // Equity (3000-3999)
      { code: '31100', name: 'Owner\'s Capital', type: 'equity' },
      { code: '31200', name: 'Retained Earnings', type: 'equity' },
      { code: '31300', name: 'Drawings', type: 'equity' },
      { code: '31400', name: 'Current Year Earnings', type: 'equity' },

      // Revenue (4000-4999)
      { code: '41100', name: 'Service Revenue', type: 'revenue' },
      { code: '41110', name: 'Consulting Revenue', type: 'revenue' },
      { code: '41120', name: 'Project Revenue', type: 'revenue' },
      { code: '41130', name: 'Product Sales', type: 'revenue' },
      { code: '41200', name: 'Interest Income', type: 'revenue' },
      { code: '41300', name: 'Other Income', type: 'revenue' },
      { code: '41400', name: 'Commission Income', type: 'revenue' },
      { code: '42100', name: 'CGST Collected', type: 'revenue' },
      { code: '42200', name: 'SGST Collected', type: 'revenue' },
      { code: '42300', name: 'IGST Collected', type: 'revenue' },

      // Expenses (5000-5999)
      { code: '51100', name: 'Employee Costs', type: 'expense' },
      { code: '51110', name: 'Salaries & Wages', type: 'expense' },
      { code: '51120', name: 'Employee Benefits', type: 'expense' },
      { code: '51130', name: 'Contract Staff Payments', type: 'expense' },
      { code: '51200', name: 'Rent & Utilities', type: 'expense' },
      { code: '51210', name: 'Office Rent', type: 'expense' },
      { code: '51220', name: 'Electricity & Water', type: 'expense' },
      { code: '51230', name: 'Internet & Phone', type: 'expense' },
      { code: '51300', name: 'Marketing & Business Development', type: 'expense' },
      { code: '51310', name: 'Digital Advertising', type: 'expense' },
      { code: '51320', name: 'Content Creation', type: 'expense' },
      { code: '51330', name: 'Print & Media', type: 'expense' },
      { code: '51400', name: 'Professional Fees', type: 'expense' },
      { code: '51410', name: 'Legal Consultancy Fees', type: 'expense' },
      { code: '51420', name: 'Audit & Accounting Fees', type: 'expense' },
      { code: '51500', name: 'Software & Tools', type: 'expense' },
      { code: '51510', name: 'IT Tools & Licenses', type: 'expense' },
      { code: '51520', name: 'Design Software', type: 'expense' },
      { code: '51600', name: 'Travel & Conveyance', type: 'expense' },
      { code: '51610', name: 'Client Meetings', type: 'expense' },
      { code: '51620', name: 'Local Transport', type: 'expense' },
      { code: '51630', name: 'Outstation Travel', type: 'expense' },
      { code: '52100', name: 'GST Paid on Purchases', type: 'expense' },
      { code: '52200', name: 'TDS Deducted', type: 'expense' },
      { code: '52300', name: 'Compliance Penalties', type: 'expense' },
      { code: '53100', name: 'Bank Charges', type: 'expense' },
      { code: '53200', name: 'Loan Interest', type: 'expense' },
      { code: '54100', name: 'Depreciation on Office Equipment', type: 'expense' },
      { code: '54200', name: 'Depreciation on Software', type: 'expense' },
      { code: '54300', name: 'Depreciation on Furniture', type: 'expense' }
    ];

    // Create accounts for the business
    const accountPromises = standardAccounts.map(account => 
      prisma.account.create({
        data: {
          code: account.code,
          name: account.name,
          type: account.type,
          userId: userId,
          businessId: businessId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    );

    try {
      await Promise.all(accountPromises);
      console.log(`✓ Seeded ${standardAccounts.length} accounts for business ${businessId}`);
    } catch (error) {
      console.error(`Error seeding accounts for business ${businessId}:`, error);
      // Don't throw error to avoid breaking business creation
      // The accounts can be created manually later if needed
    }
  }

  async findAll() {
    return prisma.business.findMany({
      include: { Users: true },
    });
  }

  async findOne(id: string) {
    const business = await prisma.business.findUnique({
      where: { id },
      include: { Users: true },
    });
    if (!business) throw new NotFoundException(`Business with ID ${id} not found`);
    return business;
  }

  async update(id: string, updateBusinessDto: UpdateBusinessDto) {
    const business = await prisma.business.update({
      where: { id },
      data: updateBusinessDto,
    });
    return business;
  }

  async remove(id: string) {
    await prisma.business.delete({ where: { id } });
    return { message: 'Business deleted successfully' };
  }

  async getUserBusinesses(userId: string) {
    // Get businesses where user is assigned
    const userBusinesses = await prisma.userBusiness.findMany({
      where: { userId },
      include: { Business: true },
    });
    return userBusinesses.map(ub => ub.Business);
  }

  async addUser(businessId: string, userId: string, role: string = 'VIEWER') {
    // Only allow if business exists
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException(`Business with ID ${businessId} not found`);
    // Add user to business
    return prisma.userBusiness.create({
      data: {
        businessId,
        userId,
        role,
      },
    });
  }

  async removeUser(businessId: string, userId: string) {
    // Remove user from business
    await prisma.userBusiness.delete({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    });
    return { message: 'User removed from business successfully' };
  }
} 