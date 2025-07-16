# Detailed Prompt for Cursor: Business Entity Management and Chart of Accounts

## Objective
Implement comprehensive business entity management and a robust chart of accounts system for the FinT accounting application. This system should allow users to manage multiple businesses, create and organize accounts hierarchically, and provide standard accounting functionality.

## Current State Analysis
The existing codebase has:
- Basic Account model and CRUD operations
- Business model with multi-tenant support
- User-Business relationship model
- AccountHead and AccountCategory models
- Basic accounts service and controller

## Implementation Requirements

### 1. Business Entity Management Enhancement

#### A. Business Service Enhancement
Update `src/accounting/services/business.service.ts` (create if doesn't exist):

```typescript
@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  async createBusiness(createBusinessDto: CreateBusinessDto, ownerId: string): Promise<Business> {
    // Create business with owner
    // Set up default chart of accounts for the business
    // Create default business settings
  }

  async getBusinessesByUser(userId: string): Promise<Business[]> {
    // Get all businesses where user is owner or has access
  }

  async updateBusiness(id: string, updateBusinessDto: UpdateBusinessDto, userId: string): Promise<Business> {
    // Verify user has permission to update
    // Update business details
  }

  async deleteBusiness(id: string, userId: string): Promise<void> {
    // Verify user is owner
    // Check for existing transactions/data
    // Soft delete or prevent deletion if data exists
  }

  async addUserToBusiness(businessId: string, userId: string, role: string, ownerId: string): Promise<UserBusiness> {
    // Verify owner permissions
    // Add user to business with specified role
  }

  async removeUserFromBusiness(businessId: string, userId: string, ownerId: string): Promise<void> {
    // Verify owner permissions
    // Remove user from business
  }

  async getBusinessUsers(businessId: string, userId: string): Promise<UserBusiness[]> {
    // Verify user has access to business
    // Return all users associated with business
  }
}
```

#### B. Business Controller Enhancement
Update `src/accounting/controllers/business.controller.ts` (create if doesn't exist):

```typescript
@Controller('businesses')
@UseGuards(JwtAuthGuard)
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  async createBusiness(@Body() createBusinessDto: CreateBusinessDto, @Req() request: Request) {
    return this.businessService.createBusiness(createBusinessDto, request.user.id);
  }

  @Get()
  async getUserBusinesses(@Req() request: Request) {
    return this.businessService.getBusinessesByUser(request.user.id);
  }

  @Get(':id')
  async getBusiness(@Param('id') id: string, @Req() request: Request) {
    // Verify user has access to this business
    return this.businessService.findOne(id, request.user.id);
  }

  @Patch(':id')
  async updateBusiness(
    @Param('id') id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @Req() request: Request
  ) {
    return this.businessService.updateBusiness(id, updateBusinessDto, request.user.id);
  }

  @Delete(':id')
  async deleteBusiness(@Param('id') id: string, @Req() request: Request) {
    return this.businessService.deleteBusiness(id, request.user.id);
  }

  @Post(':id/users')
  async addUserToBusiness(
    @Param('id') businessId: string,
    @Body() addUserDto: AddUserToBusinessDto,
    @Req() request: Request
  ) {
    return this.businessService.addUserToBusiness(
      businessId,
      addUserDto.userId,
      addUserDto.role,
      request.user.id
    );
  }

  @Get(':id/users')
  async getBusinessUsers(@Param('id') businessId: string, @Req() request: Request) {
    return this.businessService.getBusinessUsers(businessId, request.user.id);
  }

  @Delete(':id/users/:userId')
  async removeUserFromBusiness(
    @Param('id') businessId: string,
    @Param('userId') userId: string,
    @Req() request: Request
  ) {
    return this.businessService.removeUserFromBusiness(businessId, userId, request.user.id);
  }
}
```

### 2. Chart of Accounts Implementation

#### A. Account Categories Service
Create `src/accounting/services/account-categories.service.ts`:

```typescript
@Injectable()
export class AccountCategoriesService {
  constructor(private prisma: PrismaService) {}

  async getStandardCategories(): Promise<AccountCategory[]> {
    // Return standard accounting categories (Assets, Liabilities, Equity, Income, Expenses)
  }

  async createCategory(createCategoryDto: CreateAccountCategoryDto): Promise<AccountCategory> {
    // Create custom account category
  }

  async updateCategory(id: string, updateCategoryDto: UpdateAccountCategoryDto): Promise<AccountCategory> {
    // Update account category
  }

  async deleteCategory(id: string): Promise<void> {
    // Delete category (check for existing accounts first)
  }
}
```

#### B. Account Heads Service
Create `src/accounting/services/account-heads.service.ts`:

```typescript
@Injectable()
export class AccountHeadsService {
  constructor(private prisma: PrismaService) {}

  async createStandardChartOfAccounts(businessId?: string): Promise<AccountHead[]> {
    // Create standard chart of accounts with common account heads
    const standardAccounts = [
      // Assets
      { code: '1000', name: 'Cash', categoryId: 'assets', type: 'asset' },
      { code: '1100', name: 'Accounts Receivable', categoryId: 'assets', type: 'asset' },
      { code: '1200', name: 'Inventory', categoryId: 'assets', type: 'asset' },
      { code: '1500', name: 'Equipment', categoryId: 'assets', type: 'asset' },
      
      // Liabilities
      { code: '2000', name: 'Accounts Payable', categoryId: 'liabilities', type: 'liability' },
      { code: '2100', name: 'Short-term Loans', categoryId: 'liabilities', type: 'liability' },
      { code: '2500', name: 'Long-term Debt', categoryId: 'liabilities', type: 'liability' },
      
      // Equity
      { code: '3000', name: 'Owner\'s Equity', categoryId: 'equity', type: 'equity' },
      { code: '3100', name: 'Retained Earnings', categoryId: 'equity', type: 'equity' },
      
      // Income
      { code: '4000', name: 'Sales Revenue', categoryId: 'income', type: 'income' },
      { code: '4100', name: 'Service Revenue', categoryId: 'income', type: 'income' },
      { code: '4900', name: 'Other Income', categoryId: 'income', type: 'income' },
      
      // Expenses
      { code: '5000', name: 'Cost of Goods Sold', categoryId: 'expenses', type: 'expense' },
      { code: '6000', name: 'Operating Expenses', categoryId: 'expenses', type: 'expense' },
      { code: '6100', name: 'Rent Expense', categoryId: 'expenses', type: 'expense' },
      { code: '6200', name: 'Utilities Expense', categoryId: 'expenses', type: 'expense' },
      { code: '6300', name: 'Office Supplies', categoryId: 'expenses', type: 'expense' },
      { code: '6400', name: 'Professional Services', categoryId: 'expenses', type: 'expense' },
    ];
    
    // Create accounts in database
  }

  async getAccountsByCategory(categoryId: string, businessId?: string): Promise<AccountHead[]> {
    // Get all accounts in a specific category
  }

  async createAccountHead(createAccountHeadDto: CreateAccountHeadDto): Promise<AccountHead> {
    // Create new account head with validation
  }

  async updateAccountHead(id: string, updateAccountHeadDto: UpdateAccountHeadDto): Promise<AccountHead> {
    // Update account head
  }

  async deleteAccountHead(id: string): Promise<void> {
    // Delete account head (check for transactions first)
  }

  async getAccountHierarchy(businessId?: string): Promise<any> {
    // Return accounts organized in hierarchical structure
  }
}
```

#### C. Enhanced Accounts Service
Update `src/accounting/services/accounts.service.ts`:

```typescript
@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async createAccount(createAccountDto: CreateAccountDto, userId: string): Promise<Account> {
    // Validate account code uniqueness within business
    // Create account with proper business association
    // Link to account head if specified
  }

  async getAccountsByBusiness(businessId: string, userId: string): Promise<Account[]> {
    // Verify user has access to business
    // Return all accounts for the business
  }

  async getAccountsHierarchy(businessId: string, userId: string): Promise<any> {
    // Return accounts organized by categories and hierarchy
  }

  async getTrialBalance(businessId: string, userId: string, asOfDate?: Date): Promise<any> {
    // Calculate trial balance for the business
    // Include all account balances as of specified date
  }

  async getAccountBalance(accountId: string, asOfDate?: Date): Promise<number> {
    // Calculate account balance from journal entries
  }

  async searchAccounts(query: string, businessId: string, userId: string): Promise<Account[]> {
    // Search accounts by name, code, or description
  }
}
```

### 3. DTOs and Validation

#### A. Business DTOs
Create `src/accounting/dto/business/`:

```typescript
// create-business.dto.ts
export class CreateBusinessDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsEnum(['sole_proprietorship', 'partnership', 'corporation', 'llc'])
  type: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  incorporationDate?: string;

  @IsOptional()
  @IsDateString()
  fiscalYearStart?: string;

  @IsOptional()
  @IsDateString()
  fiscalYearEnd?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUrl()
  website?: string;
}

// add-user-to-business.dto.ts
export class AddUserToBusinessDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(['ADMIN', 'BUSINESS_OWNER', 'ACCOUNTANT', 'VIEWER'])
  role: string;
}
```

#### B. Account Head DTOs
Create `src/accounting/dto/account-head/`:

```typescript
// create-account-head.dto.ts
export class CreateAccountHeadDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  isCustom?: boolean;
}
```

### 4. Frontend Implementation

#### A. Business Management Components
Create React components for business management:

1. **BusinessList Component** (`src/components/business/BusinessList.jsx`):
   - Display user's businesses
   - Create new business button
   - Switch between businesses
   - Business settings access

2. **BusinessForm Component** (`src/components/business/BusinessForm.jsx`):
   - Create/edit business form
   - All business fields with validation
   - Business type selection
   - Fiscal year configuration

3. **BusinessUsers Component** (`src/components/business/BusinessUsers.jsx`):
   - Manage business users
   - Add/remove users
   - Role management
   - Permissions display

#### B. Chart of Accounts Components
Create React components for chart of accounts:

1. **ChartOfAccounts Component** (`src/components/accounts/ChartOfAccounts.jsx`):
   - Hierarchical account display
   - Account categories organization
   - Search and filter functionality
   - Add/edit/delete accounts

2. **AccountForm Component** (`src/components/accounts/AccountForm.jsx`):
   - Create/edit account form
   - Account code validation
   - Category selection
   - Parent account selection

3. **AccountCategoryManager Component** (`src/components/accounts/AccountCategoryManager.jsx`):
   - Manage account categories
   - Standard vs custom categories
   - Category hierarchy

#### C. Dashboard Integration
Update dashboard to include:
- Business selector dropdown
- Quick account creation
- Account balance summaries
- Recent account activities

### 5. Business Logic Implementation

#### A. Multi-Business Context
- Implement business context throughout the application
- Ensure all operations are scoped to selected business
- Handle business switching in frontend
- Maintain business permissions

#### B. Standard Chart of Accounts
- Implement industry-standard chart of accounts
- Allow customization per business
- Support for different business types
- Account code validation and uniqueness

#### C. Account Hierarchy
- Support parent-child account relationships
- Implement account rollup calculations
- Hierarchical display in UI
- Proper deletion handling

### 6. Integration Points

#### A. Transaction Integration
- Link transactions to specific business
- Account selection from business chart of accounts
- Business-scoped reporting

#### B. Journal Entry Integration
- Business context for all journal entries
- Account validation against business chart
- Multi-business consolidation capabilities

#### C. Reporting Integration
- Business-specific reports
- Cross-business consolidation
- Account hierarchy in reports

### 7. Security and Permissions

#### A. Business-Level Security
- Role-based access control per business
- Owner vs user permissions
- Data isolation between businesses

#### B. Account Security
- Business-scoped account access
- Account modification permissions
- Audit trail for account changes

### 8. Testing Requirements

#### A. Unit Tests
- Business service methods
- Account service methods
- Permission validation
- Data isolation

#### B. Integration Tests
- Multi-business scenarios
- Account hierarchy operations
- Cross-business data access prevention

### 9. Performance Considerations

#### A. Database Optimization
- Proper indexing for business queries
- Efficient account hierarchy queries
- Optimized balance calculations

#### B. Frontend Optimization
- Lazy loading for large account lists
- Efficient business switching
- Cached account hierarchies

## Implementation Priority

1. **Phase 1**: Business entity CRUD operations
2. **Phase 2**: Standard chart of accounts setup
3. **Phase 3**: Account hierarchy and relationships
4. **Phase 4**: Frontend business management
5. **Phase 5**: Frontend chart of accounts
6. **Phase 6**: Integration with existing features

## Success Criteria

- Users can create and manage multiple businesses
- Each business has its own chart of accounts
- Account hierarchy works correctly
- Business permissions are properly enforced
- Standard chart of accounts is available
- All existing features work within business context
- Performance is acceptable for multiple businesses

## Files to Modify/Create

### Backend:
- `src/accounting/services/business.service.ts` (create)
- `src/accounting/controllers/business.controller.ts` (create)
- `src/accounting/services/account-categories.service.ts` (create)
- `src/accounting/services/account-heads.service.ts` (create)
- `src/accounting/services/accounts.service.ts` (enhance)
- `src/accounting/dto/business/` (create directory and DTOs)
- `src/accounting/dto/account-head/` (create directory and DTOs)
- `src/accounting/accounting.module.ts` (update)

### Frontend:
- `src/components/business/` (create directory and components)
- `src/components/accounts/ChartOfAccounts.jsx` (create)
- `src/components/accounts/AccountForm.jsx` (create)
- `src/hooks/useBusiness.js` (create)
- `src/hooks/useAccounts.js` (create)
- `src/services/businessService.js` (create)
- `src/context/BusinessContext.jsx` (create)

This implementation will provide a robust business entity management system with a comprehensive chart of accounts that integrates seamlessly with the existing accounting infrastructure.