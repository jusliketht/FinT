# Financial Management System: Accounting Workflow Documentation

## Prerequisites

Before starting the accounting process, ensure the following are set up correctly:

1. **Business Setup**
   - Business entity must be created (`CompanySettings`)
   - Users must be assigned to the business with appropriate roles

2. **Account Categories** 
   - Default system account categories must be defined: Asset, Liability, Equity, Revenue, Expense
   - These are foundational for the chart of accounts.
   - A seeding script `scripts/seed-account-categories.js` is available for this.

3. **Chart of Accounts (Account Heads)**
   - Individual accounts (`AccountHead`) must be created with:
     - Unique code
     - Name
     - Category (linked to Account Categories)
     - Business association (if applicable)
     - Starting balance if applicable
   - Ensure a complete set of accounts exists for basic accounting functions.

4. **Database Tables**
   - Verify all required tables exist (see `prisma/schema.prisma`):
     - `User`
     - `Account`
     - `AccountCategory`
     - `AccountHead`
     - `JournalEntry`
     - `JournalEntryItem`
     - `LedgerEntry`
     - `CompanySettings`
     - `FinancialYear`
     - `Transaction`

## Accounting Workflow

### 1. Business Setup
- **Process**:
  1. Create business entity
  2. Assign users to business with roles
  3. Create business-specific accounts
  4. Set up initial balances
  5. Configure business settings

- **Verification Steps**:
  1. Verify business creation
  2. Confirm user assignments
  3. Check account setup
  4. Validate initial balances
  5. Test business-specific access

### 2. Journal Entries
- **Process**:
  1. Create journal entries with:
     - Date
     - Description
     - Business context
     - Debit account
     - Credit account
     - Amount
  2. Each entry must follow double-entry accounting principles
  3. When entry is saved, account balances are updated automatically
  4. Entries are business-specific
  
- **Verification Steps**:
  1. Create a sample journal entry
  2. Confirm entry appears in journal listing
  3. Verify both affected accounts have updated balances
  4. Check that debit and credit amounts balance
  5. Verify business context is maintained

### 3. Business-specific Operations
1. **Account Management**:
   - Create business-specific accounts
   - Link accounts to business
   - Manage account access
   - Track business-specific balances

2. **User Management**:
   - Assign users to business
   - Set business-specific roles
   - Manage user permissions
   - Track user activity

3. **Financial Reporting**:
   - Generate business-specific reports
   - Track business performance
   - Monitor business accounts
   - Analyze business metrics

### 4. Ledgers
- **Process**:
  1. General Ledger shows all transactions across all accounts
  2. Account Ledgers show transactions for a specific account
  3. Ledgers automatically update when journal entries are created
  
- **Verification Steps**:
  1. View General Ledger to ensure journal entries appear correctly
  2. Select specific account and view its ledger
  3. Verify running balance calculation is correct
  4. Filter by date range and confirm correct entries display

### 5. Trial Balance
- **Process**:
  1. Generate trial balance as of a specific date
  2. System calculates sum of all debit and credit balances
  3. Totals should be equal (debits = credits)
  
- **Verification Steps**:
  1. Generate trial balance for current date
  2. Verify all accounts with balances are included
  3. Check that total debits equal total credits
  4. Toggle zero balance inclusion and verify behavior

### 6. Financial Reports
- **Process**:
  1. Balance Sheet shows financial position at a point in time
  2. Income Statement (Profit & Loss) shows performance over a period
  3. Reports are generated based on account types and their balances
  
- **Verification Steps**:
  1. Generate Balance Sheet and verify:
     - Assets = Liabilities + Equity
     - All accounts appear in correct sections
  2. Generate Income Statement and verify:
     - Revenue and Expense accounts are correctly categorized
     - Net Income calculation is correct
     - Date range filters work correctly
  3. Test PDF generation for both reports

## Database Operations Testing

### Account Management
1. **Create Account**:
   - Create new account with all required fields
   - Verify it appears in account listing
   - Confirm database entry contains correct data

2. **Update Account**:
   - Edit existing account details
   - Verify changes are saved
   - Confirm database is updated

3. **Delete/Deactivate Account**:
   - Attempt to delete account with no transactions
   - Attempt to delete account with transactions (should be prevented)
   - Deactivate account and verify it's no longer available for new transactions

### Journal Entry Operations
1. **Create Entry**:
   - Create entry between two accounts
   - Verify database transaction occurs
   - Confirm both account balances update

2. **Update Entry**:
   - Edit existing journal entry
   - Verify previous balances are reversed and new ones applied
   - Confirm transaction integrity is maintained

3. **Delete Entry**:
   - Delete journal entry
   - Verify account balances revert to previous state
   - Confirm entry is removed from database

## End-to-End Testing Scenarios

### 1. Basic Accounting Cycle
1. Create chart of accounts with Asset, Liability, Equity, Revenue and Expense accounts
2. Record journal entries for:
   - Initial capital (debit Cash, credit Capital)
   - Purchase of equipment (debit Equipment, credit Cash)
   - Revenue transaction (debit Cash, credit Revenue)
   - Expense transaction (debit Expense, credit Cash)
3. View all ledgers to confirm entries
4. Generate trial balance to verify balance
5. Create financial reports to validate overall system

### 2. Error Handling
1. Attempt invalid journal entries (missing required fields)
2. Try to create unbalanced transactions
3. Test validation rules on all inputs

### 3. Reconciliation Process
1. Record multiple transactions for a bank account
2. Test the account reconciliation functionality
3. Verify reconciled transactions are marked correctly

## Technical Verification
1. Check database constraints and relationships
2. Verify API endpoints function correctly
3. Test transaction handling and rollback scenarios
4. Confirm proper error handling and validation

This document serves as both a guide to setting up the accounting workflow and a checklist for verifying that all components are functioning correctly. 