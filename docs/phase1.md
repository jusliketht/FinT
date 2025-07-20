Cursor Prompt: Phase 1 - Critical Bookkeeping System Fixes

Goal

Implement fundamental bookkeeping principles to make FinT compliant with standard accounting practices. This phase addresses the most critical gaps that affect the core integrity of the accounting system.

Task Group 1: Double-Entry Bookkeeping System Implementation

Backend Changes (NestJS/Prisma)

1. Update Database Schema (prisma/schema.prisma)

Plain Text


// Add new models for proper double-entry system
model JournalEntryLine {
  id              String       @id @default(uuid())
  journalEntryId  String
  accountId       String
  debitAmount     Float        @default(0)
  creditAmount    Float        @default(0)
  description     String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  JournalEntry    JournalEntry @relation(fields: [journalEntryId], references: [id], onDelete: Cascade)
  Account         AccountHead  @relation(fields: [accountId], references: [id])
  
  @@index([journalEntryId])
  @@index([accountId])
}

// Update JournalEntry model
model JournalEntry {
  id              String             @id @default(uuid())
  date            DateTime
  description     String
  reference       String?
  totalAmount     Float              // For validation - sum of debits should equal sum of credits
  userId          String
  businessId      String?
  isAdjusting     Boolean            @default(false)
  isReversed      Boolean            @default(false)
  reversalEntryId String?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  
  Business        Business?          @relation(fields: [businessId], references: [id])
  User            User               @relation(fields: [userId], references: [id])
  JournalEntryLines JournalEntryLine[]
  ReversalEntry   JournalEntry?      @relation("JournalEntryReversal", fields: [reversalEntryId], references: [id])
  ReversedBy      JournalEntry[]     @relation("JournalEntryReversal")
  
  @@index([date])
  @@index([userId])
  @@index([businessId])
}


2. Create Journal Entry Service (server/src/accounting/services/journal-entry.service.ts)

TypeScript


@Injectable()
export class JournalEntryService {
  constructor(private prisma: PrismaService) {}

  async createJournalEntry(data: CreateJournalEntryDto): Promise<JournalEntry> {
    // Validate double-entry rules
    const totalDebits = data.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
    const totalCredits = data.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new BadRequestException('Debits must equal credits in double-entry system');
    }

    return this.prisma.journalEntry.create({
      data: {
        ...data,
        totalAmount: totalDebits,
        JournalEntryLines: {
          create: data.lines
        }
      },
      include: {
        JournalEntryLines: {
          include: { Account: true }
        }
      }
    });
  }

  async getTrialBalance(businessId: string, asOfDate: Date): Promise<TrialBalanceDto[]> {
    // Generate trial balance from journal entry lines
    const balances = await this.prisma.$queryRaw`
      SELECT 
        a.id,
        a.code,
        a.name,
        a.type,
        SUM(jel.debitAmount) as totalDebits,
        SUM(jel.creditAmount) as totalCredits,
        (SUM(jel.debitAmount) - SUM(jel.creditAmount)) as balance
      FROM AccountHead a
      LEFT JOIN JournalEntryLine jel ON a.id = jel.accountId
      LEFT JOIN JournalEntry je ON jel.journalEntryId = je.id
      WHERE (je.businessId = ${businessId} OR je.businessId IS NULL)
        AND je.date <= ${asOfDate}
      GROUP BY a.id, a.code, a.name, a.type
      ORDER BY a.code
    `;
    
    return balances;
  }
}


3. Update Transaction Service to Create Journal Entries

TypeScript


// Modify existing transaction service to create proper journal entries
async createTransaction(data: CreateTransactionDto): Promise<Transaction> {
  const transaction = await this.prisma.transaction.create({ data });
  
  // Create corresponding journal entry
  const journalEntryData = this.mapTransactionToJournalEntry(transaction);
  await this.journalEntryService.createJournalEntry(journalEntryData);
  
  return transaction;
}

private mapTransactionToJournalEntry(transaction: Transaction): CreateJournalEntryDto {
  // Map transaction to proper double-entry journal entry
  // This depends on transaction type and account mapping rules
  const lines = [];
  
  if (transaction.transactionType === 'INCOME') {
    lines.push(
      { accountId: 'CASH_ACCOUNT_ID', debitAmount: transaction.amount, creditAmount: 0 },
      { accountId: 'REVENUE_ACCOUNT_ID', debitAmount: 0, creditAmount: transaction.amount }
    );
  } else if (transaction.transactionType === 'EXPENSE') {
    lines.push(
      { accountId: 'EXPENSE_ACCOUNT_ID', debitAmount: transaction.amount, creditAmount: 0 },
      { accountId: 'CASH_ACCOUNT_ID', debitAmount: 0, creditAmount: transaction.amount }
    );
  }
  
  return {
    date: transaction.date,
    description: transaction.description,
    reference: transaction.reference,
    lines,
    userId: transaction.userId,
    businessId: transaction.businessId
  };
}


Task Group 2: Standard Chart of Accounts Implementation

1. Create Standard Account Categories and Types

TypeScript


// Create seed data for standard chart of accounts
const STANDARD_ACCOUNT_CATEGORIES = [
  { code: '1000', name: 'Assets', type: 'ASSET' },
  { code: '1100', name: 'Current Assets', type: 'ASSET', parentCode: '1000' },
  { code: '1110', name: 'Cash and Cash Equivalents', type: 'ASSET', parentCode: '1100' },
  { code: '1120', name: 'Accounts Receivable', type: 'ASSET', parentCode: '1100' },
  { code: '1130', name: 'Inventory', type: 'ASSET', parentCode: '1100' },
  { code: '1200', name: 'Non-Current Assets', type: 'ASSET', parentCode: '1000' },
  { code: '1210', name: 'Property, Plant & Equipment', type: 'ASSET', parentCode: '1200' },
  
  { code: '2000', name: 'Liabilities', type: 'LIABILITY' },
  { code: '2100', name: 'Current Liabilities', type: 'LIABILITY', parentCode: '2000' },
  { code: '2110', name: 'Accounts Payable', type: 'LIABILITY', parentCode: '2100' },
  { code: '2120', name: 'Accrued Expenses', type: 'LIABILITY', parentCode: '2100' },
  { code: '2200', name: 'Non-Current Liabilities', type: 'LIABILITY', parentCode: '2000' },
  { code: '2210', name: 'Long-term Debt', type: 'LIABILITY', parentCode: '2200' },
  
  { code: '3000', name: 'Equity', type: 'EQUITY' },
  { code: '3100', name: 'Owner\'s Equity', type: 'EQUITY', parentCode: '3000' },
  { code: '3200', name: 'Retained Earnings', type: 'EQUITY', parentCode: '3000' },
  
  { code: '4000', name: 'Revenue', type: 'REVENUE' },
  { code: '4100', name: 'Sales Revenue', type: 'REVENUE', parentCode: '4000' },
  { code: '4200', name: 'Other Income', type: 'REVENUE', parentCode: '4000' },
  
  { code: '5000', name: 'Expenses', type: 'EXPENSE' },
  { code: '5100', name: 'Cost of Goods Sold', type: 'EXPENSE', parentCode: '5000' },
  { code: '5200', name: 'Operating Expenses', type: 'EXPENSE', parentCode: '5000' },
  { code: '5300', name: 'Administrative Expenses', type: 'EXPENSE', parentCode: '5000' }
];


2. Create Account Setup Service

TypeScript


@Injectable()
export class AccountSetupService {
  constructor(private prisma: PrismaService) {}

  async initializeStandardChartOfAccounts(businessId: string): Promise<void> {
    // Create standard chart of accounts for new business
    for (const category of STANDARD_ACCOUNT_CATEGORIES) {
      await this.prisma.accountHead.upsert({
        where: { code: category.code },
        update: {},
        create: {
          id: uuidv4(),
          code: category.code,
          name: category.name,
          type: category.type,
          businessId,
          isCustom: false,
          parentId: category.parentCode ? 
            (await this.findAccountByCode(category.parentCode))?.id : null
        }
      });
    }
  }

  private async findAccountByCode(code: string): Promise<AccountHead | null> {
    return this.prisma.accountHead.findUnique({ where: { code } });
  }
}


Task Group 3: Financial Statement Generation

1. Create Financial Statement Service

TypeScript


@Injectable()
export class FinancialStatementService {
  constructor(private prisma: PrismaService) {}

  async generateBalanceSheet(businessId: string, asOfDate: Date): Promise<BalanceSheetDto> {
    const accounts = await this.getAccountBalances(businessId, asOfDate);
    
    const assets = accounts.filter(a => a.type === 'ASSET');
    const liabilities = accounts.filter(a => a.type === 'LIABILITY');
    const equity = accounts.filter(a => a.type === 'EQUITY');
    
    return {
      asOfDate,
      assets: this.groupAccountsByCategory(assets),
      liabilities: this.groupAccountsByCategory(liabilities),
      equity: this.groupAccountsByCategory(equity),
      totalAssets: this.sumBalances(assets),
      totalLiabilities: this.sumBalances(liabilities),
      totalEquity: this.sumBalances(equity)
    };
  }

  async generateIncomeStatement(
    businessId: string, 
    fromDate: Date, 
    toDate: Date
  ): Promise<IncomeStatementDto> {
    const accounts = await this.getAccountBalances(businessId, toDate, fromDate);
    
    const revenue = accounts.filter(a => a.type === 'REVENUE');
    const expenses = accounts.filter(a => a.type === 'EXPENSE');
    
    const totalRevenue = this.sumBalances(revenue);
    const totalExpenses = this.sumBalances(expenses);
    
    return {
      fromDate,
      toDate,
      revenue: this.groupAccountsByCategory(revenue),
      expenses: this.groupAccountsByCategory(expenses),
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses
    };
  }

  private async getAccountBalances(
    businessId: string, 
    asOfDate: Date, 
    fromDate?: Date
  ): Promise<AccountBalanceDto[]> {
    // Query to get account balances from journal entry lines
    const whereClause = fromDate ? 
      `je.date BETWEEN '${fromDate.toISOString()}' AND '${asOfDate.toISOString()}'` :
      `je.date <= '${asOfDate.toISOString()}'`;

    return this.prisma.$queryRaw`
      SELECT 
        a.id,
        a.code,
        a.name,
        a.type,
        COALESCE(SUM(jel.debitAmount) - SUM(jel.creditAmount), 0) as balance
      FROM AccountHead a
      LEFT JOIN JournalEntryLine jel ON a.id = jel.accountId
      LEFT JOIN JournalEntry je ON jel.journalEntryId = je.id
      WHERE (je.businessId = ${businessId} OR je.businessId IS NULL)
        AND ${whereClause}
      GROUP BY a.id, a.code, a.name, a.type
      ORDER BY a.code
    `;
  }
}


Frontend Changes (React)

1. Update Transaction Form for Double-Entry

JSX


// Add account selection for both debit and credit sides
const TransactionForm = ({ isOpen, onClose, transaction, onSuccess }) => {
  const [journalLines, setJournalLines] = useState([
    { accountId: '', debitAmount: 0, creditAmount: 0, description: '' },
    { accountId: '', debitAmount: 0, creditAmount: 0, description: '' }
  ]);

  const addJournalLine = () => {
    setJournalLines([...journalLines, { accountId: '', debitAmount: 0, creditAmount: 0, description: '' }]);
  };

  const updateJournalLine = (index, field, value) => {
    const updatedLines = [...journalLines];
    updatedLines[index][field] = value;
    setJournalLines(updatedLines);
  };

  const getTotalDebits = () => journalLines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
  const getTotalCredits = () => journalLines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
  const isBalanced = () => Math.abs(getTotalDebits() - getTotalCredits()) < 0.01;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalContent>
        <ModalHeader>Create Journal Entry</ModalHeader>
        <ModalBody>
          {/* Journal entry lines */}
          {journalLines.map((line, index) => (
            <HStack key={index} spacing={4}>
              <Select 
                placeholder="Select Account"
                value={line.accountId}
                onChange={(e) => updateJournalLine(index, 'accountId', e.target.value)}
              >
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </Select>
              <NumberInput 
                value={line.debitAmount}
                onChange={(value) => updateJournalLine(index, 'debitAmount', parseFloat(value) || 0)}
              >
                <NumberInputField placeholder="Debit" />
              </NumberInput>
              <NumberInput 
                value={line.creditAmount}
                onChange={(value) => updateJournalLine(index, 'creditAmount', parseFloat(value) || 0)}
              >
                <NumberInputField placeholder="Credit" />
              </NumberInput>
            </HStack>
          ))}
          
          {/* Balance validation */}
          <Alert status={isBalanced() ? 'success' : 'error'}>
            <AlertIcon />
            <Box>
              <AlertTitle>Balance Check:</AlertTitle>
              <AlertDescription>
                Debits: {formatCurrency(getTotalDebits())} | 
                Credits: {formatCurrency(getTotalCredits())} |
                {isBalanced() ? ' ✓ Balanced' : ' ✗ Not Balanced'}
              </AlertDescription>
            </Box>
          </Alert>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};


2. Create Financial Reports Components

JSX


// BalanceSheet.jsx
const BalanceSheet = () => {
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [asOfDate, setAsOfDate] = useState(new Date());

  const fetchBalanceSheet = async () => {
    try {
      const response = await api.get(`/financial-statements/balance-sheet`, {
        params: { businessId: selectedBusiness.id, asOfDate }
      });
      setBalanceSheet(response.data);
    } catch (error) {
      toast.error('Failed to generate balance sheet');
    }
  };

  return (
    <Box>
      <Heading>Balance Sheet</Heading>
      <Text>As of {formatDate(asOfDate)}</Text>
      
      {/* Assets Section */}
      <Box mt={6}>
        <Heading size="md">Assets</Heading>
        {balanceSheet?.assets.map(category => (
          <Box key={category.name} ml={4}>
            <Text fontWeight="bold">{category.name}</Text>
            {category.accounts.map(account => (
              <Flex key={account.id} justify="space-between">
                <Text ml={4}>{account.name}</Text>
                <Text>{formatCurrency(account.balance)}</Text>
              </Flex>
            ))}
          </Box>
        ))}
        <Divider />
        <Flex justify="space-between" fontWeight="bold">
          <Text>Total Assets</Text>
          <Text>{formatCurrency(balanceSheet?.totalAssets)}</Text>
        </Flex>
      </Box>
      
      {/* Similar sections for Liabilities and Equity */}
    </Box>
  );
};


Task Group 4: Data Validation and Integrity

1. Add Database Constraints

SQL


-- Add constraints to ensure data integrity
ALTER TABLE "JournalEntry" ADD CONSTRAINT "journal_entry_balanced" 
CHECK (
  (SELECT SUM("debitAmount") FROM "JournalEntryLine" WHERE "journalEntryId" = "id") = 
  (SELECT SUM("creditAmount") FROM "JournalEntryLine" WHERE "journalEntryId" = "id")
);

-- Add check constraints for account types
ALTER TABLE "AccountHead" ADD CONSTRAINT "valid_account_type" 
CHECK ("type" IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'));


2. Add Validation DTOs

TypeScript


export class CreateJournalEntryDto {
  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @ValidateNested({ each: true })
  @Type(() => JournalEntryLineDto)
  @ArrayMinSize(2)
  @IsBalanced() // Custom validator
  lines: JournalEntryLineDto[];
}

// Custom validator for balanced entries
export function IsBalanced(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isBalanced',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(lines: JournalEntryLineDto[]) {
          const totalDebits = lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
          const totalCredits = lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
          return Math.abs(totalDebits - totalCredits) < 0.01;
        },
        defaultMessage() {
          return 'Journal entry must be balanced (debits must equal credits)';
        }
      }
    });
  };
}


Expected Outcomes

After completing Phase 1:

•
✅ All transactions will follow double-entry bookkeeping principles

•
✅ Standard chart of accounts will be available for all businesses

•
✅ Financial statements (Balance Sheet, Income Statement) will be automatically generated

•
✅ Data integrity will be enforced through validation and constraints

•
✅ Trial balance will always be balanced, ensuring accounting equation integrity

Testing Checklist




Create a journal entry and verify debits equal credits




Generate trial balance and verify it balances




Create balance sheet and verify Assets = Liabilities + Equity




Create income statement and verify revenue/expense calculations




Test validation errors for unbalanced entries




Verify standard chart of accounts is created for new businesses

Action: Implement these changes systematically, testing each component before moving to the next. This phase is critical for the accounting integrity of the entire system.

