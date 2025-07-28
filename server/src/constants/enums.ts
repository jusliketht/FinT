export enum UserRole {
  Admin = 'ADMIN',
  Accountant = 'ACCOUNTANT',
  Viewer = 'VIEWER',
  BusinessOwner = 'BUSINESS_OWNER',
}

export enum BusinessType {
  SoleProprietorship = 'sole_proprietorship',
  Partnership = 'partnership',
  Corporation = 'corporation',
  LLC = 'llc',
}

export enum AccountType {
  Asset = 'asset',
  Liability = 'liability',
  Equity = 'equity',
  Revenue = 'revenue',
  Expense = 'expense',
}

export enum JournalEntryStatus {
  Draft = 'draft',
  Posted = 'posted',
  Void = 'void',
}
