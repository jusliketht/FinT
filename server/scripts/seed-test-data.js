const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...');

    // Create default account types
    const accountTypes = await Promise.all([
      prisma.accountType.upsert({
        where: { value: 'asset' },
        update: {},
        create: {
          value: 'asset',
          label: 'Asset',
          description: 'Resources owned by the business'
        }
      }),
      prisma.accountType.upsert({
        where: { value: 'liability' },
        update: {},
        create: {
          value: 'liability',
          label: 'Liability',
          description: 'Obligations owed by the business'
        }
      }),
      prisma.accountType.upsert({
        where: { value: 'equity' },
        update: {},
        create: {
          value: 'equity',
          label: 'Equity',
          description: 'Owner\'s investment in the business'
        }
      }),
      prisma.accountType.upsert({
        where: { value: 'revenue' },
        update: {},
        create: {
          value: 'revenue',
          label: 'Revenue',
          description: 'Income earned by the business'
        }
      }),
      prisma.accountType.upsert({
        where: { value: 'expense' },
        update: {},
        create: {
          value: 'expense',
          label: 'Expense',
          description: 'Costs incurred by the business'
        }
      })
    ]);

    console.log('✅ Account types created');

    // Hash the password properly
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create a test user
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        password: hashedPassword // Update the password with proper hash
      },
      create: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User'
      }
    });

    console.log('✅ Test user created');

    // Create a test business
    const business = await prisma.business.create({
      data: {
        name: 'Test Business',
        type: 'Sole Proprietorship',
        description: 'A test business for development',
        ownerId: user.id
      }
    });

    console.log('✅ Test business created');

    // Create test accounts
    const accounts = await Promise.all([
      prisma.account.create({
        data: {
          code: '1000',
          name: 'Cash',
          type: 'asset',
          description: 'Cash on hand',
          businessId: business.id
        }
      }),
      prisma.account.create({
        data: {
          code: '2000',
          name: 'Accounts Receivable',
          type: 'asset',
          description: 'Money owed by customers',
          businessId: business.id
        }
      }),
      prisma.account.create({
        data: {
          code: '3000',
          name: 'Accounts Payable',
          type: 'liability',
          description: 'Money owed to suppliers',
          businessId: business.id
        }
      }),
      prisma.account.create({
        data: {
          code: '4000',
          name: 'Sales Revenue',
          type: 'revenue',
          description: 'Revenue from sales',
          businessId: business.id
        }
      }),
      prisma.account.create({
        data: {
          code: '5000',
          name: 'Office Expenses',
          type: 'expense',
          description: 'Office-related expenses',
          businessId: business.id
        }
      })
    ]);

    console.log('✅ Test accounts created');

    // Create test journal entries
    const journalEntries = await Promise.all([
      // Revenue entry
      prisma.journalEntry.create({
        data: {
          date: new Date(),
          description: 'Sales revenue',
          status: 'POSTED',
          userId: user.id,
          businessId: business.id,
          Lines: {
            create: [
              {
                accountId: accounts[0].id, // Cash
                description: 'Cash received from sales',
                debit: 10000,
                credit: 0
              },
              {
                accountId: accounts[3].id, // Sales Revenue
                description: 'Revenue from sales',
                debit: 0,
                credit: 10000
              }
            ]
          }
        }
      }),
      // Expense entry
      prisma.journalEntry.create({
        data: {
          date: new Date(),
          description: 'Office expenses',
          status: 'POSTED',
          userId: user.id,
          businessId: business.id,
          Lines: {
            create: [
              {
                accountId: accounts[4].id, // Office Expenses
                description: 'Office supplies',
                debit: 2000,
                credit: 0
              },
              {
                accountId: accounts[0].id, // Cash
                description: 'Cash paid for expenses',
                debit: 0,
                credit: 2000
              }
            ]
          }
        }
      })
    ]);

    console.log('✅ Test journal entries created');

    console.log('🎉 Test data seeding completed successfully!');
    console.log(`User ID: ${user.id}`);
    console.log(`Business ID: ${business.id}`);

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData(); 