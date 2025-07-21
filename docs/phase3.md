Cursor Prompt: Phase 3 - Advanced Features and Integrations

Goal

Implement advanced features that transform FinT into a comprehensive business management platform with inventory management, advanced reporting, integrations, and enhanced security.

Task Group 1: Inventory Management System

Backend Changes

1. Add Inventory Models

Plain Text


model InventoryItem {
  id                String              @id @default(uuid())
  sku               String              @unique
  name              String
  description       String?
  category          String?
  unitOfMeasure     String              @default("EACH")
  costMethod        String              @default("FIFO") // FIFO, LIFO, AVERAGE
  reorderLevel      Float               @default(0)
  reorderQuantity   Float               @default(0)
  isActive          Boolean             @default(true)
  businessId        String
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  
  Business          Business            @relation(fields: [businessId], references: [id])
  InventoryLevels   InventoryLevel[]
  InventoryMovements InventoryMovement[]
  PurchaseOrderItems PurchaseOrderItem[]
  SalesOrderItems   SalesOrderItem[]
  
  @@index([businessId])
  @@index([sku])
  @@index([category])
}

model InventoryLevel {
  id              String        @id @default(uuid())
  itemId          String
  locationId      String?
  quantityOnHand  Float         @default(0)
  quantityReserved Float        @default(0)
  quantityAvailable Float       @default(0)
  averageCost     Float         @default(0)
  totalValue      Float         @default(0)
  lastUpdated     DateTime      @default(now())
  
  Item            InventoryItem @relation(fields: [itemId], references: [id])
  Location        Location?     @relation(fields: [locationId], references: [id])
  
  @@unique([itemId, locationId])
  @@index([itemId])
  @@index([locationId])
}

model InventoryMovement {
  id              String        @id @default(uuid())
  itemId          String
  locationId      String?
  movementType    String        // IN, OUT, TRANSFER, ADJUSTMENT
  quantity        Float
  unitCost        Float?
  totalCost       Float?
  referenceType   String?       // PURCHASE, SALE, TRANSFER, ADJUSTMENT
  referenceId     String?
  description     String?
  movementDate    DateTime      @default(now())
  userId          String
  businessId      String
  createdAt       DateTime      @default(now())
  
  Item            InventoryItem @relation(fields: [itemId], references: [id])
  Location        Location?     @relation(fields: [locationId], references: [id])
  User            User          @relation(fields: [userId], references: [id])
  Business        Business      @relation(fields: [businessId], references: [id])
  
  @@index([itemId])
  @@index([movementDate])
  @@index([movementType])
  @@index([businessId])
}

model Location {
  id              String            @id @default(uuid())
  name            String
  code            String            @unique
  type            String            @default("WAREHOUSE") // WAREHOUSE, STORE, OUTLET
  address         String?
  isActive        Boolean           @default(true)
  businessId      String
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  Business        Business          @relation(fields: [businessId], references: [id])
  InventoryLevels InventoryLevel[]
  InventoryMovements InventoryMovement[]
  
  @@index([businessId])
  @@index([code])
}

// Enhanced Invoice and Bill models for inventory
model InvoiceItem {
  // ... existing fields
  inventoryItemId String?
  quantityShipped Float?
  
  InventoryItem   InventoryItem? @relation(fields: [inventoryItemId], references: [id])
}

model BillItem {
  // ... existing fields
  inventoryItemId String?
  quantityReceived Float?
  
  InventoryItem   InventoryItem? @relation(fields: [inventoryItemId], references: [id])
}


2. Create Inventory Management Service

TypeScript


@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private journalEntryService: JournalEntryService
  ) {}

  async createInventoryItem(data: CreateInventoryItemDto): Promise<InventoryItem> {
    const item = await this.prisma.inventoryItem.create({
      data: {
        ...data,
        sku: data.sku || await this.generateSKU(data.businessId)
      }
    });

    // Create initial inventory level
    await this.prisma.inventoryLevel.create({
      data: {
        itemId: item.id,
        quantityOnHand: 0,
        quantityAvailable: 0,
        averageCost: 0,
        totalValue: 0
      }
    });

    return item;
  }

  async recordInventoryMovement(data: CreateInventoryMovementDto): Promise<InventoryMovement> {
    const movement = await this.prisma.inventoryMovement.create({ data });
    
    // Update inventory levels
    await this.updateInventoryLevels(movement);
    
    // Create journal entries for inventory valuation
    await this.createInventoryJournalEntries(movement);
    
    return movement;
  }

  private async updateInventoryLevels(movement: InventoryMovement): Promise<void> {
    const currentLevel = await this.prisma.inventoryLevel.findUnique({
      where: {
        itemId_locationId: {
          itemId: movement.itemId,
          locationId: movement.locationId
        }
      }
    });

    if (!currentLevel) {
      throw new Error('Inventory level not found');
    }

    let newQuantity = currentLevel.quantityOnHand;
    let newValue = currentLevel.totalValue;
    let newAverageCost = currentLevel.averageCost;

    if (movement.movementType === 'IN') {
      // Receiving inventory
      newQuantity += movement.quantity;
      
      if (movement.unitCost) {
        // Update average cost using weighted average
        const totalCost = newValue + (movement.quantity * movement.unitCost);
        newAverageCost = newQuantity > 0 ? totalCost / newQuantity : 0;
        newValue = totalCost;
      }
    } else if (movement.movementType === 'OUT') {
      // Issuing inventory
      if (newQuantity < movement.quantity) {
        throw new Error('Insufficient inventory quantity');
      }
      
      newQuantity -= movement.quantity;
      newValue = newQuantity * newAverageCost;
    }

    await this.prisma.inventoryLevel.update({
      where: {
        itemId_locationId: {
          itemId: movement.itemId,
          locationId: movement.locationId
        }
      },
      data: {
        quantityOnHand: newQuantity,
        quantityAvailable: newQuantity - currentLevel.quantityReserved,
        averageCost: newAverageCost,
        totalValue: newValue,
        lastUpdated: new Date()
      }
    });
  }

  private async createInventoryJournalEntries(movement: InventoryMovement): Promise<void> {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: movement.itemId },
      include: { Business: true }
    });

    if (!item || !movement.totalCost) return;

    const inventoryAssetAccountId = await this.getInventoryAssetAccountId(item.businessId);
    
    if (movement.movementType === 'IN' && movement.referenceType === 'PURCHASE') {
      // Debit Inventory Asset, Credit Accounts Payable (handled in purchase processing)
      await this.journalEntryService.createJournalEntry({
        date: movement.movementDate,
        description: `Inventory receipt: ${item.name}`,
        lines: [
          {
            accountId: inventoryAssetAccountId,
            debitAmount: movement.totalCost,
            creditAmount: 0,
            description: `Received ${movement.quantity} units of ${item.name}`
          }
          // Credit side handled in purchase order processing
        ],
        businessId: item.businessId,
        userId: movement.userId
      });
    } else if (movement.movementType === 'OUT' && movement.referenceType === 'SALE') {
      // Credit Inventory Asset, Debit Cost of Goods Sold
      const cogsAccountId = await this.getCOGSAccountId(item.businessId);
      
      await this.journalEntryService.createJournalEntry({
        date: movement.movementDate,
        description: `Cost of goods sold: ${item.name}`,
        lines: [
          {
            accountId: cogsAccountId,
            debitAmount: movement.totalCost,
            creditAmount: 0,
            description: `COGS for ${movement.quantity} units of ${item.name}`
          },
          {
            accountId: inventoryAssetAccountId,
            debitAmount: 0,
            creditAmount: movement.totalCost,
            description: `Inventory reduction for ${item.name}`
          }
        ],
        businessId: item.businessId,
        userId: movement.userId
      });
    }
  }

  async getInventoryValuation(businessId: string, asOfDate?: Date): Promise<InventoryValuationDto[]> {
    const whereClause = asOfDate ? 
      { Business: { id: businessId }, createdAt: { lte: asOfDate } } :
      { Business: { id: businessId } };

    const items = await this.prisma.inventoryItem.findMany({
      where: whereClause,
      include: {
        InventoryLevels: true
      }
    });

    return items.map(item => ({
      itemId: item.id,
      sku: item.sku,
      name: item.name,
      quantityOnHand: item.InventoryLevels.reduce((sum, level) => sum + level.quantityOnHand, 0),
      averageCost: item.InventoryLevels[0]?.averageCost || 0,
      totalValue: item.InventoryLevels.reduce((sum, level) => sum + level.totalValue, 0)
    }));
  }

  async generateLowStockReport(businessId: string): Promise<LowStockReportDto[]> {
    return this.prisma.inventoryItem.findMany({
      where: {
        businessId,
        isActive: true,
        InventoryLevels: {
          some: {
            quantityAvailable: {
              lte: this.prisma.inventoryItem.fields.reorderLevel
            }
          }
        }
      },
      include: {
        InventoryLevels: true
      }
    });
  }

  private async generateSKU(businessId: string): Promise<string> {
    const count = await this.prisma.inventoryItem.count({ where: { businessId } });
    return `SKU${(count + 1).toString().padStart(6, '0')}`;
  }
}


Frontend Changes

1. Inventory Management Dashboard

JSX


const InventoryDashboard = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [itemsResponse, lowStockResponse, valuationResponse] = await Promise.all([
        api.get('/inventory/items'),
        api.get('/inventory/low-stock'),
        api.get('/inventory/valuation')
      ]);
      
      setInventoryItems(itemsResponse.data);
      setLowStockItems(lowStockResponse.data);
      setInventoryValue(valuationResponse.data.reduce((sum, item) => sum + item.totalValue, 0));
    } catch (error) {
      toast.error('Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Inventory Management</Heading>
        <HStack>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={() => setIsItemFormOpen(true)}>
            Add Item
          </Button>
          <Button leftIcon={<DownloadIcon />} onClick={exportInventoryReport}>
            Export Report
          </Button>
        </HStack>
      </Flex>

      {/* Inventory Summary Cards */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
        <Stat>
          <StatLabel>Total Items</StatLabel>
          <StatNumber>{inventoryItems.length}</StatNumber>
          <StatHelpText>Active inventory items</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Total Value</StatLabel>
          <StatNumber>{formatCurrency(inventoryValue)}</StatNumber>
          <StatHelpText>Current inventory value</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Low Stock Items</StatLabel>
          <StatNumber color="red.500">{lowStockItems.length}</StatNumber>
          <StatHelpText>Items below reorder level</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Locations</StatLabel>
          <StatNumber>3</StatNumber>
          <StatHelpText>Active locations</StatHelpText>
        </Stat>
      </SimpleGrid>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Alert status="warning" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>Low Stock Alert!</AlertTitle>
            <AlertDescription>
              {lowStockItems.length} items are below their reorder level.
              <Button size="sm" ml={2} onClick={() => setShowLowStockModal(true)}>
                View Details
              </Button>
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Inventory Items Table */}
      <Card>
        <CardHeader>
          <Heading size="md">Inventory Items</Heading>
        </CardHeader>
        <CardBody>
          <Table>
            <Thead>
              <Tr>
                <Th>SKU</Th>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th>Qty on Hand</Th>
                <Th>Avg Cost</Th>
                <Th>Total Value</Th>
                <Th>Reorder Level</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {inventoryItems.map(item => (
                <Tr key={item.id}>
                  <Td fontFamily="mono">{item.sku}</Td>
                  <Td>{item.name}</Td>
                  <Td>
                    <Badge colorScheme="blue">{item.category}</Badge>
                  </Td>
                  <Td>{item.quantityOnHand}</Td>
                  <Td>{formatCurrency(item.averageCost)}</Td>
                  <Td>{formatCurrency(item.totalValue)}</Td>
                  <Td>{item.reorderLevel}</Td>
                  <Td>
                    <Badge 
                      colorScheme={item.quantityOnHand <= item.reorderLevel ? 'red' : 'green'}
                    >
                      {item.quantityOnHand <= item.reorderLevel ? 'Low Stock' : 'In Stock'}
                    </Badge>
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton as={IconButton} icon={<ChevronDownIcon />} size="sm" />
                      <MenuList>
                        <MenuItem onClick={() => viewItemDetails(item)}>View Details</MenuItem>
                        <MenuItem onClick={() => editItem(item)}>Edit Item</MenuItem>
                        <MenuItem onClick={() => adjustInventory(item)}>Adjust Quantity</MenuItem>
                        <MenuItem onClick={() => viewMovements(item)}>View Movements</MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Box>
  );
};


Task Group 2: Advanced Reporting and Analytics

Backend Changes

1. Create Advanced Reporting Service

TypeScript


@Injectable()
export class AdvancedReportingService {
  constructor(private prisma: PrismaService) {}

  async generateCashFlowStatement(
    businessId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<CashFlowStatementDto> {
    // Operating Activities
    const operatingCashFlow = await this.calculateOperatingCashFlow(businessId, fromDate, toDate);
    
    // Investing Activities
    const investingCashFlow = await this.calculateInvestingCashFlow(businessId, fromDate, toDate);
    
    // Financing Activities
    const financingCashFlow = await this.calculateFinancingCashFlow(businessId, fromDate, toDate);

    const netCashFlow = operatingCashFlow.netCashFlow + 
                       investingCashFlow.netCashFlow + 
                       financingCashFlow.netCashFlow;

    return {
      fromDate,
      toDate,
      operatingActivities: operatingCashFlow,
      investingActivities: investingCashFlow,
      financingActivities: financingCashFlow,
      netCashFlow,
      beginningCashBalance: await this.getCashBalance(businessId, fromDate),
      endingCashBalance: await this.getCashBalance(businessId, toDate)
    };
  }

  async generateAgedReceivablesReport(
    businessId: string,
    asOfDate: Date
  ): Promise<AgedReceivablesDto[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        businessId,
        status: { in: ['SENT', 'OVERDUE'] },
        balanceAmount: { gt: 0 }
      },
      include: {
        Customer: true
      }
    });

    return invoices.map(invoice => {
      const daysOverdue = Math.floor(
        (asOfDate.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        customerId: invoice.customerId,
        customerName: invoice.Customer.name,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        amount: invoice.balanceAmount,
        daysOverdue,
        agingBucket: this.getAgingBucket(daysOverdue)
      };
    });
  }

  async generateProfitabilityAnalysis(
    businessId: string,
    fromDate: Date,
    toDate: Date,
    groupBy: 'CUSTOMER' | 'PRODUCT' | 'CATEGORY'
  ): Promise<ProfitabilityAnalysisDto[]> {
    // This would involve complex queries to calculate revenue and costs by different dimensions
    const query = `
      SELECT 
        ${this.getGroupByField(groupBy)} as groupName,
        SUM(revenue) as totalRevenue,
        SUM(costs) as totalCosts,
        (SUM(revenue) - SUM(costs)) as grossProfit,
        ((SUM(revenue) - SUM(costs)) / NULLIF(SUM(revenue), 0) * 100) as profitMargin
      FROM (
        -- Complex subquery to get revenue and costs by group
        ${this.buildProfitabilityQuery(businessId, fromDate, toDate, groupBy)}
      ) profit_data
      GROUP BY ${this.getGroupByField(groupBy)}
      ORDER BY grossProfit DESC
    `;

    return this.prisma.$queryRawUnsafe(query);
  }

  async generateBudgetVarianceReport(
    businessId: string,
    budgetId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<BudgetVarianceDto[]> {
    // Compare actual vs budgeted amounts by account
    const budgetLines = await this.prisma.budgetLine.findMany({
      where: { budgetId },
      include: { Account: true }
    });

    const variances = [];
    
    for (const budgetLine of budgetLines) {
      const actualAmount = await this.getActualAmount(
        budgetLine.accountId, 
        fromDate, 
        toDate
      );
      
      const variance = actualAmount - budgetLine.budgetedAmount;
      const variancePercent = budgetLine.budgetedAmount !== 0 ? 
        (variance / budgetLine.budgetedAmount) * 100 : 0;

      variances.push({
        accountId: budgetLine.accountId,
        accountName: budgetLine.Account.name,
        budgetedAmount: budgetLine.budgetedAmount,
        actualAmount,
        variance,
        variancePercent,
        status: this.getVarianceStatus(variancePercent)
      });
    }

    return variances;
  }

  async generateKPIDashboard(businessId: string): Promise<KPIDashboardDto> {
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const currentYear = new Date(currentMonth.getFullYear(), 0, 1);

    const [
      monthlyRevenue,
      monthlyExpenses,
      cashBalance,
      accountsReceivable,
      accountsPayable,
      inventoryValue
    ] = await Promise.all([
      this.getRevenueForPeriod(businessId, lastMonth, currentMonth),
      this.getExpensesForPeriod(businessId, lastMonth, currentMonth),
      this.getCashBalance(businessId, currentMonth),
      this.getAccountsReceivableBalance(businessId, currentMonth),
      this.getAccountsPayableBalance(businessId, currentMonth),
      this.getInventoryValue(businessId, currentMonth)
    ]);

    // Calculate ratios and trends
    const grossProfitMargin = monthlyRevenue > 0 ? 
      ((monthlyRevenue - monthlyExpenses) / monthlyRevenue) * 100 : 0;

    const currentRatio = accountsPayable > 0 ? 
      (cashBalance + accountsReceivable) / accountsPayable : 0;

    return {
      revenue: {
        current: monthlyRevenue,
        trend: await this.calculateTrend(businessId, 'REVENUE', 3), // 3-month trend
        target: await this.getBudgetTarget(businessId, 'REVENUE', currentMonth)
      },
      expenses: {
        current: monthlyExpenses,
        trend: await this.calculateTrend(businessId, 'EXPENSE', 3),
        target: await this.getBudgetTarget(businessId, 'EXPENSE', currentMonth)
      },
      profitMargin: {
        current: grossProfitMargin,
        trend: await this.calculateProfitMarginTrend(businessId, 3)
      },
      cashFlow: {
        current: cashBalance,
        trend: await this.calculateCashFlowTrend(businessId, 3)
      },
      receivables: {
        current: accountsReceivable,
        averageDaysToCollect: await this.calculateAverageDaysToCollect(businessId)
      },
      payables: {
        current: accountsPayable,
        averageDaysToPay: await this.calculateAverageDaysToPay(businessId)
      },
      inventory: {
        current: inventoryValue,
        turnoverRatio: await this.calculateInventoryTurnover(businessId, currentYear, currentMonth)
      },
      ratios: {
        currentRatio,
        quickRatio: (cashBalance + accountsReceivable) / accountsPayable,
        debtToEquityRatio: await this.calculateDebtToEquityRatio(businessId, currentMonth)
      }
    };
  }
}


Frontend Changes

1. Advanced Analytics Dashboard

JSX


const AnalyticsDashboard = () => {
  const [kpiData, setKpiData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(false);

  const fetchKPIData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/kpi-dashboard', {
        params: { businessId: selectedBusiness.id }
      });
      setKpiData(response.data);
    } catch (error) {
      toast.error('Failed to fetch KPI data');
    } finally {
      setLoading(false);
    }
  };

  const KPICard = ({ title, value, trend, target, format = 'currency' }) => (
    <Card>
      <CardBody>
        <Stat>
          <StatLabel>{title}</StatLabel>
          <StatNumber>
            {format === 'currency' ? formatCurrency(value) : 
             format === 'percentage' ? `${value.toFixed(1)}%` : 
             value.toLocaleString()}
          </StatNumber>
          <StatHelpText>
            <StatArrow type={trend >= 0 ? 'increase' : 'decrease'} />
            {Math.abs(trend).toFixed(1)}% vs last period
            {target && (
              <Text fontSize="xs" color="gray.500">
                Target: {format === 'currency' ? formatCurrency(target) : 
                        format === 'percentage' ? `${target.toFixed(1)}%` : 
                        target.toLocaleString()}
              </Text>
            )}
          </StatHelpText>
        </Stat>
      </CardBody>
    </Card>
  );

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Analytics Dashboard</Heading>
        <HStack>
          <Select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </Select>
          <Button onClick={fetchKPIData} isLoading={loading}>
            Refresh
          </Button>
        </HStack>
      </Flex>

      {kpiData && (
        <>
          {/* Revenue & Profitability KPIs */}
          <Box mb={8}>
            <Heading size="md" mb={4}>Revenue & Profitability</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <KPICard
                title="Monthly Revenue"
                value={kpiData.revenue.current}
                trend={kpiData.revenue.trend}
                target={kpiData.revenue.target}
              />
              <KPICard
                title="Monthly Expenses"
                value={kpiData.expenses.current}
                trend={kpiData.expenses.trend}
                target={kpiData.expenses.target}
              />
              <KPICard
                title="Gross Profit Margin"
                value={kpiData.profitMargin.current}
                trend={kpiData.profitMargin.trend}
                format="percentage"
              />
            </SimpleGrid>
          </Box>

          {/* Cash Flow & Liquidity KPIs */}
          <Box mb={8}>
            <Heading size="md" mb={4}>Cash Flow & Liquidity</Heading>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
              <KPICard
                title="Cash Balance"
                value={kpiData.cashFlow.current}
                trend={kpiData.cashFlow.trend}
              />
              <KPICard
                title="Accounts Receivable"
                value={kpiData.receivables.current}
                trend={0}
              />
              <KPICard
                title="Accounts Payable"
                value={kpiData.payables.current}
                trend={0}
              />
              <KPICard
                title="Current Ratio"
                value={kpiData.ratios.currentRatio}
                trend={0}
                format="number"
              />
            </SimpleGrid>
          </Box>

          {/* Charts Section */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
            <Card>
              <CardHeader>
                <Heading size="md">Revenue Trend</Heading>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={kpiData.revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Line type="monotone" dataKey="revenue" stroke="#3182ce" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke="#e53e3e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Heading size="md">Cash Flow</Heading>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={kpiData.cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="operating" fill="#38a169" />
                    <Bar dataKey="investing" fill="#3182ce" />
                    <Bar dataKey="financing" fill="#805ad5" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Financial Ratios */}
          <Card>
            <CardHeader>
              <Heading size="md">Financial Ratios</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Stat>
                  <StatLabel>Current Ratio</StatLabel>
                  <StatNumber>{kpiData.ratios.currentRatio.toFixed(2)}</StatNumber>
                  <StatHelpText>
                    <Badge colorScheme={kpiData.ratios.currentRatio >= 1.5 ? 'green' : 'yellow'}>
                      {kpiData.ratios.currentRatio >= 1.5 ? 'Good' : 'Monitor'}
                    </Badge>
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Quick Ratio</StatLabel>
                  <StatNumber>{kpiData.ratios.quickRatio.toFixed(2)}</StatNumber>
                  <StatHelpText>
                    <Badge colorScheme={kpiData.ratios.quickRatio >= 1.0 ? 'green' : 'yellow'}>
                      {kpiData.ratios.quickRatio >= 1.0 ? 'Good' : 'Monitor'}
                    </Badge>
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Debt-to-Equity</StatLabel>
                  <StatNumber>{kpiData.ratios.debtToEquityRatio.toFixed(2)}</StatNumber>
                  <StatHelpText>
                    <Badge colorScheme={kpiData.ratios.debtToEquityRatio <= 0.5 ? 'green' : 'yellow'}>
                      {kpiData.ratios.debtToEquityRatio <= 0.5 ? 'Good' : 'Monitor'}
                    </Badge>
                  </StatHelpText>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>
        </>
      )}
    </Box>
  );
};


Task Group 3: Integration Capabilities

Backend Changes

1. Create Integration Framework

TypeScript


// Base integration service
@Injectable()
export abstract class BaseIntegrationService {
  abstract authenticate(credentials: any): Promise<boolean>;
  abstract syncData(syncType: string, options?: any): Promise<SyncResultDto>;
  abstract validateConnection(): Promise<boolean>;
}

// Bank integration service
@Injectable()
export class BankIntegrationService extends BaseIntegrationService {
  constructor(private prisma: PrismaService) {
    super();
  }

  async authenticate(credentials: BankCredentialsDto): Promise<boolean> {
    // Implement bank API authentication
    // This would vary by bank and integration method
    try {
      const response = await this.callBankAPI('/auth', credentials);
      return response.success;
    } catch (error) {
      return false;
    }
  }

  async syncTransactions(
    accountId: string, 
    fromDate: Date, 
    toDate: Date
  ): Promise<SyncResultDto> {
    const transactions = await this.fetchBankTransactions(accountId, fromDate, toDate);
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const transaction of transactions) {
      try {
        const existing = await this.findExistingTransaction(transaction);
        
        if (existing) {
          skipped++;
          continue;
        }

        await this.createTransactionFromBankData(transaction);
        imported++;
      } catch (error) {
        errors++;
        console.error('Failed to import transaction:', error);
      }
    }

    return {
      totalProcessed: transactions.length,
      imported,
      skipped,
      errors,
      lastSyncDate: new Date()
    };
  }

  private async fetchBankTransactions(
    accountId: string, 
    fromDate: Date, 
    toDate: Date
  ): Promise<BankTransactionDto[]> {
    // Implementation would depend on specific bank API
    // This is a placeholder for the actual bank API call
    return [];
  }
}

// Payment gateway integration
@Injectable()
export class PaymentGatewayService {
  async processPayment(paymentData: ProcessPaymentDto): Promise<PaymentResultDto> {
    // Integrate with payment gateways like Stripe, PayPal, etc.
    try {
      const result = await this.callPaymentGateway(paymentData);
      
      if (result.success) {
        // Create payment record in database
        await this.recordPayment(paymentData, result);
        
        // Update invoice/bill status
        await this.updateInvoiceStatus(paymentData.invoiceId, 'PAID');
      }

      return result;
    } catch (error) {
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }

  async setupRecurringPayment(recurringData: RecurringPaymentDto): Promise<string> {
    // Set up recurring payments for subscriptions, rent, etc.
    const subscription = await this.createSubscription(recurringData);
    
    await this.prisma.recurringPayment.create({
      data: {
        subscriptionId: subscription.id,
        amount: recurringData.amount,
        frequency: recurringData.frequency,
        nextPaymentDate: recurringData.startDate,
        isActive: true,
        businessId: recurringData.businessId
      }
    });

    return subscription.id;
  }
}

// Email integration service
@Injectable()
export class EmailIntegrationService {
  async sendInvoice(invoiceId: string, recipientEmail: string): Promise<boolean> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        Customer: true,
        InvoiceItem: true,
        Business: true
      }
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Generate PDF invoice
    const pdfBuffer = await this.generateInvoicePDF(invoice);
    
    // Send email with attachment
    const emailResult = await this.sendEmail({
      to: recipientEmail,
      subject: `Invoice ${invoice.invoiceNumber} from ${invoice.Business.name}`,
      template: 'invoice',
      data: invoice,
      attachments: [
        {
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer
        }
      ]
    });

    // Log email activity
    await this.prisma.emailLog.create({
      data: {
        type: 'INVOICE',
        referenceId: invoiceId,
        recipient: recipientEmail,
        status: emailResult.success ? 'SENT' : 'FAILED',
        sentAt: new Date()
      }
    });

    return emailResult.success;
  }

  async sendPaymentReminder(invoiceId: string): Promise<boolean> {
    const invoice = await this.getOverdueInvoice(invoiceId);
    
    if (!invoice || !invoice.Customer.email) {
      return false;
    }

    return this.sendEmail({
      to: invoice.Customer.email,
      subject: `Payment Reminder - Invoice ${invoice.invoiceNumber}`,
      template: 'payment-reminder',
      data: {
        invoice,
        daysOverdue: Math.floor(
          (new Date().getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      }
    });
  }
}


Expected Outcomes

After completing Phase 3:

•
✅ Complete inventory management with FIFO/LIFO costing

•
✅ Advanced financial analytics and KPI dashboard

•
✅ Cash flow statement generation

•
✅ Aged receivables and payables reports

•
✅ Bank integration capabilities

•
✅ Payment gateway integration

•
✅ Automated email notifications

•
✅ Comprehensive business intelligence features

Testing Checklist




Create inventory items and record movements




Verify inventory valuation calculations




Generate advanced financial reports




Test KPI dashboard with real data




Set up bank integration and sync transactions




Process payments through payment gateway




Send invoices via email integration




Verify all integrations work correctly

Action: Implement these advanced features after completing Phases 1 and 2. These features position FinT as a comprehensive business management platform.

