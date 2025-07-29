# FinT API Specification

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
All API responses follow this structure:
```json
{
  "success": boolean,
  "data": object | array | null,
  "message": string,
  "errors": array | null,
  "timestamp": string,
  "requestId": string
}
```

## Error Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 422: Validation Error
- 500: Internal Server Error

## API Endpoints

### 1. Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isEmailVerified": false
    }
  },
  "message": "Registration successful. Please verify your email."
}
```

#### POST /auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  },
  "message": "Login successful"
}
```

#### POST /auth/logout
Logout user and invalidate token.

**Headers:** Authorization: Bearer <token>

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### POST /auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST /auth/reset-password
Reset password using token from email.

**Request Body:**
```json
{
  "token": "reset_token",
  "newPassword": "NewSecurePass123!"
}
```

### 2. User Management Endpoints

#### GET /users/profile
Get current user profile.

**Headers:** Authorization: Bearer <token>

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

#### PUT /users/profile
Update user profile.

**Headers:** Authorization: Bearer <token>

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### 3. Business Management Endpoints

#### GET /businesses
Get all businesses for current user.

**Headers:** Authorization: Bearer <token>

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "ABC Company Ltd",
      "type": "PRIVATE_LIMITED",
      "registrationNumber": "12345678",
      "gstNumber": "27AAAAA0000A1Z5",
      "address": "123 Business St, City, State 12345",
      "isDefault": true,
      "role": "OWNER",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /businesses
Create a new business.

**Headers:** Authorization: Bearer <token>

**Request Body:**
```json
{
  "name": "ABC Company Ltd",
  "type": "PRIVATE_LIMITED",
  "registrationNumber": "12345678",
  "gstNumber": "27AAAAA0000A1Z5",
  "address": "123 Business St, City, State 12345",
  "phone": "+1234567890",
  "email": "business@example.com"
}
```

#### GET /businesses/:id
Get specific business details.

#### PUT /businesses/:id
Update business information.

#### DELETE /businesses/:id
Delete a business (owner only).

### 4. Chart of Accounts Endpoints

#### GET /businesses/:businessId/accounts
Get chart of accounts for a business.

**Query Parameters:**
- `type`: Filter by account type (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
- `active`: Filter by active status (true/false)
- `search`: Search by account name or code

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "1000",
      "name": "Cash",
      "type": "ASSET",
      "subType": "CURRENT_ASSET",
      "parentId": null,
      "isActive": true,
      "balance": 10000.00,
      "children": []
    }
  ]
}
```

#### POST /businesses/:businessId/accounts
Create a new account.

**Request Body:**
```json
{
  "code": "1000",
  "name": "Cash",
  "type": "ASSET",
  "subType": "CURRENT_ASSET",
  "parentId": null,
  "description": "Cash on hand and in bank"
}
```

#### PUT /businesses/:businessId/accounts/:id
Update account information.

#### DELETE /businesses/:businessId/accounts/:id
Deactivate an account.

### 5. Journal Entry Endpoints

#### GET /businesses/:businessId/journal-entries
Get journal entries for a business.

**Query Parameters:**
- `startDate`: Filter from date (YYYY-MM-DD)
- `endDate`: Filter to date (YYYY-MM-DD)
- `accountId`: Filter by account
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "uuid",
        "entryNumber": "JE-2025-001",
        "date": "2025-01-01",
        "description": "Opening balance",
        "reference": "REF-001",
        "totalAmount": 10000.00,
        "lines": [
          {
            "id": "uuid",
            "accountId": "uuid",
            "accountName": "Cash",
            "debit": 10000.00,
            "credit": 0.00,
            "description": "Opening cash balance"
          }
        ],
        "attachments": [],
        "createdBy": "John Doe",
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### POST /businesses/:businessId/journal-entries
Create a new journal entry.

**Request Body:**
```json
{
  "date": "2025-01-01",
  "description": "Opening balance",
  "reference": "REF-001",
  "lines": [
    {
      "accountId": "uuid",
      "debit": 10000.00,
      "credit": 0.00,
      "description": "Opening cash balance"
    },
    {
      "accountId": "uuid",
      "debit": 0.00,
      "credit": 10000.00,
      "description": "Opening equity"
    }
  ]
}
```

#### GET /businesses/:businessId/journal-entries/:id
Get specific journal entry details.

#### PUT /businesses/:businessId/journal-entries/:id
Update journal entry.

#### DELETE /businesses/:businessId/journal-entries/:id
Delete journal entry.

### 6. Invoice Management Endpoints

#### GET /businesses/:businessId/invoices
Get invoices for a business.

#### POST /businesses/:businessId/invoices
Create a new invoice.

**Request Body:**
```json
{
  "customerId": "uuid",
  "invoiceNumber": "INV-2025-001",
  "date": "2025-01-01",
  "dueDate": "2025-01-31",
  "items": [
    {
      "description": "Product/Service",
      "quantity": 1,
      "rate": 1000.00,
      "amount": 1000.00
    }
  ],
  "taxRate": 18.00,
  "notes": "Payment terms: Net 30 days"
}
```

#### GET /businesses/:businessId/invoices/:id
Get specific invoice details.

#### PUT /businesses/:businessId/invoices/:id
Update invoice.

#### DELETE /businesses/:businessId/invoices/:id
Delete invoice.

#### GET /businesses/:businessId/invoices/:id/pdf
Generate and download invoice PDF.

### 7. Reporting Endpoints

#### GET /businesses/:businessId/reports/ledger
Generate account ledger.

**Query Parameters:**
- `accountId`: Required - Account ID
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `format`: Response format (json, pdf, excel)

#### GET /businesses/:businessId/reports/trial-balance
Generate trial balance.

**Query Parameters:**
- `asOfDate`: As of date (YYYY-MM-DD)
- `format`: Response format (json, pdf, excel)

#### GET /businesses/:businessId/reports/balance-sheet
Generate balance sheet.

**Query Parameters:**
- `asOfDate`: As of date (YYYY-MM-DD)
- `compareDate`: Comparison date (optional)
- `format`: Response format (json, pdf, excel)

#### GET /businesses/:businessId/reports/profit-loss
Generate profit & loss statement.

**Query Parameters:**
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `compareStartDate`: Comparison start date (optional)
- `compareEndDate`: Comparison end date (optional)
- `format`: Response format (json, pdf, excel)

### 8. File Management Endpoints

#### POST /businesses/:businessId/files/upload
Upload files (statements, receipts, etc.).

**Request:** Multipart form data
- `files`: File(s) to upload
- `type`: File type (STATEMENT, RECEIPT, INVOICE, OTHER)
- `description`: File description

#### GET /businesses/:businessId/files
Get uploaded files.

#### GET /files/:id/download
Download specific file.

#### DELETE /files/:id
Delete file.

### 9. Bank Statement Processing Endpoints

#### POST /businesses/:businessId/statements/upload
Upload bank statement for processing.

#### GET /businesses/:businessId/statements/:id/transactions
Get parsed transactions from statement.

#### POST /businesses/:businessId/statements/:id/process
Process and create journal entries from statement transactions.

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Business
```typescript
interface Business {
  id: string;
  name: string;
  type: BusinessType;
  registrationNumber?: string;
  gstNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum BusinessType {
  SOLE_PROPRIETORSHIP = 'SOLE_PROPRIETORSHIP',
  PARTNERSHIP = 'PARTNERSHIP',
  PRIVATE_LIMITED = 'PRIVATE_LIMITED',
  PUBLIC_LIMITED = 'PUBLIC_LIMITED',
  LLP = 'LLP'
}
```

### Account
```typescript
interface Account {
  id: string;
  businessId: string;
  code: string;
  name: string;
  type: AccountType;
  subType?: string;
  parentId?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}
```

### Journal Entry
```typescript
interface JournalEntry {
  id: string;
  businessId: string;
  entryNumber: string;
  date: Date;
  description: string;
  reference?: string;
  totalAmount: number;
  lines: JournalEntryLine[];
  attachments: File[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface JournalEntryLine {
  id: string;
  journalEntryId: string;
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
}
```

This API specification will be updated as development progresses and new endpoints are added.

