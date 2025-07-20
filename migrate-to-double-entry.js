const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateToDoubleEntry() {
  console.log('🔄 Starting migration to double-entry bookkeeping system...\n');

  try {
    // Step 1: Check for existing journal entries in old format
    console.log('1. Checking existing journal entries...');
    
    const oldJournalEntries = await prisma.journalEntry.findMany({
      where: {
        debitAccountId: { not: null },
        creditAccountId: { not: null }
      },
      include: {
        debitAccount: true,
        creditAccount: true
      }
    });

    console.log(`Found ${oldJournalEntries.length} journal entries to migrate`);

    if (oldJournalEntries.length === 0) {
      console.log('✅ No old format journal entries found. Migration complete!');
      return;
    }

    // Step 2: Create new journal entries with lines
    console.log('\n2. Creating new journal entries with lines...');
    
    let migratedCount = 0;
    let errorCount = 0;

    for (const oldEntry of oldJournalEntries) {
      try {
        // Create new journal entry with lines
        const newEntry = await prisma.journalEntry.create({
          data: {
            id: oldEntry.id, // Keep the same ID
            date: oldEntry.date,
            description: oldEntry.description,
            reference: oldEntry.reference,
            totalAmount: oldEntry.amount,
            userId: oldEntry.userId,
            businessId: oldEntry.businessId,
            isAdjusting: false,
            isReversed: false,
            createdAt: oldEntry.createdAt,
            updatedAt: oldEntry.updatedAt,
            JournalEntryLines: {
              create: [
                {
                  accountId: oldEntry.debitAccountId,
                  debitAmount: oldEntry.amount,
                  creditAmount: 0,
                  description: `Debit: ${oldEntry.debitAccount?.name || 'Unknown Account'}`
                },
                {
                  accountId: oldEntry.creditAccountId,
                  debitAmount: 0,
                  creditAmount: oldEntry.amount,
                  description: `Credit: ${oldEntry.creditAccount?.name || 'Unknown Account'}`
                }
              ]
            }
          }
        });

        migratedCount++;
        console.log(`✅ Migrated entry ${oldEntry.id}: ${oldEntry.description}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to migrate entry ${oldEntry.id}:`, error.message);
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   - Successfully migrated: ${migratedCount} entries`);
    console.log(`   - Failed migrations: ${errorCount} entries`);

    // Step 3: Verify migration
    console.log('\n3. Verifying migration...');
    
    const newJournalEntries = await prisma.journalEntry.findMany({
      include: {
        JournalEntryLines: {
          include: { Account: true }
        }
      }
    });

    console.log(`Total journal entries after migration: ${newJournalEntries.length}`);
    
    // Check for balanced entries
    let balancedEntries = 0;
    let unbalancedEntries = 0;

    for (const entry of newJournalEntries) {
      const totalDebits = entry.JournalEntryLines.reduce((sum, line) => sum + line.debitAmount, 0);
      const totalCredits = entry.JournalEntryLines.reduce((sum, line) => sum + line.creditAmount, 0);
      
      if (Math.abs(totalDebits - totalCredits) < 0.01) {
        balancedEntries++;
      } else {
        unbalancedEntries++;
        console.warn(`⚠️  Unbalanced entry ${entry.id}: Debits=${totalDebits}, Credits=${totalCredits}`);
      }
    }

    console.log(`\n📊 Balance Verification:`);
    console.log(`   - Balanced entries: ${balancedEntries}`);
    console.log(`   - Unbalanced entries: ${unbalancedEntries}`);

    // Step 4: Generate trial balance
    console.log('\n4. Generating trial balance...');
    
    const trialBalance = await prisma.$queryRaw`
      SELECT 
        a.id,
        a.code,
        a.name,
        a.type,
        COALESCE(SUM(jel."debitAmount"), 0) as totalDebits,
        COALESCE(SUM(jel."creditAmount"), 0) as totalCredits,
        (COALESCE(SUM(jel."debitAmount"), 0) - COALESCE(SUM(jel."creditAmount"), 0)) as balance
      FROM "AccountHead" a
      LEFT JOIN "JournalEntryLine" jel ON a.id = jel."accountId"
      LEFT JOIN "JournalEntry" je ON jel."journalEntryId" = je.id
      GROUP BY a.id, a.code, a.name, a.type
      ORDER BY a.code
    `;

    const totalTrialDebits = trialBalance.reduce((sum, account) => sum + parseFloat(account.totalDebits), 0);
    const totalTrialCredits = trialBalance.reduce((sum, account) => sum + parseFloat(account.totalCredits), 0);

    console.log(`\n📊 Trial Balance Summary:`);
    console.log(`   - Total Debits: ${totalTrialDebits.toFixed(2)}`);
    console.log(`   - Total Credits: ${totalTrialCredits.toFixed(2)}`);
    console.log(`   - Difference: ${(totalTrialDebits - totalTrialCredits).toFixed(2)}`);
    
    if (Math.abs(totalTrialDebits - totalTrialCredits) < 0.01) {
      console.log('✅ Trial balance is balanced!');
    } else {
      console.log('⚠️  Trial balance is not balanced');
    }

    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateToDoubleEntry(); 