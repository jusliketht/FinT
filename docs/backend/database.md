# Database Documentation

## Overview

The FinT application uses **PostgreSQL** as its database and **Prisma** as the Object-Relational Mapper (ORM). Prisma provides a declarative way to define the database schema and interact with the database.

The source of truth for the database schema is the `prisma/schema.prisma` file.

## Prisma Schema

Below is the complete Prisma schema, which defines all the models and their relationships in the database.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model AccountCategory {
  id          String        @id @default(uuid())
  name        String        @unique
  description String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  AccountHead AccountHead[]
}

model Account {
  id            String         @id @default(uuid())
  name          String
  type          String
  code          String         @unique
  userId        String
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  User          User           @relation(fields: [userId], references: [id])
  creditEntries JournalEntry[] @relation("CreditAccount")
  debitEntries  JournalEntry[] @relation("DebitAccount")

  @@index([code])
  @@index([type])
  @@index([userId])
}

model JournalEntry {
  id               String             @id @default(uuid())
  date             DateTime
  description      String
  amount           Float
  debitAccountId   String
  creditAccountId  String
  userId           String
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
  creditAccount    Account            @relation("CreditAccount", fields: [creditAccountId], references: [id])
  debitAccount     Account            @relation("DebitAccount", fields: [debitAccountId], references: [id])
  User             User               @relation(fields: [userId], references: [id])
  JournalEntryItem JournalEntryItem[]

  @@index([creditAccountId])
  @@index([date])
  @@index([debitAccountId])
  @@index([userId])
}

model Transaction {
  id              String   @id @default(uuid())
  date            DateTime
  description     String
  amount          Float
  category        String
  transactionType String
  userId          String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  User            User     @relation(fields: [userId], references: [id])

  @@index([category])
  @@index([date])
  @@index([transactionType])
  @@index([userId])
}

model AccountHead {
  id                String             @id
  code              String             @unique
  name              String
  description       String?
  categoryId        String
  isCustom          Boolean            @default(false)
  parentId          String?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime
  AccountCategory   AccountCategory    @relation(fields: [categoryId], references: [id])
  AccountHead       AccountHead?       @relation("AccountHeadToAccountHead", fields: [parentId], references: [id])
  other_AccountHead AccountHead[]      @relation("AccountHeadToAccountHead")
  JournalEntryItem  JournalEntryItem[]
  LedgerEntry       LedgerEntry[]

  @@index([categoryId])
  @@index([parentId])
}

model CompanySettings {
  id              String   @id
  companyName     String
  address         String?
  taxNumber       String?
  phone           String?
  email           String?
  fiscalYearStart DateTime
  baseCurrency    String   @default("INR")
  createdAt       DateTime @default(now())
  updatedAt       DateTime
}

model FinancialYear {
  id        String   @id
  startDate DateTime
  endDate   DateTime
  isActive  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime

  @@unique([startDate, endDate])
  @@index([isActive])
}

model JournalEntryItem {
  id             String       @id
  journalEntryId String
  accountHeadId  String
  description    String?
  debitAmount    Decimal      @default(0)
  creditAmount   Decimal      @default(0)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime
  AccountHead    AccountHead  @relation(fields: [accountHeadId], references: [id])
  JournalEntry   JournalEntry @relation(fields: [journalEntryId], references: [id])

  @@index([accountHeadId])
  @@index([journalEntryId])
}

model LedgerEntry {
  id            String      @id
  accountHeadId String
  date          DateTime
  description   String
  debitAmount   Decimal     @default(0)
  creditAmount  Decimal     @default(0)
  balance       Decimal
  reference     String
  createdAt     DateTime    @default(now())
  updatedAt     DateTime
  AccountHead   AccountHead @relation(fields: [accountHeadId], references: [id])

  @@index([accountHeadId])
  @@index([date])
}

model User {
  id               String         @id
  name             String
  email            String         @unique
  password         String
  role             String         @default("VIEWER")
  resetToken       String?
  resetTokenExpiry DateTime?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime
  Account          Account[]
  JournalEntry     JournalEntry[]
  Transaction      Transaction[]
}
```

## Model Descriptions

- **User**: Stores user information, including login credentials and role.
- **Account**: Represents a financial account, such as a bank account or a credit card account.
- **AccountCategory**: Defines categories for accounts (e.g., Asset, Liability).
- **AccountHead**: Represents the heads of accounts in the chart of accounts.
- **JournalEntry**: A record of a financial transaction, composed of multiple `JournalEntryItem` records (debits and credits).
- **JournalEntryItem**: An individual line item within a `JournalEntry`.
- **Transaction**: A generic transaction model.
- **LedgerEntry**: Represents an entry in the general ledger for an account head.
- **CompanySettings**: Stores company-specific settings.
- **FinancialYear**: Defines financial years for accounting periods.
``` 