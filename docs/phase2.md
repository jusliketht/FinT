Cursor Prompt: Phase 2 - Important System Enhancements

Goal

Enhance the FinT application with important features that improve usability, compliance, and business functionality. This phase builds upon the solid foundation established in Phase 1.

Task Group 1: Enhanced Bank Reconciliation System

Backend Changes

1. Update Bank Reconciliation Models

Plain Text


// Update existing reconciliation model
model BankReconciliation {
  id                    String                     @id @default(uuid())
  accountId             String
  bankStatementId       String?
  reconciliationDate    DateTime
  statementBalance      Float
  bookBalance           Float
  adjustedBalance       Float
  isReconciled          Boolean                    @default(false)
  userId                String
  businessId            String?
  createdAt             DateTime                   @default(now())
  updatedAt             DateTime                   @updatedAt
  
  Account               Account                    @relation(fields: [accountId], references: [id])
  BankStatement         BankStatement?             @relation(fields: [bankStatementId], references: [id])
  Business              Business?                  @relation(fields: [businessId], references: [id])
  User                  User                       @relation(fields: [userId], references: [id])
  ReconciliationItems   BankReconciliationItem[]
  
  @@index([accountId])
  @@index([reconciliationDate])
  @@index([userId])
  @@index([businessId])
}

model BankReconciliationItem {
  id                    String              @id @default(uuid())
  reconciliationId      String
  transactionId         String?
  statementLineId       String?
  type                  String              // 'OUTSTANDING_DEPOSIT', 'OUTSTANDING_CHECK', 'BANK_CHARGE', 'ADJUSTMENT'
  description           String
  amount                Float
  isCleared             Boolean             @default(false)
  clearingDate          DateTime?
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  BankReconciliation    BankReconciliation  @relation(fields: [reconciliationId], references: [id], onDelete: Cascade)
  Transaction           Transaction?        @relation(fields: [transactionId], references: [id])
  
  @@index([reconciliationId])
  @@index([transactionId])
  @@index([type])
}

// Enhance BankStatement model
model BankStatementLine {
  id                String         @id @default(uuid())
  bankStatementId   String
  transactionDate   DateTime
  description       String
  amount            Float
  balance           Float
  transactionType   String         // 'DEBIT', 'CREDIT'
  reference         String?
  isMatched         Boolean        @default(false)
  matchedTransactionId String?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  
  BankStatement     BankStatement  @relation(fields: [bankStatementId], references: [id], onDelete: Cascade)
  MatchedTransaction Transaction? @relation(fields: [matchedTransactionId], references: [id])
  
  @@index([bankStatementId])
  @@index([transactionDate])
  @@index([isMatched])
}


2. Create Enhanced Bank Reconciliation Service

TypeScript


@Injectable()
export class BankReconciliationService {
  constructor(private prisma: PrismaService) {}

  async performAutoReconciliation(
    accountId: string, 
    bankStatementId: string
  ): Promise<AutoReconciliationResultDto> {
    const bankLines = await this.getBankStatementLines(bankStatementId);
    const transactions = await this.getUnreconciledTransactions(accountId);
    
    const matches = [];
    const unmatchedBankLines = [];
    const unmatchedTransactions = [];

    // Auto-matching algorithm
    for (const bankLine of bankLines) {
      const matchingTransaction = this.findMatchingTransaction(bankLine, transactions);
      
      if (matchingTransaction) {
        matches.push({
          bankLineId: bankLine.id,
          transactionId: matchingTransaction.id,
          matchScore: this.calculateMatchScore(bankLine, matchingTransaction)
        });
        
        // Mark as matched
        await this.markAsMatched(bankLine.id, matchingTransaction.id);
      } else {
        unmatchedBankLines.push(bankLine);
      }
    }

    // Find unmatched transactions
    const matchedTransactionIds = matches.map(m => m.transactionId);
    unmatchedTransactions.push(
      ...transactions.filter(t => !matchedTransactionIds.includes(t.id))
    );

    return {
      totalMatches: matches.length,
      matches,
      unmatchedBankLines,
      unmatchedTransactions,
      reconciliationVariance: this.calculateVariance(matches)
    };
  }

  private findMatchingTransaction(
    bankLine: BankStatementLine, 
    transactions: Transaction[]
  ): Transaction | null {
    // Exact amount and date match
    let match = transactions.find(t => 
      Math.abs(t.amount - Math.abs(bankLine.amount)) < 0.01 &&
      this.isSameDate(t.date, bankLine.transactionDate)
    );

    if (match) return match;

    // Amount match within 3 days
    match = transactions.find(t => 
      Math.abs(t.amount - Math.abs(bankLine.amount)) < 0.01 &&
      this.isWithinDays(t.date, bankLine.transactionDate, 3)
    );

    if (match) return match;

    // Fuzzy description match with exact amount
    match = transactions.find(t => 
      Math.abs(t.amount - Math.abs(bankLine.amount)) < 0.01 &&
      this.calculateDescriptionSimilarity(t.description, bankLine.description) > 0.8
    );

    return match;
  }

  async createReconciliation(data: CreateReconciliationDto): Promise<BankReconciliation> {
    const bookBalance = await this.calculateBookBalance(data.accountId, data.reconciliationDate);
    
    return this.prisma.bankReconciliation.create({
      data: {
        ...data,
        bookBalance,
        adjustedBalance: this.calculateAdjustedBalance(bookBalance, data.statementBalance)
      },
      include: {
        ReconciliationItems: true,
        Account: true
      }
    });
  }

  private calculateAdjustedBalance(bookBalance: number, statementBalance: number): number {
    // Calculate adjusted balance considering outstanding items
    return bookBalance; // This would include logic for outstanding checks, deposits in transit, etc.
  }
}


Frontend Changes

1. Enhanced Bank Reconciliation Component

JSX


const BankReconciliation = () => {
  const [reconciliation, setReconciliation] = useState(null);
  const [bankLines, setBankLines] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');

  const performAutoReconciliation = async () => {
    try {
      setLoading(true);
      const result = await api.post('/bank-reconciliation/auto-match', {
        accountId: selectedAccount,
        bankStatementId: selectedBankStatement
      });
      
      setMatches(result.data.matches);
      setBankLines(result.data.unmatchedBankLines);
      setTransactions(result.data.unmatchedTransactions);
      
      toast.success(`Auto-matched ${result.data.totalMatches} transactions`);
    } catch (error) {
      toast.error('Auto-reconciliation failed');
    } finally {
      setLoading(false);
    }
  };

  const manualMatch = (bankLineId, transactionId) => {
    // Manual matching logic
    const newMatch = { bankLineId, transactionId, isManual: true };
    setMatches([...matches, newMatch]);
    
    // Remove from unmatched lists
    setBankLines(bankLines.filter(bl => bl.id !== bankLineId));
    setTransactions(transactions.filter(t => t.id !== transactionId));
  };

  return (
    <Box>
      <Heading>Bank Reconciliation</Heading>
      
      {/* Account and Statement Selection */}
      <HStack spacing={4} mb={6}>
        <Select 
          placeholder="Select Account"
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
        >
          {accounts.map(account => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>
        
        <Button onClick={performAutoReconciliation} colorScheme="blue">
          Auto Reconcile
        </Button>
      </HStack>

      {/* Reconciliation Summary */}
      <SimpleGrid columns={4} spacing={4} mb={6}>
        <Stat>
          <StatLabel>Book Balance</StatLabel>
          <StatNumber>{formatCurrency(reconciliation?.bookBalance || 0)}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Statement Balance</StatLabel>
          <StatNumber>{formatCurrency(reconciliation?.statementBalance || 0)}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Difference</StatLabel>
          <StatNumber color={getDifferenceColor()}>
            {formatCurrency(Math.abs((reconciliation?.bookBalance || 0) - (reconciliation?.statementBalance || 0)))}
          </StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Matched Items</StatLabel>
          <StatNumber>{matches.length}</StatNumber>
        </Stat>
      </SimpleGrid>

      {/* Matched Transactions */}
      <Box mb={6}>
        <Heading size="md" mb={4}>Matched Transactions</Heading>
        <Table>
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Description</Th>
              <Th>Bank Amount</Th>
              <Th>Book Amount</Th>
              <Th>Match Score</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {matches.map(match => (
              <Tr key={`${match.bankLineId}-${match.transactionId}`}>
                <Td>{formatDate(match.date)}</Td>
                <Td>{match.description}</Td>
                <Td>{formatCurrency(match.bankAmount)}</Td>
                <Td>{formatCurrency(match.bookAmount)}</Td>
                <Td>
                  <Badge colorScheme={getMatchScoreColor(match.matchScore)}>
                    {(match.matchScore * 100).toFixed(0)}%
                  </Badge>
                </Td>
                <Td>
                  <Button size="sm" onClick={() => unmatchTransaction(match)}>
                    Unmatch
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Unmatched Items - Side by Side */}
      <SimpleGrid columns={2} spacing={6}>
        <Box>
          <Heading size="md" mb={4}>Unmatched Bank Transactions</Heading>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Description</Th>
                <Th>Amount</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {bankLines.map(line => (
                <Tr key={line.id}>
                  <Td>{formatDate(line.transactionDate)}</Td>
                  <Td>{line.description}</Td>
                  <Td>{formatCurrency(line.amount)}</Td>
                  <Td>
                    <Button size="xs" onClick={() => createTransactionFromBankLine(line)}>
                      Create Transaction
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Box>
          <Heading size="md" mb={4}>Unmatched Book Transactions</Heading>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Description</Th>
                <Th>Amount</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {transactions.map(transaction => (
                <Tr key={transaction.id}>
                  <Td>{formatDate(transaction.date)}</Td>
                  <Td>{transaction.description}</Td>
                  <Td>{formatCurrency(transaction.amount)}</Td>
                  <Td>
                    <Button size="xs" onClick={() => markAsOutstanding(transaction)}>
                      Mark Outstanding
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </SimpleGrid>
    </Box>
  );
};


Task Group 2: Period Closing and Adjustments

Backend Changes

1. Add Period Closing Models

Plain Text


model AccountingPeriod {
  id              String           @id @default(uuid())
  businessId      String
  periodName      String           // "January 2024", "Q1 2024", etc.
  startDate       DateTime
  endDate         DateTime
  status          String           @default("OPEN") // OPEN, CLOSED, LOCKED
  closedBy        String?
  closedAt        DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  
  Business        Business         @relation(fields: [businessId], references: [id])
  ClosedBy        User?            @relation(fields: [closedBy], references: [id])
  AdjustingEntries JournalEntry[]  @relation("PeriodAdjustments")
  
  @@unique([businessId, startDate, endDate])
  @@index([businessId])
  @@index([status])
}

// Add period reference to JournalEntry
model JournalEntry {
  // ... existing fields
  accountingPeriodId String?
  isAdjusting        Boolean          @default(false)
  isClosing          Boolean          @default(false)
  
  AccountingPeriod   AccountingPeriod? @relation("PeriodAdjustments", fields: [accountingPeriodId], references: [id])
}


2. Create Period Closing Service

TypeScript


@Injectable()
export class PeriodClosingService {
  constructor(
    private prisma: PrismaService,
    private journalEntryService: JournalEntryService
  ) {}

  async closePeriod(
    businessId: string, 
    periodEndDate: Date,
    adjustingEntries?: CreateJournalEntryDto[]
  ): Promise<AccountingPeriod> {
    // Create accounting period
    const period = await this.prisma.accountingPeriod.create({
      data: {
        businessId,
        periodName: this.generatePeriodName(periodEndDate),
        startDate: this.calculatePeriodStart(periodEndDate),
        endDate: periodEndDate,
        status: 'OPEN'
      }
    });

    // Process adjusting entries
    if (adjustingEntries?.length) {
      for (const entry of adjustingEntries) {
        await this.journalEntryService.createJournalEntry({
          ...entry,
          isAdjusting: true,
          accountingPeriodId: period.id
        });
      }
    }

    // Create closing entries
    await this.createClosingEntries(businessId, period.id, periodEndDate);

    // Mark period as closed
    return this.prisma.accountingPeriod.update({
      where: { id: period.id },
      data: { 
        status: 'CLOSED',
        closedAt: new Date()
      }
    });
  }

  private async createClosingEntries(
    businessId: string, 
    periodId: string, 
    periodEndDate: Date
  ): Promise<void> {
    // Get revenue and expense account balances
    const revenueAccounts = await this.getAccountBalancesByType(businessId, 'REVENUE', periodEndDate);
    const expenseAccounts = await this.getAccountBalancesByType(businessId, 'EXPENSE', periodEndDate);

    // Calculate net income
    const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const netIncome = totalRevenue - totalExpenses;

    // Close revenue accounts
    if (totalRevenue > 0) {
      const revenueClosingLines = revenueAccounts.map(acc => ({
        accountId: acc.id,
        debitAmount: acc.balance,
        creditAmount: 0,
        description: 'Closing revenue accounts'
      }));

      revenueClosingLines.push({
        accountId: await this.getIncomeSummaryAccountId(businessId),
        debitAmount: 0,
        creditAmount: totalRevenue,
        description: 'Closing revenue accounts'
      });

      await this.journalEntryService.createJournalEntry({
        date: periodEndDate,
        description: 'Close revenue accounts',
        lines: revenueClosingLines,
        isClosing: true,
        accountingPeriodId: periodId
      });
    }

    // Close expense accounts
    if (totalExpenses > 0) {
      const expenseClosingLines = expenseAccounts.map(acc => ({
        accountId: acc.id,
        debitAmount: 0,
        creditAmount: acc.balance,
        description: 'Closing expense accounts'
      }));

      expenseClosingLines.push({
        accountId: await this.getIncomeSummaryAccountId(businessId),
        debitAmount: totalExpenses,
        creditAmount: 0,
        description: 'Closing expense accounts'
      });

      await this.journalEntryService.createJournalEntry({
        date: periodEndDate,
        description: 'Close expense accounts',
        lines: expenseClosingLines,
        isClosing: true,
        accountingPeriodId: periodId
      });
    }

    // Close income summary to retained earnings
    if (netIncome !== 0) {
      await this.journalEntryService.createJournalEntry({
        date: periodEndDate,
        description: 'Close income summary to retained earnings',
        lines: [
          {
            accountId: await this.getIncomeSummaryAccountId(businessId),
            debitAmount: netIncome > 0 ? netIncome : 0,
            creditAmount: netIncome < 0 ? Math.abs(netIncome) : 0,
            description: 'Close income summary'
          },
          {
            accountId: await this.getRetainedEarningsAccountId(businessId),
            debitAmount: netIncome < 0 ? Math.abs(netIncome) : 0,
            creditAmount: netIncome > 0 ? netIncome : 0,
            description: 'Transfer to retained earnings'
          }
        ],
        isClosing: true,
        accountingPeriodId: periodId
      });
    }
  }

  async createAdjustingEntry(data: CreateAdjustingEntryDto): Promise<JournalEntry> {
    return this.journalEntryService.createJournalEntry({
      ...data,
      isAdjusting: true,
      description: `Adjusting Entry: ${data.description}`
    });
  }

  // Common adjusting entries
  async createDepreciationEntry(
    assetAccountId: string,
    depreciationExpenseAccountId: string,
    accumulatedDepreciationAccountId: string,
    amount: number,
    date: Date
  ): Promise<JournalEntry> {
    return this.createAdjustingEntry({
      date,
      description: 'Monthly depreciation expense',
      lines: [
        {
          accountId: depreciationExpenseAccountId,
          debitAmount: amount,
          creditAmount: 0,
          description: 'Depreciation expense'
        },
        {
          accountId: accumulatedDepreciationAccountId,
          debitAmount: 0,
          creditAmount: amount,
          description: 'Accumulated depreciation'
        }
      ]
    });
  }

  async createAccrualEntry(
    expenseAccountId: string,
    payableAccountId: string,
    amount: number,
    date: Date,
    description: string
  ): Promise<JournalEntry> {
    return this.createAdjustingEntry({
      date,
      description: `Accrued ${description}`,
      lines: [
        {
          accountId: expenseAccountId,
          debitAmount: amount,
          creditAmount: 0,
          description: `Accrued ${description}`
        },
        {
          accountId: payableAccountId,
          debitAmount: 0,
          creditAmount: amount,
          description: `Accrued ${description} payable`
        }
      ]
    });
  }
}


Task Group 3: Tax Management System

Backend Changes

1. Add Tax Models

Plain Text


model TaxRate {
  id          String   @id @default(uuid())
  name        String   // "GST", "VAT", "Sales Tax"
  rate        Float    // 18.0 for 18%
  type        String   // "SALES", "PURCHASE", "PAYROLL"
  isActive    Boolean  @default(true)
  effectiveFrom DateTime
  effectiveTo   DateTime?
  businessId  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  Business    Business? @relation(fields: [businessId], references: [id])
  
  @@index([businessId])
  @@index([type])
  @@index([isActive])
}

model TaxTransaction {
  id              String   @id @default(uuid())
  transactionId   String
  taxRateId       String
  taxableAmount   Float
  taxAmount       Float
  taxType         String   // "GST", "TDS", "VAT"
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  Transaction     Transaction @relation(fields: [transactionId], references: [id])
  TaxRate         TaxRate     @relation(fields: [taxRateId], references: [id])
  
  @@index([transactionId])
  @@index([taxRateId])
  @@index([taxType])
}


2. Create Tax Calculation Service

TypeScript


@Injectable()
export class TaxCalculationService {
  constructor(private prisma: PrismaService) {}

  async calculateTax(
    amount: number,
    taxType: string,
    businessId?: string
  ): Promise<TaxCalculationDto> {
    const taxRate = await this.getApplicableTaxRate(taxType, businessId);
    
    if (!taxRate) {
      return {
        taxableAmount: amount,
        taxAmount: 0,
        taxRate: 0,
        totalAmount: amount
      };
    }

    const taxAmount = (amount * taxRate.rate) / 100;
    
    return {
      taxableAmount: amount,
      taxAmount,
      taxRate: taxRate.rate,
      totalAmount: amount + taxAmount,
      taxRateId: taxRate.id
    };
  }

  async createTaxTransaction(
    transactionId: string,
    taxCalculation: TaxCalculationDto
  ): Promise<TaxTransaction> {
    return this.prisma.taxTransaction.create({
      data: {
        transactionId,
        taxRateId: taxCalculation.taxRateId,
        taxableAmount: taxCalculation.taxableAmount,
        taxAmount: taxCalculation.taxAmount,
        taxType: taxCalculation.taxType
      }
    });
  }

  async generateTaxReport(
    businessId: string,
    fromDate: Date,
    toDate: Date,
    taxType?: string
  ): Promise<TaxReportDto> {
    const taxTransactions = await this.prisma.taxTransaction.findMany({
      where: {
        Transaction: {
          businessId,
          date: {
            gte: fromDate,
            lte: toDate
          }
        },
        ...(taxType && { taxType })
      },
      include: {
        Transaction: true,
        TaxRate: true
      }
    });

    const summary = taxTransactions.reduce((acc, tx) => {
      acc.totalTaxableAmount += tx.taxableAmount;
      acc.totalTaxAmount += tx.taxAmount;
      return acc;
    }, { totalTaxableAmount: 0, totalTaxAmount: 0 });

    return {
      fromDate,
      toDate,
      taxType,
      transactions: taxTransactions,
      summary
    };
  }

  private async getApplicableTaxRate(
    taxType: string,
    businessId?: string
  ): Promise<TaxRate | null> {
    return this.prisma.taxRate.findFirst({
      where: {
        type: taxType,
        isActive: true,
        effectiveFrom: { lte: new Date() },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } }
        ],
        OR: [
          { businessId },
          { businessId: null } // Global tax rates
        ]
      },
      orderBy: [
        { businessId: 'desc' }, // Prefer business-specific rates
        { effectiveFrom: 'desc' }
      ]
    });
  }
}


Frontend Changes

1. Tax Configuration Component

JSX


const TaxConfiguration = () => {
  const [taxRates, setTaxRates] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState(null);

  const taxRateSchema = Yup.object().shape({
    name: Yup.string().required('Tax name is required'),
    rate: Yup.number().min(0).max(100).required('Tax rate is required'),
    type: Yup.string().required('Tax type is required'),
    effectiveFrom: Yup.date().required('Effective date is required')
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      rate: 0,
      type: 'SALES',
      effectiveFrom: new Date(),
      effectiveTo: null
    },
    validationSchema: taxRateSchema,
    onSubmit: async (values) => {
      try {
        if (editingTaxRate) {
          await api.put(`/tax-rates/${editingTaxRate.id}`, values);
          toast.success('Tax rate updated successfully');
        } else {
          await api.post('/tax-rates', values);
          toast.success('Tax rate created successfully');
        }
        
        setIsFormOpen(false);
        fetchTaxRates();
      } catch (error) {
        toast.error('Failed to save tax rate');
      }
    }
  });

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Tax Configuration</Heading>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue"
          onClick={() => setIsFormOpen(true)}
        >
          Add Tax Rate
        </Button>
      </Flex>

      <Table>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Rate (%)</Th>
            <Th>Type</Th>
            <Th>Effective From</Th>
            <Th>Effective To</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {taxRates.map(taxRate => (
            <Tr key={taxRate.id}>
              <Td>{taxRate.name}</Td>
              <Td>{taxRate.rate}%</Td>
              <Td>
                <Badge colorScheme={getTaxTypeColor(taxRate.type)}>
                  {taxRate.type}
                </Badge>
              </Td>
              <Td>{formatDate(taxRate.effectiveFrom)}</Td>
              <Td>{taxRate.effectiveTo ? formatDate(taxRate.effectiveTo) : 'Ongoing'}</Td>
              <Td>
                <Badge colorScheme={taxRate.isActive ? 'green' : 'red'}>
                  {taxRate.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </Td>
              <Td>
                <HStack>
                  <IconButton
                    size="sm"
                    icon={<EditIcon />}
                    onClick={() => editTaxRate(taxRate)}
                  />
                  <IconButton
                    size="sm"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => deleteTaxRate(taxRate.id)}
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Tax Rate Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <ModalContent>
          <ModalHeader>
            {editingTaxRate ? 'Edit Tax Rate' : 'Add Tax Rate'}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={formik.errors.name && formik.touched.name}>
                <FormLabel>Tax Name</FormLabel>
                <Input
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g., GST, VAT, Sales Tax"
                />
                <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formik.errors.rate && formik.touched.rate}>
                <FormLabel>Tax Rate (%)</FormLabel>
                <NumberInput
                  value={formik.values.rate}
                  onChange={(value) => formik.setFieldValue('rate', parseFloat(value) || 0)}
                  min={0}
                  max={100}
                  precision={2}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{formik.errors.rate}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formik.errors.type && formik.touched.type}>
                <FormLabel>Tax Type</FormLabel>
                <Select
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                >
                  <option value="SALES">Sales Tax</option>
                  <option value="PURCHASE">Purchase Tax</option>
                  <option value="PAYROLL">Payroll Tax</option>
                </Select>
                <FormErrorMessage>{formik.errors.type}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formik.errors.effectiveFrom && formik.touched.effectiveFrom}>
                <FormLabel>Effective From</FormLabel>
                <Input
                  type="date"
                  name="effectiveFrom"
                  value={formatDateForInput(formik.values.effectiveFrom)}
                  onChange={formik.handleChange}
                />
                <FormErrorMessage>{formik.errors.effectiveFrom}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Effective To (Optional)</FormLabel>
                <Input
                  type="date"
                  name="effectiveTo"
                  value={formik.values.effectiveTo ? formatDateForInput(formik.values.effectiveTo) : ''}
                  onChange={formik.handleChange}
                />
                <FormHelperText>Leave blank if this tax rate is ongoing</FormHelperText>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={formik.handleSubmit}>
              {editingTaxRate ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};


Expected Outcomes

After completing Phase 2:

•
✅ Enhanced bank reconciliation with auto-matching capabilities

•
✅ Period closing functionality with adjusting and closing entries

•
✅ Comprehensive tax management system

•
✅ Improved financial reporting with period-specific data

•
✅ Better cash flow management through accurate reconciliation

Testing Checklist




Upload bank statement and perform auto-reconciliation




Create adjusting entries for depreciation and accruals




Close an accounting period and verify closing entries




Configure tax rates and verify tax calculations




Generate tax reports for different periods




Verify financial statements reflect period closing adjustments

Action: Implement these enhancements systematically after completing Phase 1. These features significantly improve the professional capabilities of the FinT application.

