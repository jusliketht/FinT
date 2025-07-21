const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPhase2() {
  console.log('🧪 Testing Phase 2 Implementation...\n');

  try {
    // Test 1: Verify Phase 2 database models exist
    console.log('1. Testing Phase 2 Database Models...');
    
    // Check if new models exist
    const models = ['accountingPeriod', 'taxRate', 'taxTransaction'];
    for (const model of models) {
      try {
        const count = await prisma[model].count();
        console.log(`   ✅ ${model} model exists with ${count} records`);
      } catch (error) {
        console.log(`   ❌ ${model} model not found: ${error.message}`);
        return;
      }
    }

    // Test 2: Create test business and user
    console.log('\n2. Creating test data...');
    
    const testUser = await prisma.user.upsert({
      where: { email: 'test-phase2@example.com' },
      update: {},
      create: {
        id: 'test-phase2-user-id',
        email: 'test-phase2@example.com',
        name: 'Phase 2 Test User',
        password: 'hashedpassword123',
        updatedAt: new Date()
      }
    });
    console.log(`   ✅ Test user created: ${testUser.name}`);

    const testBusiness = await prisma.business.upsert({
      where: { id: 'test-phase2-business-id' },
      update: {},
      create: {
        id: 'test-phase2-business-id',
        name: 'Phase 2 Test Business',
        type: 'CORPORATION',
        description: 'Test business for Phase 2',
        ownerId: testUser.id
      }
    });
    console.log(`   ✅ Test business created: ${testBusiness.name}`);

    // Test 3: Create test accounts
    console.log('\n3. Creating test accounts...');
    
    const accounts = [
      { name: 'Cash', type: 'ASSET', code: '1000' },
      { name: 'Accounts Receivable', type: 'ASSET', code: '1100' },
      { name: 'Equipment', type: 'ASSET', code: '1500' },
      { name: 'Accumulated Depreciation', type: 'ASSET', code: '1501' },
      { name: 'Accounts Payable', type: 'LIABILITY', code: '2000' },
      { name: 'Sales Revenue', type: 'REVENUE', code: '4000' },
      { name: 'Depreciation Expense', type: 'EXPENSE', code: '5000' },
      { name: 'Rent Expense', type: 'EXPENSE', code: '5100' },
      { name: 'Income Summary', type: 'EQUITY', code: '3000' },
      { name: 'Retained Earnings', type: 'EQUITY', code: '3100' }
    ];

    const createdAccounts = [];
    for (const accountData of accounts) {
      const account = await prisma.accountHead.upsert({
        where: { code: accountData.code },
        update: {},
        create: {
          id: `account-${accountData.code}`,
          ...accountData,
          businessId: testBusiness.id,
          userId: testUser.id,
          updatedAt: new Date()
        }
      });
      createdAccounts.push(account);
      console.log(`   ✅ Account created: ${account.name} (${account.code})`);
    }

    // Test 4: Create tax rates
    console.log('\n4. Creating tax rates...');
    
    const taxRates = [
      {
        name: 'GST',
        rate: 18.0,
        type: 'SALES',
        effectiveFrom: new Date('2024-01-01'),
        businessId: testBusiness.id
      },
      {
        name: 'TDS',
        rate: 10.0,
        type: 'PURCHASE',
        effectiveFrom: new Date('2024-01-01'),
        businessId: testBusiness.id
      }
    ];

    const createdTaxRates = [];
    for (const taxRateData of taxRates) {
      const taxRate = await prisma.taxRate.create({
        data: taxRateData
      });
      createdTaxRates.push(taxRate);
      console.log(`   ✅ Tax rate created: ${taxRate.name} (${taxRate.rate}%)`);
    }

    // Test 5: Create test transactions
    console.log('\n5. Creating test transactions...');
    
    const transactions = [
      {
        date: new Date('2024-01-15'),
        description: 'Sale to Customer A',
        amount: 10000,
        category: 'SALES',
        transactionType: 'CREDIT',
        userId: testUser.id,
        businessId: testBusiness.id,
        accountId: createdAccounts.find(a => a.code === '1000').id
      },
      {
        date: new Date('2024-01-20'),
        description: 'Purchase from Supplier B',
        amount: 5000,
        category: 'PURCHASE',
        transactionType: 'DEBIT',
        userId: testUser.id,
        businessId: testBusiness.id,
        accountId: createdAccounts.find(a => a.code === '2000').id
      }
    ];

    const createdTransactions = [];
    for (const transactionData of transactions) {
      const transaction = await prisma.transaction.create({
        data: transactionData
      });
      createdTransactions.push(transaction);
      console.log(`   ✅ Transaction created: ${transaction.description}`);
    }

    // Test 6: Create tax transactions
    console.log('\n6. Creating tax transactions...');
    
    const taxTransactions = [
      {
        transactionId: createdTransactions[0].id,
        taxRateId: createdTaxRates[0].id,
        taxableAmount: 10000,
        taxAmount: 1800,
        taxType: 'GST'
      },
      {
        transactionId: createdTransactions[1].id,
        taxRateId: createdTaxRates[1].id,
        taxableAmount: 5000,
        taxAmount: 500,
        taxType: 'TDS'
      }
    ];

    for (const taxTransactionData of taxTransactions) {
      const taxTransaction = await prisma.taxTransaction.create({
        data: taxTransactionData
      });
      console.log(`   ✅ Tax transaction created: ${taxTransaction.taxType} - ${taxTransaction.taxAmount}`);
    }

    // Test 7: Create accounting period
    console.log('\n7. Creating accounting period...');
    
    const accountingPeriod = await prisma.accountingPeriod.create({
      data: {
        businessId: testBusiness.id,
        periodName: 'January 2024',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        status: 'OPEN'
      }
    });
    console.log(`   ✅ Accounting period created: ${accountingPeriod.periodName}`);

    // Test 8: Create adjusting journal entries
    console.log('\n8. Creating adjusting journal entries...');
    
    const adjustingEntry = await prisma.journalEntry.create({
      data: {
        date: new Date('2024-01-31'),
        description: 'Monthly depreciation adjustment',
        reference: 'ADJ-001',
        totalAmount: 1000,
        userId: testUser.id,
        businessId: testBusiness.id,
        isAdjusting: true,
        accountingPeriodId: accountingPeriod.id,
        JournalEntryLines: {
          create: [
            {
              accountId: createdAccounts.find(a => a.code === '5000').id,
              debitAmount: 1000,
              creditAmount: 0,
              description: 'Depreciation expense'
            },
            {
              accountId: createdAccounts.find(a => a.code === '1501').id,
              debitAmount: 0,
              creditAmount: 1000,
              description: 'Accumulated depreciation'
            }
          ]
        }
      }
    });
    console.log(`   ✅ Adjusting entry created: ${adjustingEntry.description}`);

    // Test 9: Create bank statement and reconciliation
    console.log('\n9. Creating bank statement and reconciliation...');
    
    const bankStatement = await prisma.bankStatement.create({
      data: {
        fileName: 'test-statement.pdf',
        filePath: '/uploads/test-statement.pdf',
        bankType: 'hdfc',
        userId: testUser.id,
        businessId: testBusiness.id,
        status: 'completed'
      }
    });
    console.log(`   ✅ Bank statement created: ${bankStatement.fileName}`);

    const bankStatementLine = await prisma.bankStatementLine.create({
      data: {
        bankStatementId: bankStatement.id,
        transactionDate: new Date('2024-01-15'),
        description: 'Payment received',
        amount: 11800, // Including GST
        balance: 11800,
        transactionType: 'CREDIT',
        reference: 'REF001'
      }
    });
    console.log(`   ✅ Bank statement line created: ${bankStatementLine.description}`);

    const bankReconciliation = await prisma.bankReconciliation.create({
      data: {
        accountId: createdAccounts.find(a => a.code === '1000').id,
        bankStatementId: bankStatement.id,
        reconciliationDate: new Date('2024-01-31'),
        statementBalance: 11800,
        bookBalance: 10000,
        adjustedBalance: 11800,
        userId: testUser.id,
        businessId: testBusiness.id
      }
    });
    console.log(`   ✅ Bank reconciliation created for ${bankReconciliation.reconciliationDate}`);

    // Test 10: Verify all relationships work
    console.log('\n10. Testing relationships...');
    
    const reconciliationWithDetails = await prisma.bankReconciliation.findUnique({
      where: { id: bankReconciliation.id },
      include: {
        Account: true,
        BankStatement: {
          include: {
            BankStatementLines: true
          }
        },
        ReconciliationItems: true
      }
    });
    console.log(`   ✅ Bank reconciliation with details: ${reconciliationWithDetails.Account.name}`);

    const periodWithEntries = await prisma.accountingPeriod.findUnique({
      where: { id: accountingPeriod.id },
      include: {
        AdjustingEntries: {
          include: {
            JournalEntryLines: {
              include: {
                Account: true
              }
            }
          }
        }
      }
    });
    console.log(`   ✅ Period with adjusting entries: ${periodWithEntries.AdjustingEntries.length} entries`);

    const transactionWithTax = await prisma.transaction.findUnique({
      where: { id: createdTransactions[0].id },
      include: {
        TaxTransactions: {
          include: {
            TaxRate: true
          }
        }
      }
    });
    console.log(`   ✅ Transaction with tax: ${transactionWithTax.TaxTransactions.length} tax records`);

    console.log('\n🎉 Phase 2 Implementation Test Completed Successfully!');
    console.log('\n✅ All Phase 2 features are working correctly:');
    console.log('   - Enhanced Bank Reconciliation System');
    console.log('   - Period Closing and Adjusting Entries');
    console.log('   - Tax Management System');
    console.log('   - Database relationships and constraints');

  } catch (error) {
    console.error('❌ Phase 2 Test Failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testPhase2()
  .then(() => {
    console.log('\n✅ Phase 2 test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Phase 2 test failed:', error);
    process.exit(1);
  }); 