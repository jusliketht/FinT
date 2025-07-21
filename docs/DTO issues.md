TypeScript Error Analysis: DTO Type Mismatch Issues

Error Summary

The errors you're seeing are TypeScript type compatibility issues between DTOs (Data Transfer Objects) defined in different locations. Specifically:

1.
Transaction Type Mismatch: transactionType property type incompatibility

2.
Date Type Mismatch: startDate property type incompatibility

3.
Duplicate DTO Definitions: Same DTO names defined in multiple places with different types

Root Cause Analysis

🔍 Primary Root Cause: Duplicate DTO Definitions

The core issue is that you have duplicate DTO definitions with the same names but different type definitions in different files:

Plain Text


// Location 1: Controller's DTO
E:/FinT/server/src/transactions/dto/create-transaction.dto.ts
- transactionType: string (generic string)

// Location 2: Service's DTO  
E:/FinT/server/src/transactions/transactions.service.ts
- transactionType: "income" | "expense" | "transfer" | "adjustment" (union type)


🔍 Specific Issues:

Issue 1: Transaction Type Definition

TypeScript


// DTO File (create-transaction.dto.ts)
export class CreateTransactionDto {
  transactionType: string; // ❌ Too generic - accepts any string
}

// Service File (transactions.service.ts) 
interface CreateTransactionDto {
  transactionType: "income" | "expense" | "transfer" | "adjustment"; // ✅ Specific union type
}


Problem: The DTO allows any string, but the service expects only specific values.

Issue 2: Date Type Definition

TypeScript


// DTO File (get-transactions-query.dto.ts)
export class GetTransactionsQueryDto {
  startDate: string; // ❌ String type (from HTTP request)
}

// Service File (transactions.service.ts)
interface GetTransactionsQueryDto {
  startDate: Date; // ✅ Date object type
}


Problem: HTTP requests send dates as strings, but the service expects Date objects.

Why This Happened

1. Inconsistent Development Process

•
DTOs were defined in multiple places during different development phases

•
No single source of truth for type definitions

•
Service interfaces were created separately from controller DTOs

2. Missing Type Validation/Transformation

•
No validation pipes to transform string dates to Date objects

•
No enum validation for transaction types

•
Controller accepts raw HTTP input without proper typing

3. Import/Export Issues

•
Services defining their own interfaces instead of importing DTOs

•
Circular dependencies or missing imports

•
TypeScript resolving to wrong type definitions

Solution Strategy

Option 1: Consolidate DTOs (Recommended)

TypeScript


// src/transactions/dto/create-transaction.dto.ts
import { IsEnum, IsString, IsNumber, IsOptional } from 'class-validator';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense', 
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment'
}

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  transactionType: TransactionType; // ✅ Use enum instead of string

  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  // ... other properties
}


Option 2: Add Validation Pipes

TypeScript


// src/transactions/dto/get-transactions-query.dto.ts
import { Transform } from 'class-transformer';
import { IsOptional, IsDate } from 'class-validator';

export class GetTransactionsQueryDto {
  @IsOptional()
  @Transform(({ value }) => new Date(value)) // ✅ Transform string to Date
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  endDate?: Date;
}


Option 3: Remove Duplicate Interfaces

TypeScript


// transactions.service.ts - Remove duplicate interfaces
import { CreateTransactionDto, UpdateTransactionDto, GetTransactionsQueryDto } from './dto';

@Injectable()
export class TransactionsService {
  // Use imported DTOs instead of defining interfaces
  async createTransaction(createTransactionDto: CreateTransactionDto) {
    // ...
  }
}


Immediate Fix Steps

Step 1: Identify All Duplicate DTOs

Bash


# Search for duplicate DTO definitions
grep -r "CreateTransactionDto" src/
grep -r "UpdateTransactionDto" src/
grep -r "GetTransactionsQueryDto" src/


Step 2: Consolidate Type Definitions

•
Keep DTO classes in /dto folders

•
Remove interface definitions from service files

•
Import DTOs in services instead of defining interfaces

Step 3: Add Proper Validation

TypeScript


// main.ts - Enable validation pipes globally
app.useGlobalPipes(new ValidationPipe({
  transform: true, // Auto-transform types
  whitelist: true, // Strip unknown properties
}));


Step 4: Use Enums for Restricted Values

TypeScript


// Create enums for transaction types
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer', 
  ADJUSTMENT = 'adjustment'
}


Prevention Strategies

1. Single Source of Truth

•
All DTOs in dedicated /dto folders

•
Services import DTOs, never define their own interfaces

•
Use barrel exports (index.ts) for clean imports

2. Proper Validation

•
Use class-validator decorators

•
Transform strings to appropriate types

•
Validate enums and restricted values

3. Code Organization

Plain Text


src/
├── transactions/
│   ├── dto/
│   │   ├── index.ts              # Barrel export
│   │   ├── create-transaction.dto.ts
│   │   ├── update-transaction.dto.ts
│   │   └── get-transactions-query.dto.ts
│   ├── enums/
│   │   └── transaction-type.enum.ts
│   ├── transactions.controller.ts
│   └── transactions.service.ts


Quick Fix for Your Current Error

Immediate solution: Update the DTO to match the service expectation:

TypeScript


// src/transactions/dto/create-transaction.dto.ts
export class CreateTransactionDto {
  transactionType: 'income' | 'expense' | 'transfer' | 'adjustment'; // ✅ Use union type
  
  // For date fields, add transformation
  @Transform(({ value }) => new Date(value))
  date: Date;
}


This error pattern suggests a systematic issue with DTO management across your application. The solution involves consolidating type definitions and implementing proper validation/transformation pipelines.

