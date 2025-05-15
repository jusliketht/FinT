# Accounting System Verification and Testing

This directory contains scripts to verify the accounting system's setup and test its core functionality.

## Prerequisites

Before running these scripts, make sure you have:
1. Set up and connected to your database
2. Installed all necessary dependencies:
   ```
   npm install
   ```

## Scripts Overview

### 1. Verify Accounting Setup

**File:** `verify-accounting-setup.js`

This script checks if all prerequisites for the accounting system are in place, including:
- Required account types (Asset, Liability, Equity, Revenue, Expense)
- Account categories within each type
- Chart of accounts
- Required database tables

**Usage:**
```bash
node scripts/verify-accounting-setup.js
```

**Example Output:**
```
==== Financial Management System Setup Verification ====

Verifying Account Types...
✓ All required account types exist
  Found: Assets, Liabilities, Equity, Revenue, Expenses

Verifying Account Categories...
✓ Found 12 account categories
  Asset: Current Assets, Fixed Assets, Other Assets
  Liability: Current Liabilities, Long-term Liabilities
  Equity: Owner's Equity, Retained Earnings
  Revenue: Operating Revenue, Other Revenue
  Expense: Operating Expenses, Other Expenses

...
```

### 2. Test Accounting Workflow

**File:** `test-accounting-workflow.js`

This script tests the basic accounting workflow by:
1. Finding test accounts (Cash/Asset, Revenue, Expense)
2. Creating sample journal entries
3. Verifying account balance updates
4. Generating and verifying a trial balance

**Usage:**
```bash
node scripts/test-accounting-workflow.js
```

**Example Output:**
```
==== Accounting Workflow Test ====
This script will create sample accounting entries and verify the workflow.

1. Looking up test accounts...
✓ Found Cash/Asset account: 1000 - Cash
✓ Found Revenue account: 4000 - Sales Revenue
✓ Found Expense account: 5000 - Office Expenses

2. Creating test journal entries...
Creating revenue entry: Debit Cash, Credit Revenue
✓ Created journal entry: 7f8d9a3b-1c2d-3e4f-5g6h-7i8j9k0l1m2n
Creating expense entry: Debit Expense, Credit Cash
✓ Created journal entry: 3e4f5g6h-7i8j-9k0l-1m2n-3o4p5q6r7s8t

...
```

## Reference Documentation

For a comprehensive understanding of the accounting workflow and verification process, please refer to the main documentation:

- `Accounting_Workflow_Documentation.md` - Contains detailed information on prerequisites, accounting workflow, and verification steps.

## Notes for Developers

- These scripts are designed for testing and verification only
- The test script creates real entries in your database
- Make sure to run these scripts in a development or testing environment

## Troubleshooting

If you encounter errors:

1. **Database Connection Issues**
   - Check your `.env` file for correct database connection string
   - Verify the database is running and accessible

2. **Missing Prerequisites**
   - Run the verification script first to identify missing components
   - If account types or categories are missing, seed them from `Accounts.md`

3. **Permissions Issues**
   - Ensure your database user has permissions to read/write

4. **Schema Mismatch**
   - Verify that your Prisma schema matches the database schema
   - Run `npx prisma generate` to regenerate client

## Extending the Scripts

Feel free to extend these scripts for additional verification or testing:

- Add tests for financial reporting
- Create tests for account reconciliation
- Add more detailed balance verification 