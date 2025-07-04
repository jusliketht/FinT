const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const chalk = require('chalk');
const crypto = require('crypto');

/**
 * Create Comprehensive Chart of Accounts
 * Based on the Accounts.md documentation and current Prisma schema
 */

async function main() {
  console.log(chalk.blue('==== Creating Comprehensive Chart of Accounts ===='));
  
  try {
    // Check if we already have accounts
    const existingAccounts = await prisma.account.count();
    if (existingAccounts > 0) {
      console.log(chalk.yellow(`Found ${existingAccounts} existing accounts. Do you want to proceed and add more sample accounts?`));
      console.log(chalk.yellow('You can cancel this script (Ctrl+C) if you want to keep only existing accounts.'));
    }
    
    // Get or create a user
    let userId;
    try {
      const users = await prisma.user.findMany({ take: 1 });
      if (users.length > 0) {
        userId = users[0].id;
        console.log(chalk.green(`Using existing user with ID: ${userId}`));
      } else {
        console.log(chalk.red('No users found. Please create a user first.'));
        return;
      }
    } catch (error) {
      console.error(chalk.red('Error finding users:'), error);
      return;
    }

    // Comprehensive Chart of Accounts based on Accounts.md
    const chartOfAccounts = [
      // Assets (1XXXX)
      { code: '11100', name: 'Cash in Hand', type: 'asset', description: 'Cash on hand' },
      { code: '11200', name: 'Bank Accounts', type: 'asset', description: 'Bank account balances' },
      { code: '11210', name: 'HDFC Current Account', type: 'asset', description: 'HDFC Bank current account' },
      { code: '11220', name: 'ICICI Savings Account', type: 'asset', description: 'ICICI Bank savings account' },
      { code: '11300', name: 'Accounts Receivable (Sundry Debtors)', type: 'asset', description: 'Amounts owed by customers' },
      { code: '11310', name: 'IT Consulting Receivables', type: 'asset', description: 'Receivables from IT consulting services' },
      { code: '11320', name: 'Legal Services Receivables', type: 'asset', description: 'Receivables from legal services' },
      { code: '11330', name: 'Finance Consulting Receivables', type: 'asset', description: 'Receivables from finance consulting' },
      { code: '11340', name: 'Design Services Receivables', type: 'asset', description: 'Receivables from design services' },
      { code: '11400', name: 'GST Input Credit', type: 'asset', description: 'GST input credit available' },
      { code: '11410', name: 'CGST Input', type: 'asset', description: 'Central GST input credit' },
      { code: '11420', name: 'SGST Input', type: 'asset', description: 'State GST input credit' },
      { code: '11430', name: 'IGST Input', type: 'asset', description: 'Integrated GST input credit' },
      { code: '12100', name: 'Office Equipment', type: 'asset', description: 'Office equipment and machinery' },
      { code: '12110', name: 'Computers & Laptops', type: 'asset', description: 'Computer hardware and laptops' },
      { code: '12120', name: 'Furniture & Fixtures', type: 'asset', description: 'Office furniture and fixtures' },
      { code: '12200', name: 'Software Licenses', type: 'asset', description: 'Software licenses and tools' },
      { code: '12300', name: 'Accumulated Depreciation', type: 'asset', description: 'Accumulated depreciation on fixed assets' },
      
      // Liabilities (2XXXX)
      { code: '21100', name: 'Accounts Payable (Sundry Creditors)', type: 'liability', description: 'Amounts owed to vendors' },
      { code: '21110', name: 'Vendor Payments', type: 'liability', description: 'Payments due to vendors' },
      { code: '21120', name: 'Marketing Agency Payables', type: 'liability', description: 'Payables to marketing agencies' },
      { code: '21200', name: 'GST Payable', type: 'liability', description: 'GST payable to government' },
      { code: '21210', name: 'CGST Payable', type: 'liability', description: 'Central GST payable' },
      { code: '21220', name: 'SGST Payable', type: 'liability', description: 'State GST payable' },
      { code: '21230', name: 'IGST Payable', type: 'liability', description: 'Integrated GST payable' },
      { code: '21300', name: 'TDS Payable', type: 'liability', description: 'TDS payable to government' },
      { code: '21310', name: 'TDS on Professional Fees', type: 'liability', description: 'TDS on professional fees (194J)' },
      { code: '21320', name: 'TDS on Rent', type: 'liability', description: 'TDS on rent payments (194I)' },
      { code: '21400', name: 'Short-Term Loans', type: 'liability', description: 'Short-term borrowings' },
      { code: '22100', name: 'Business Loans (Term Loans)', type: 'liability', description: 'Long-term business loans' },
      
      // Equity (3XXXX)
      { code: '31100', name: 'Owner\'s Capital', type: 'equity', description: 'Owner\'s investment in the business' },
      { code: '31200', name: 'Retained Earnings', type: 'equity', description: 'Accumulated earnings retained in business' },
      { code: '31300', name: 'Drawings', type: 'equity', description: 'Owner\'s withdrawals from business' },
      
      // Income (4XXXX)
      { code: '41100', name: 'Service Revenue', type: 'revenue', description: 'Revenue from services rendered' },
      { code: '41110', name: 'IT Consulting Revenue', type: 'revenue', description: 'Revenue from IT consulting services' },
      { code: '41120', name: 'Legal Advisory Revenue', type: 'revenue', description: 'Revenue from legal advisory services' },
      { code: '41130', name: 'Finance & Strategy Consulting Revenue', type: 'revenue', description: 'Revenue from finance consulting' },
      { code: '41140', name: 'Design & Creative Services Revenue', type: 'revenue', description: 'Revenue from design services' },
      { code: '41150', name: 'Marketing Consulting Revenue', type: 'revenue', description: 'Revenue from marketing consulting' },
      { code: '41200', name: 'Interest Income', type: 'revenue', description: 'Interest earned on investments' },
      { code: '41300', name: 'Other Income', type: 'revenue', description: 'Other miscellaneous income' },
      { code: '42100', name: 'CGST Collected', type: 'revenue', description: 'Central GST collected on sales' },
      { code: '42200', name: 'SGST Collected', type: 'revenue', description: 'State GST collected on sales' },
      { code: '42300', name: 'IGST Collected', type: 'revenue', description: 'Integrated GST collected on sales' },
      
      // Expenses (5XXXX)
      { code: '51100', name: 'Employee Costs', type: 'expense', description: 'Total employee-related costs' },
      { code: '51110', name: 'Salaries & Wages', type: 'expense', description: 'Employee salaries and wages' },
      { code: '51120', name: 'Employee Benefits', type: 'expense', description: 'PF, ESI and other benefits' },
      { code: '51130', name: 'Contract Staff Payments', type: 'expense', description: 'Payments to contract staff' },
      { code: '51200', name: 'Rent & Utilities', type: 'expense', description: 'Office rent and utility expenses' },
      { code: '51210', name: 'Office Rent', type: 'expense', description: 'Office space rent' },
      { code: '51220', name: 'Electricity & Water', type: 'expense', description: 'Electricity and water bills' },
      { code: '51230', name: 'Internet & Phone', type: 'expense', description: 'Internet and phone expenses' },
      { code: '51300', name: 'Marketing & Business Development', type: 'expense', description: 'Marketing and business development costs' },
      { code: '51310', name: 'Digital Ads', type: 'expense', description: 'Digital advertising expenses' },
      { code: '51320', name: 'Content Creation', type: 'expense', description: 'Content creation and marketing materials' },
      { code: '51400', name: 'Professional Fees', type: 'expense', description: 'Professional service fees' },
      { code: '51410', name: 'Legal Consultancy Fees', type: 'expense', description: 'Legal consultancy and advisory fees' },
      { code: '51420', name: 'Audit & Accounting Fees', type: 'expense', description: 'Audit and accounting service fees' },
      { code: '51500', name: 'Software & Tools', type: 'expense', description: 'Software licenses and tools' },
      { code: '51510', name: 'IT Tools', type: 'expense', description: 'IT tools and software licenses' },
      { code: '51520', name: 'Design Software', type: 'expense', description: 'Design software licenses' },
      { code: '51600', name: 'Travel & Conveyance', type: 'expense', description: 'Travel and conveyance expenses' },
      { code: '51610', name: 'Client Meetings', type: 'expense', description: 'Travel expenses for client meetings' },
      { code: '51620', name: 'Local Transport', type: 'expense', description: 'Local transportation expenses' },
      { code: '52100', name: 'GST Paid on Purchases', type: 'expense', description: 'GST paid on purchases' },
      { code: '52200', name: 'TDS Deducted', type: 'expense', description: 'TDS deducted on payments' },
      { code: '52300', name: 'Compliance Penalties', type: 'expense', description: 'Compliance and penalty payments' },
      { code: '53100', name: 'Bank Charges', type: 'expense', description: 'Bank charges and fees' },
      { code: '53200', name: 'Loan Interest', type: 'expense', description: 'Interest on loans and borrowings' },
      { code: '54100', name: 'Depreciation on Office Equipment', type: 'expense', description: 'Depreciation on office equipment' },
      { code: '54200', name: 'Depreciation on Software', type: 'expense', description: 'Depreciation on software licenses' },
      
      // Provisions (6XXXX)
      { code: '61100', name: 'Provision for Bad Debts', type: 'liability', description: 'Provision for doubtful receivables' },
      { code: '61200', name: 'Provision for Taxation', type: 'liability', description: 'Provision for income tax' }
    ];
    
    console.log(chalk.cyan(`Creating ${chartOfAccounts.length} accounts...`));
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const accountData of chartOfAccounts) {
      try {
        // Check if account already exists by code
        const existingAccount = await prisma.account.findFirst({
          where: { code: accountData.code }
        });
        
        if (existingAccount) {
          console.log(chalk.gray(`Account ${accountData.code} - ${accountData.name} already exists, skipping.`));
          skippedCount++;
          continue;
        }
        
        // Create account
        await prisma.account.create({
          data: {
            id: crypto.randomUUID(),
            code: accountData.code,
            name: accountData.name,
            type: accountData.type,
            userId: userId,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        console.log(chalk.green(`✓ Created account: ${accountData.code} - ${accountData.name}`));
        createdCount++;
      } catch (error) {
        console.log(chalk.red(`✗ Failed to create account ${accountData.code}: ${error.message}`));
      }
    }
    
    // Display summary
    const finalAccounts = await prisma.account.findMany({
      orderBy: { code: 'asc' }
    });
    
    console.log(chalk.blue('\n==== Chart of Accounts Summary ===='));
    console.log(`Total accounts: ${finalAccounts.length}`);
    console.log(`Created in this run: ${createdCount}`);
    console.log(`Skipped (already existed): ${skippedCount}`);
    
    // Group by type
    const accountsByType = finalAccounts.reduce((acc, account) => {
      const type = account.type || 'Unknown';
      if (!acc[type]) acc[type] = [];
      acc[type].push(account);
      return acc;
    }, {});
    
    // Display by type
    Object.entries(accountsByType).forEach(([type, accounts]) => {
      console.log(chalk.cyan(`\n${type.toUpperCase()} ACCOUNTS (${accounts.length}):`));
      accounts.forEach(account => {
        console.log(`  ${account.code} - ${account.name}`);
      });
    });
    
    console.log(chalk.green('\n✅ Chart of Accounts creation completed successfully!'));
    
  } catch (error) {
    console.error(chalk.red('Error creating Chart of Accounts:'), error);
  }
}

main()
  .catch((e) => {
    console.error('Error running script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 