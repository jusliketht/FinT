# FinT Application - Complete Development Guide for Cursor AI

## Overview
This document provides step-by-step instructions for developing the FinT (Financial Tracking) application. Follow these instructions sequentially to build a complete financial management system.

## Project Structure
```
fint/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # User management
│   │   ├── businesses/        # Business management
│   │   ├── accounts/          # Chart of accounts
│   │   ├── journal-entries/   # Journal entry management
│   │   ├── invoices/          # Invoice management
│   │   ├── reports/           # Financial reporting
│   │   ├── files/             # File management
│   │   ├── statements/        # Bank statement processing
│   │   ├── common/            # Shared utilities
│   │   ├── database/          # Database configuration
│   │   └── main.ts            # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   ├── test/                  # Test files
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API services
│   │   ├── store/             # Redux store
│   │   ├── utils/             # Utility functions
│   │   ├── types/             # TypeScript types
│   │   └── App.tsx            # Main app component
│   ├── public/                # Static assets
│   ├── package.json
│   └── tsconfig.json
└── docs/                      # Documentation
    ├── api/                   # API documentation
    ├── user-guide/            # User documentation
    └── development/           # Development guides
```

## Technology Stack

### Backend
- **Framework**: NestJS (Node.js framework)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport
- **File Processing**: Multer for uploads, pdf-parse for PDF processing
- **Validation**: class-validator and class-transformer
- **Testing**: Jest

### Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: Chakra UI + Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Testing**: Jest + React Testing Library

## Development Phases

### Phase 1: Backend Core Setup
### Phase 2: Database Schema & Models
### Phase 3: Authentication System
### Phase 4: Business Management
### Phase 5: Chart of Accounts
### Phase 6: Journal Entry System
### Phase 7: Invoice Management
### Phase 8: Financial Reporting
### Phase 9: File & Statement Processing
### Phase 10: Frontend Setup
### Phase 11: Frontend Components
### Phase 12: Frontend Pages
### Phase 13: Integration & Testing
### Phase 14: Deployment

---

# PHASE 1: BACKEND CORE SETUP

## Step 1.1: Initialize NestJS Project

### Create project directory and initialize
```bash
mkdir fint-backend
cd fint-backend
npm init -y
```

### Install NestJS CLI and core dependencies
```bash
npm install -g @nestjs/cli
npm install @nestjs/core @nestjs/common @nestjs/platform-express
npm install @nestjs/config @nestjs/jwt @nestjs/passport
npm install passport passport-jwt passport-local
npm install bcryptjs class-validator class-transformer
npm install reflect-metadata rxjs
```

### Install development dependencies
```bash
npm install -D @nestjs/cli @nestjs/schematics @nestjs/testing
npm install -D @types/node @types/bcryptjs @types/passport-jwt
npm install -D typescript ts-node ts-loader
npm install -D jest @types/jest ts-jest supertest @types/supertest
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

### Create NestJS application structure
```bash
nest new . --skip-git --package-manager npm
```

## Step 1.2: Configure TypeScript and ESLint

### Update tsconfig.json
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2020",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "paths": {
      "@/*": ["src/*"],
      "@/common/*": ["src/common/*"],
      "@/auth/*": ["src/auth/*"],
      "@/users/*": ["src/users/*"],
      "@/businesses/*": ["src/businesses/*"]
    }
  }
}
```

### Create .eslintrc.js
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    '@nestjs/eslint-config-nestjs',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
```

### Create .prettierrc
```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "semi": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

## Step 1.3: Environment Configuration

### Create .env file
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fint_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Email (for future use)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH="./uploads"

# Application
PORT=3000
NODE_ENV="development"
```

### Create .env.example
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fint_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH="./uploads"

# Application
PORT=3000
NODE_ENV="development"
```

## Step 1.4: Update package.json scripts

### Update package.json
```json
{
  "name": "fint-backend",
  "version": "1.0.0",
  "description": "FinT Backend API",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "ts-node prisma/seed.ts"
  }
}
```

---

# PHASE 2: DATABASE SCHEMA & MODELS

## Step 2.1: Install and Configure Prisma

### Install Prisma
```bash
npm install prisma @prisma/client
npm install -D prisma
```

### Initialize Prisma
```bash
npx prisma init
```

## Step 2.2: Create Database Schema

### Update prisma/schema.prisma
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String   @id @default(cuid())
  email             String   @unique
  password          String
  firstName         String
  lastName          String
  phone             String?
  isEmailVerified   Boolean  @default(false)
  emailVerifyToken  String?
  resetPasswordToken String?
  resetPasswordExpires DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  businessUsers     BusinessUser[]
  journalEntries    JournalEntry[]
  invoices          Invoice[]
  files             File[]

  @@map("users")
}

model Business {
  id                String      @id @default(cuid())
  name              String
  type              BusinessType
  registrationNumber String?
  gstNumber         String?
  address           String?
  phone             String?
  email             String?
  isActive          Boolean     @default(true)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  // Relations
  businessUsers     BusinessUser[]
  accounts          Account[]
  journalEntries    JournalEntry[]
  invoices          Invoice[]
  customers         Customer[]
  files             File[]
  statements        Statement[]

  @@map("businesses")
}

model BusinessUser {
  id         String       @id @default(cuid())
  userId     String
  businessId String
  role       BusinessRole @default(VIEWER)
  isDefault  Boolean      @default(false)
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt

  // Relations
  user       User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  business   Business     @relation(fields: [businessId], references: [id], onDelete: Cascade)

  @@unique([userId, businessId])
  @@map("business_users")
}

model Account {
  id          String      @id @default(cuid())
  businessId  String
  code        String
  name        String
  type        AccountType
  subType     String?
  parentId    String?
  description String?
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relations
  business       Business           @relation(fields: [businessId], references: [id], onDelete: Cascade)
  parent         Account?           @relation("AccountHierarchy", fields: [parentId], references: [id])
  children       Account[]          @relation("AccountHierarchy")
  journalEntryLines JournalEntryLine[]

  @@unique([businessId, code])
  @@map("accounts")
}

model JournalEntry {
  id          String   @id @default(cuid())
  businessId  String
  entryNumber String
  date        DateTime
  description String
  reference   String?
  totalAmount Decimal  @db.Decimal(15, 2)
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  business    Business           @relation(fields: [businessId], references: [id], onDelete: Cascade)
  creator     User               @relation(fields: [createdBy], references: [id])
  lines       JournalEntryLine[]
  attachments File[]

  @@unique([businessId, entryNumber])
  @@map("journal_entries")
}

model JournalEntryLine {
  id              String  @id @default(cuid())
  journalEntryId  String
  accountId       String
  debit           Decimal @db.Decimal(15, 2) @default(0)
  credit          Decimal @db.Decimal(15, 2) @default(0)
  description     String?

  // Relations
  journalEntry    JournalEntry @relation(fields: [journalEntryId], references: [id], onDelete: Cascade)
  account         Account      @relation(fields: [accountId], references: [id])

  @@map("journal_entry_lines")
}

model Customer {
  id          String   @id @default(cuid())
  businessId  String
  name        String
  email       String?
  phone       String?
  address     String?
  gstNumber   String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  business    Business  @relation(fields: [businessId], references: [id], onDelete: Cascade)
  invoices    Invoice[]

  @@map("customers")
}

model Invoice {
  id            String        @id @default(cuid())
  businessId    String
  customerId    String
  invoiceNumber String
  date          DateTime
  dueDate       DateTime?
  subtotal      Decimal       @db.Decimal(15, 2)
  taxRate       Decimal       @db.Decimal(5, 2) @default(0)
  taxAmount     Decimal       @db.Decimal(15, 2) @default(0)
  total         Decimal       @db.Decimal(15, 2)
  status        InvoiceStatus @default(DRAFT)
  notes         String?
  createdBy     String
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Relations
  business      Business      @relation(fields: [businessId], references: [id], onDelete: Cascade)
  customer      Customer      @relation(fields: [customerId], references: [id])
  creator       User          @relation(fields: [createdBy], references: [id])
  items         InvoiceItem[]

  @@unique([businessId, invoiceNumber])
  @@map("invoices")
}

model InvoiceItem {
  id          String  @id @default(cuid())
  invoiceId   String
  description String
  quantity    Decimal @db.Decimal(10, 2)
  rate        Decimal @db.Decimal(15, 2)
  amount      Decimal @db.Decimal(15, 2)

  // Relations
  invoice     Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@map("invoice_items")
}

model File {
  id              String    @id @default(cuid())
  businessId      String?
  userId          String?
  journalEntryId  String?
  filename        String
  originalName    String
  mimeType        String
  size            Int
  path            String
  type            FileType  @default(OTHER)
  description     String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  business        Business?     @relation(fields: [businessId], references: [id], onDelete: Cascade)
  user            User?         @relation(fields: [userId], references: [id])
  journalEntry    JournalEntry? @relation(fields: [journalEntryId], references: [id], onDelete: Cascade)

  @@map("files")
}

model Statement {
  id          String          @id @default(cuid())
  businessId  String
  filename    String
  originalName String
  type        StatementType
  status      StatementStatus @default(UPLOADED)
  uploadedAt  DateTime        @default(now())
  processedAt DateTime?

  // Relations
  business    Business              @relation(fields: [businessId], references: [id], onDelete: Cascade)
  transactions StatementTransaction[]

  @@map("statements")
}

model StatementTransaction {
  id          String    @id @default(cuid())
  statementId String
  date        DateTime
  description String
  amount      Decimal   @db.Decimal(15, 2)
  type        String    // DEBIT or CREDIT
  balance     Decimal?  @db.Decimal(15, 2)
  reference   String?
  isProcessed Boolean   @default(false)

  // Relations
  statement   Statement @relation(fields: [statementId], references: [id], onDelete: Cascade)

  @@map("statement_transactions")
}

// Enums
enum BusinessType {
  SOLE_PROPRIETORSHIP
  PARTNERSHIP
  PRIVATE_LIMITED
  PUBLIC_LIMITED
  LLP
}

enum BusinessRole {
  OWNER
  ADMIN
  ACCOUNTANT
  VIEWER
}

enum AccountType {
  ASSET
  LIABILITY
  EQUITY
  REVENUE
  EXPENSE
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
  CANCELLED
}

enum FileType {
  STATEMENT
  RECEIPT
  INVOICE
  OTHER
}

enum StatementType {
  BANK
  CREDIT_CARD
}

enum StatementStatus {
  UPLOADED
  PROCESSING
  PROCESSED
  ERROR
}
```

## Step 2.3: Generate Prisma Client and Run Migrations

### Generate Prisma client
```bash
npx prisma generate
```

### Create and run initial migration
```bash
npx prisma migrate dev --name init
```

## Step 2.4: Create Database Service

### Create src/database/database.module.ts
```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
```

### Create src/database/prisma.service.ts
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

---

# PHASE 3: AUTHENTICATION SYSTEM

## Step 3.1: Create Common Utilities

### Create src/common/decorators/current-user.decorator.ts
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### Create src/common/decorators/roles.decorator.ts
```typescript
import { SetMetadata } from '@nestjs/common';
import { BusinessRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: BusinessRole[]) => SetMetadata(ROLES_KEY, roles);
```

### Create src/common/guards/jwt-auth.guard.ts
```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### Create src/common/guards/roles.guard.ts
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BusinessRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<BusinessRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

### Create src/common/dto/pagination.dto.ts
```typescript
import { IsOptional, IsPositive, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Max(100)
  limit?: number = 20;
}
```

### Create src/common/interfaces/api-response.interface.ts
```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

## Step 3.2: Create Auth Module

### Create src/auth/dto/register.dto.ts
```typescript
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, number or special character',
  })
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
```

### Create src/auth/dto/login.dto.ts
```typescript
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

### Create src/auth/dto/forgot-password.dto.ts
```typescript
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}
```

### Create src/auth/dto/reset-password.dto.ts
```typescript
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, number or special character',
  })
  newPassword: string;
}
```

### Create src/auth/strategies/jwt.strategy.ts
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        businessUsers: {
          include: {
            business: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      businesses: user.businessUsers,
    };
  }
}
```

### Create src/auth/auth.service.ts
```typescript
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, phone } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    return {
      user,
      message: 'Registration successful. Please verify your email.',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        businessUsers: {
          include: {
            business: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        businesses: user.businessUsers,
      },
      accessToken,
      message: 'Login successful',
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If email exists, password reset link has been sent' };
    }

    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // TODO: Send email with reset link
    // For now, return token (remove in production)
    return {
      message: 'Password reset link sent to email',
      resetToken, // Remove this in production
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Password reset successful' };
  }
}
```

### Create src/auth/auth.controller.ts
```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
```

### Create src/auth/auth.module.ts
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

This guide continues with detailed implementation steps for all remaining phases. Each step includes complete code examples, file structures, and specific instructions that Cursor AI can follow to build the entire application.

