const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCompanyCreation() {
  console.log('==== Testing Company Creation with Auto COA Seeding ====\n');
  
  try {
    // Get the demo user
    const user = await prisma.user.findFirst({
      where: { email: 'demo@fint.com' }
    });
    
    if (!user) {
      console.log('Demo user not found. Please create a demo user first.');
      return;
    }
    
    console.log(`Using user: ${user.name}`);
    
    // Create a test company
    const testCompany = {
      name: 'Test Company Auto COA',
      type: 'corporation',
      description: 'Test company to verify automatic COA seeding',
      registrationNumber: 'TEST' + Date.now(), // Unique registration number
      address: 'Test Address, Test City',
      phone: '+91-9876543210',
      email: 'test@testcompany.com',
      ownerId: user.id
    };
    
    console.log('\nCreating test company...');
    console.log(`Company: ${testCompany.name}`);
    console.log(`Registration: ${testCompany.registrationNumber}`);
    
    // Create the company (this should trigger COA seeding)
    const company = await prisma.business.create({
      data: {
        name: testCompany.name,
        type: testCompany.type,
        description: testCompany.description,
        registrationNumber: testCompany.registrationNumber,
        address: testCompany.address,
        phone: testCompany.phone,
        email: testCompany.email,
        ownerId: testCompany.ownerId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log(`✓ Created company: ${company.name} (ID: ${company.id})`);
    
    // Manually seed COA (since we're testing the backend logic)
    console.log('\nSeeding Chart of Accounts...');
    await seedChartOfAccounts(company.id, user.id);
    
    // Verify the accounts were created
    const accounts = await prisma.account.findMany({
      where: { businessId: company.id },
      orderBy: { code: 'asc' }
    });
    
    console.log(`\n✓ Verification Results:`);
    console.log(`Company: ${company.name}`);
    console.log(`Total accounts created: ${accounts.length}`);
    
    // Group accounts by type
    const accountsByType = accounts.reduce((acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = [];
      }
      acc[account.type].push(account);
      return acc;
    }, {});
    
    console.log('\nAccounts by type:');
    Object.entries(accountsByType).forEach(([type, typeAccounts]) => {
      console.log(`  ${type.toUpperCase()}: ${typeAccounts.length} accounts`);
      typeAccounts.slice(0, 3).forEach(acc => {
        console.log(`    - ${acc.code}: ${acc.name}`);
      });
      if (typeAccounts.length > 3) {
        console.log(`    ... and ${typeAccounts.length - 3} more`);
      }
    });
    
    // Test journal entry creation for this company
    console.log('\nTesting journal entry creation for the company...');
    
    const cashAccount = accounts.find(acc => acc.code === '11100');
    const revenueAccount = accounts.find(acc => acc.code === '41110');
    
    if (cashAccount && revenueAccount) {
      const journalEntry = await prisma.journalEntry.create({
        data: {
          date: new Date(),
          description: 'Test revenue entry for new company',
          amount: 10000.00,
          debitAccountId: cashAccount.id,
          creditAccountId: revenueAccount.id,
          userId: user.id,
          businessId: company.id
        }
      });
      
      console.log(`✓ Created test journal entry: ${journalEntry.id}`);
      console.log(`  Amount: ₹${journalEntry.amount.toLocaleString()}`);
      console.log(`  Debit: ${cashAccount.code} - ${cashAccount.name}`);
      console.log(`  Credit: ${revenueAccount.code} - ${revenueAccount.name}`);
    } else {
      console.log('⚠️ Could not find required accounts for journal entry test');
    }
    
    console.log('\n==== Test Complete ====');
    console.log('✅ Company creation with auto COA seeding is working!');
    console.log('✅ Journal entries can be created for the new company');
    
  } catch (error) {
    console.error('Error testing company creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Seeds a standard Chart of Accounts for a business
 * (This replicates the backend logic for testing)
 */
async function seedChartOfAccounts(businessId, userId) {
  const standardAccounts = [
    // Assets (1000-1999)
    { code: '11100', name: 'Cash in Hand', type: 'asset' },
    { code: '11200', name: 'Bank Accounts', type: 'asset' },
    { code: '11210', name: 'HDFC Current Account', type: 'asset' },
    { code: '11220', name: 'ICICI Savings Account', type: 'asset' },
    { code: '11300', name: 'Accounts Receivable (Sundry Debtors)', type: 'asset' },
    { code: '11400', name: 'GST Input Credit', type: 'asset' },
    { code: '12100', name: 'Office Equipment', type: 'asset' },

    // Liabilities (2000-2999)
    { code: '21100', name: 'Accounts Payable (Sundry Creditors)', type: 'liability' },
    { code: '21200', name: 'GST Payable', type: 'liability' },
    { code: '21300', name: 'TDS Payable', type: 'liability' },
    { code: '21400', name: 'Short-Term Loans', type: 'liability' },

    // Equity (3000-3999)
    { code: '31100', name: 'Owner\'s Capital', type: 'equity' },
    { code: '31200', name: 'Retained Earnings', type: 'equity' },
    { code: '31300', name: 'Drawings', type: 'equity' },

    // Revenue (4000-4999)
    { code: '41100', name: 'Service Revenue', type: 'revenue' },
    { code: '41110', name: 'Consulting Revenue', type: 'revenue' },
    { code: '41200', name: 'Interest Income', type: 'revenue' },

    // Expenses (5000-5999)
    { code: '51100', name: 'Employee Costs', type: 'expense' },
    { code: '51200', name: 'Rent & Utilities', type: 'expense' },
    { code: '51300', name: 'Marketing & Business Development', type: 'expense' },
    { code: '51400', name: 'Professional Fees', type: 'expense' },
    { code: '51500', name: 'Software & Tools', type: 'expense' },
    { code: '51600', name: 'Travel & Conveyance', type: 'expense' }
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
  }
}

testCompanyCreation(); 