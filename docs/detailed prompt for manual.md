# Detailed Prompt for Cursor: Manual Transaction Entry System

## Objective
Implement a comprehensive manual transaction entry system for the FinT accounting application. This system should allow users to manually add transactions that were not captured from bank statements (cash transactions, adjustments, etc.) and automatically generate appropriate journal entries.

## Current State Analysis
The existing codebase has:
- Basic Transaction model in Prisma schema
- Transaction controller and service stubs
- User authentication system
- Business entity support

## Implementation Requirements

### 1. Backend Implementation

#### A. Update Transaction Model (if needed)
Ensure the Transaction model in `prisma/schema.prisma` includes all necessary fields:
```prisma
model Transaction {
  id              String   @id @default(uuid())
  date            DateTime
  description     String
  amount          Float
  category        String
  transactionType String   // 'income', 'expense', 'transfer', 'adjustment'
  paymentMethod   String?  // 'cash', 'check', 'bank_transfer', 'credit_card', 'other'
  reference       String?  // Reference number, check number, etc.
  notes           String?  // Additional notes
  userId          String
  businessId      String?
  accountId       String?  // Optional: link to specific account
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  User            User     @relation(fields: [userId], references: [id])
  Business        Business? @relation(fields: [businessId], references: [id])
  Account         Account? @relation(fields: [accountId], references: [id])

  @@index([category])
  @@index([date])
  @@index([transactionType])
  @@index([userId])
  @@index([businessId])
}
```

#### B. Enhance Transaction Service
Update `src/transactions/transactions.service.ts` to include:

1. **Create Transaction Method**:
   ```typescript
   async createTransaction(createTransactionDto: CreateTransactionDto, userId: string): Promise<Transaction> {
     // Validate input
     // Create transaction record
     // Generate corresponding journal entries
     // Return created transaction
   }
   ```

2. **Transaction Categories Management**:
   ```typescript
   async getTransactionCategories(userId: string): Promise<string[]> {
     // Return predefined categories + user custom categories
   }
   ```

3. **Journal Entry Generation**:
   ```typescript
   async generateJournalEntriesForTransaction(transaction: Transaction): Promise<JournalEntry[]> {
     // Use AccountMappingService to determine appropriate accounts
     // Create double-entry journal entries
     // Handle different transaction types (income, expense, transfer)
   }
   ```

#### C. Create DTOs
Create `src/transactions/dto/create-transaction.dto.ts`:
```typescript
export class CreateTransactionDto {
  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsEnum(['income', 'expense', 'transfer', 'adjustment'])
  transactionType: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  businessId?: string;

  @IsOptional()
  @IsString()
  accountId?: string;
}
```

#### D. Update Transaction Controller
Enhance `src/transactions/transactions.controller.ts`:
```typescript
@Post()
async createTransaction(
  @Body() createTransactionDto: CreateTransactionDto,
  @Req() request: Request,
) {
  return this.transactionsService.createTransaction(
    createTransactionDto,
    request.user.id
  );
}

@Get('categories')
async getCategories(@Req() request: Request) {
  return this.transactionsService.getTransactionCategories(request.user.id);
}

@Get()
async getTransactions(
  @Query() query: GetTransactionsQueryDto,
  @Req() request: Request,
) {
  return this.transactionsService.getTransactions(query, request.user.id);
}
```

### 2. Frontend Implementation

#### A. Create Transaction Entry Form Component
Create a React component for manual transaction entry with:

1. **Form Fields**:
   - Date picker
   - Description input
   - Amount input (with currency formatting)
   - Category dropdown (with autocomplete)
   - Transaction type selection
   - Payment method dropdown
   - Reference number input
   - Notes textarea
   - Business selection (if user has multiple businesses)

2. **Validation**:
   - Required field validation
   - Amount validation (positive numbers)
   - Date validation
   - Real-time form validation feedback

3. **User Experience**:
   - Auto-save draft functionality
   - Quick category suggestions based on description
   - Duplicate transaction detection
   - Success/error notifications

#### B. Transaction List Component
Create a component to display and manage transactions:

1. **Features**:
   - Paginated transaction list
   - Search and filter functionality
   - Sort by date, amount, category
   - Edit/delete transactions
   - Bulk operations

2. **Display**:
   - Transaction cards/rows with key information
   - Color coding by transaction type
   - Status indicators
   - Quick action buttons

#### C. Dashboard Integration
Add transaction entry widgets to the main dashboard:
- Quick add transaction button
- Recent transactions summary
- Transaction statistics

### 3. Integration Points

#### A. Account Mapping Integration
- Use the AccountMappingService to automatically suggest accounts
- Allow users to create new mapping rules from the transaction form
- Provide account suggestions based on transaction description

#### B. Business Context
- Filter transactions by selected business
- Ensure proper business-level permissions
- Handle multi-business scenarios

#### C. Journal Entry Generation
- Automatically create journal entries for each manual transaction
- Show preview of journal entries before saving
- Allow advanced users to modify journal entries

### 4. Advanced Features

#### A. Transaction Templates
- Allow users to save frequently used transactions as templates
- Quick creation from templates
- Template management interface

#### B. Recurring Transactions
- Set up recurring transactions (monthly rent, utilities, etc.)
- Automatic generation with user approval
- Recurring transaction management

#### C. Import/Export
- CSV import for bulk transaction entry
- Export transactions to various formats
- Data validation and error handling for imports

#### D. Mobile Responsiveness
- Ensure all forms work well on mobile devices
- Touch-friendly interface
- Offline capability for transaction entry

### 5. Testing Requirements

#### A. Unit Tests
- Test transaction creation logic
- Test journal entry generation
- Test validation rules

#### B. Integration Tests
- Test API endpoints
- Test database operations
- Test business logic integration

#### C. Frontend Tests
- Test form validation
- Test user interactions
- Test responsive design

### 6. Security Considerations

#### A. Authorization
- Ensure users can only access their own transactions
- Implement proper business-level permissions
- Validate all inputs server-side

#### B. Data Validation
- Sanitize all user inputs
- Validate business logic constraints
- Prevent SQL injection and XSS

### 7. Performance Optimization

#### A. Database Optimization
- Proper indexing on frequently queried fields
- Efficient pagination for large datasets
- Query optimization for complex filters

#### B. Frontend Optimization
- Lazy loading for large transaction lists
- Debounced search functionality
- Optimistic updates for better UX

## Implementation Priority

1. **Phase 1**: Basic transaction CRUD operations
2. **Phase 2**: Journal entry generation integration
3. **Phase 3**: Frontend form and list components
4. **Phase 4**: Advanced features (templates, recurring)
5. **Phase 5**: Mobile optimization and testing

## Success Criteria

- Users can manually enter transactions with all required fields
- Journal entries are automatically generated for each transaction
- Frontend provides intuitive and responsive interface
- All transactions are properly validated and secured
- Integration with existing account mapping system works seamlessly
- Performance is acceptable for large numbers of transactions

## Files to Modify/Create

### Backend:
- `src/transactions/transactions.service.ts` (enhance)
- `src/transactions/transactions.controller.ts` (enhance)
- `src/transactions/dto/create-transaction.dto.ts` (create)
- `src/transactions/dto/update-transaction.dto.ts` (create)
- `src/transactions/dto/get-transactions-query.dto.ts` (create)
- `prisma/schema.prisma` (update if needed)

### Frontend:
- `src/components/transactions/TransactionForm.tsx` (create)
- `src/components/transactions/TransactionList.tsx` (create)
- `src/components/transactions/TransactionCard.tsx` (create)
- `src/pages/TransactionsPage.tsx` (create)
- `src/hooks/useTransactions.ts` (create)
- `src/services/transactionService.ts` (create)

This implementation will provide a robust manual transaction entry system that integrates seamlessly with the existing accounting infrastructure.

