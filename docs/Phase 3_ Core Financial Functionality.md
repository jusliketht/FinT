# Cursor Prompt: FinT Application Development - Phase 3: Core Financial Functionality

This prompt outlines the third phase of development for the FinT application, focusing on implementing the core financial functionalities, including double-entry bookkeeping, comprehensive chart of accounts, real-time ledger, financial statement generation, and invoicing/bill management.

## Phase Goal
To establish a robust and compliant accounting system within FinT, ensuring all financial transactions adhere to double-entry principles, enabling accurate real-time ledger updates, and generating professional financial statements and managing invoices/bills.

## Key Features to Implement/Refine

### 1. Double-Entry Bookkeeping System

#### 1.1. Automated Debit/Credit Generation

**Objective**: Ensure every financial transaction automatically generates corresponding debit and credit entries, adhering to fundamental accounting principles.

**Details**:
- When a transaction is recorded (e.g., income, expense, transfer), the system must automatically determine the affected accounts and generate the appropriate debit and credit entries.
- For example, an expense payment would debit an expense account and credit a cash/bank account.
- This applies to all transaction types: manual entries, imported bank statement transactions, invoices, and bills.

**Implementation Notes**:
- Backend: Modify transaction creation and update logic in `transactions.service.ts` to include the creation of journal entries (debit/credit pairs). This might involve a new `JournalEntry` model in `prisma/schema.prisma`.
- Define clear rules for how different transaction types impact various accounts (e.g., income increases revenue and cash, expenses decrease cash and increase expense accounts).

### 2. Chart of Accounts (COA)

#### 2.1. Comprehensive COA Management

**Objective**: Provide a flexible and comprehensive Chart of Accounts system that allows users to manage their financial accounts.

**Details**:
- **Standard Categories**: Pre-populate a standard Chart of Accounts structure with common accounting categories (e.g., Assets, Liabilities, Equity, Revenue, Expenses).
- **Add/Edit/Delete Accounts**: Users should be able to add new accounts, edit existing account details (name, type, description), and delete accounts (with appropriate checks to prevent deletion of accounts with transactions).
- **Account Types**: Support various account types (e.g., Bank, Cash, Accounts Receivable, Accounts Payable, Revenue, Expense, Equity, Fixed Assets, etc.).
- **Hierarchical Structure**: (Optional, but recommended for larger businesses) Support for parent-child account relationships for better organization and reporting.

**Implementation Notes**:
- Frontend: Create a dedicated page (`pages/accounts/ChartOfAccountsPage.jsx`) for managing the COA. Use Chakra UI `Table`, `Modal` for add/edit forms, and `Button` components.
- Backend: Implement CRUD (Create, Read, Update, Delete) APIs for Chart of Accounts in `accounting/chart-of-accounts.controller.ts` and `accounting/chart-of-accounts.service.ts`.
- **`prisma/schema.prisma`**: Define the `Account` model with fields like `name`, `type`, `description`, `businessId`, `parentAccountId` (for hierarchy).

### 3. Real-time Ledger

#### 3.1. Dynamic Ledger Updates

**Objective**: Ensure the ledger updates in real-time based on all recorded journal entries, providing an up-to-date view of each account.

**Details**:
- For every account in the COA, users should be able to view a detailed ledger showing all debit and credit entries, the date of the transaction, description, and the running balance.
- The ledger should reflect changes immediately as transactions are added, edited, or reconciled.

**Implementation Notes**:
- Frontend: Create a ledger view, possibly accessible from the Chart of Accounts page or directly from the Dashboard. Use Chakra UI `Table` for display.
- Backend: Implement an API in `accounting/ledger.service.ts` to fetch ledger details for a given account and date range. This service will query the `JournalEntry` model.

### 4. Financial Statement Generation

#### 4.1. On-Demand Reporting

**Objective**: Enable users to generate key financial statements (Trial Balance, Balance Sheet, Profit and Loss) on demand for various stipulated timeframes.

**Details**:
- **Trial Balance**: A list of all accounts with their debit or credit balances at a specific point in time. It should verify the equality of total debits and total credits.
- **Balance Sheet**: A snapshot of the company's financial position at a specific date, showing assets, liabilities, and equity.
- **Profit and Loss (Income Statement)**: Shows the company's revenues and expenses over a period of time, resulting in net profit or loss.
- **Cash Flow Statement**: (If not covered in reconciliation) Summarizes the cash inflows and outflows over a period, categorized into operating, investing, and financing activities.
- **Timeframes**: Users must be able to select reporting periods: current month, last month, current quarter, last quarter, current year, last year, custom date range, and 


till date.

**Implementation Notes**:
- Frontend: Create dedicated pages for each financial statement (`pages/Reports/TrialBalance.jsx`, `pages/Reports/BalanceSheet.jsx`, `pages/Reports/ProfitAndLoss.jsx`, `pages/Reports/CashFlow.jsx`). Implement date range selectors and export options (PDF/Excel).
- Backend: Implement complex aggregation logic in `accounting/reports.service.ts` to generate these statements from the `JournalEntry` and `Account` data. This will involve summing debits/credits for specific account types over the selected period.

### 5. Tax Integration (GST and TDS)

#### 5.1. Account Heads and Reporting

**Objective**: Integrate GST (Goods and Services Tax) and TDS (Tax Deducted at Source) as integral account heads within the Chart of Accounts and ensure proper calculation and reporting for tax purposes.

**Details**:
- **Dedicated Accounts**: Create specific accounts in the COA for GST Input, GST Output, TDS Payable, TDS Receivable, etc.
- **Transaction Tagging**: Allow transactions to be tagged with relevant GST/TDS rates and types.
- **Tax Calculation**: Implement logic to automatically calculate GST/TDS amounts based on transaction values and predefined rates.
- **Basic Tax Reports**: Generate simple reports summarizing GST collected/paid and TDS deducted/received.

**Implementation Notes**:
- Backend: Extend transaction and journal entry models to include tax-related fields. Implement tax calculation logic in `transactions.service.ts` or a dedicated `tax.service.ts`.
- Frontend: Add tax-related fields to the transaction entry modal and display tax summaries in relevant reports.

### 6. Invoicing and Bill Management

#### 6.1. Invoice Creation and Tracking

**Objective**: Enable users to generate professional invoices for customers and track their status.

**Details**:
- **Invoice Generation**: Create a form to generate professional invoices with details like customer information, line items (description, quantity, rate, amount), taxes, and total amount.
- **Status Tracking**: Track invoice status (Draft, Sent, Paid, Overdue, Void).
- **Payment Linking**: Allow linking incoming payments to specific invoices.

**Implementation Notes**:
- Frontend: Create `pages/invoices/InvoiceCreate.jsx` and `pages/invoices/InvoiceList.jsx`. Use Chakra UI for forms and tables.
- Backend: Implement CRUD APIs for invoices in `invoices/invoices.controller.ts` and `invoices/invoices.service.ts`. Define `Invoice` and `InvoiceLineItem` models in `prisma/schema.prisma`.

#### 6.2. Bill Management

**Objective**: Allow users to record and track vendor bills and manage payment due dates.

**Details**:
- **Bill Recording**: Create a form to record vendor bills with details like vendor information, line items, taxes, and total amount.
- **Due Date Management**: Track payment due dates and provide alerts for upcoming payments.
- **Payment Linking**: Allow linking outgoing payments to specific bills.

**Implementation Notes**:
- Frontend: Create `pages/bills/BillCreate.jsx` and `pages/bills/BillList.jsx`.
- Backend: Implement CRUD APIs for bills in `bills/bills.controller.ts` and `bills/bills.service.ts`. Define `Bill` and `BillLineItem` models in `prisma/schema.prisma`.

### 7. Quality Assurance and Error Handling

#### 7.1. Input Validation

**Objective**: Implement robust client-side and server-side validation on all forms to prevent incorrect data entry and ensure data integrity.

**Details**:
- **Client-side**: Use form libraries (e.g., `react-hook-form` with `yup` or `zod`) for immediate user feedback.
- **Server-side**: Use `class-validator` and `ValidationPipe` in NestJS DTOs to ensure data conforms to expected types and constraints before processing.

**Implementation Notes**:
- Apply validation rules to all DTOs (`CreateTransactionDto`, `UpdateTransactionDto`, `CreateInvoiceDto`, etc.) and corresponding frontend forms.

#### 7.2. Comprehensive Error Handling

**Objective**: Provide clear, user-friendly error messages and robust exception handling throughout the application.

**Details**:
- **Backend**: Implement global exception filters in NestJS to catch unhandled exceptions and return consistent error responses.
- **Frontend**: Use error boundaries in React to gracefully handle component-level errors and prevent the entire application from crashing. Display user-friendly messages instead of raw error stacks.
- **Specific Error Messages**: Provide specific and actionable error messages for common scenarios (e.g., 


validation errors, network issues, unauthorized access).

#### 7.3. Notifications and Loading States

**Objective**: Provide immediate user feedback through toast notifications and visual loading indicators.

**Details**:
- **Toast Notifications**: Implement a global toast notification system to display success messages (e.g., "Transaction saved successfully!"), error messages (e.g., "Failed to save transaction: Invalid amount."), and informational messages.
- **Loading States**: Display loading spinners or skeletons for all asynchronous operations (e.g., data fetching, form submissions) to indicate that an action is in progress and prevent multiple submissions.

**Implementation Notes**:
- Frontend: Use Chakra UI `useToast` hook for notifications and `Spinner`, `Skeleton`, or custom loading components for loading states.

#### 7.4. Mobile Responsiveness and Cross-Browser Compatibility

**Objective**: Ensure the application provides a consistent and optimal user experience across various devices and web browsers.

**Details**:
- **Mobile Responsiveness**: All UI components and layouts must adapt gracefully to different screen sizes, from large desktops to small mobile phones. Use Chakra UI's responsive styling features.
- **Cross-Browser Compatibility**: Test the application thoroughly on major web browsers (Chrome, Firefox, Edge, Safari) to ensure consistent rendering and functionality.

**Implementation Notes**:
- Frontend: Regularly test the application on different screen sizes using browser developer tools. Address any layout or functionality issues that arise.

#### 7.5. Accessibility

**Objective**: Implement accessibility features to make the application usable by individuals with disabilities.

**Details**:
- **ARIA Attributes**: Use appropriate ARIA attributes for interactive elements.
- **Keyboard Navigation**: Ensure all interactive elements are navigable and operable via keyboard.
- **Color Contrast**: Maintain sufficient color contrast for text and UI elements.
- **Semantic HTML**: Use semantic HTML elements where appropriate.

**Implementation Notes**:
- Frontend: Leverage Chakra UI's built-in accessibility features. Conduct accessibility audits during development.

## Files to Modify/Create

### Client-side (`client/src/`)

- **`pages/accounts/ChartOfAccountsPage.jsx`**: (New/Refine) For COA management.
- **`pages/Reports/TrialBalance.jsx`**: (New) For Trial Balance report.
- **`pages/Reports/BalanceSheet.jsx`**: (New) For Balance Sheet report.
- **`pages/Reports/ProfitAndLoss.jsx`**: (New) For Profit and Loss report.
- **`pages/Reports/CashFlow.jsx`**: (New) For Cash Flow report.
- **`pages/invoices/InvoiceCreate.jsx`**: (New) For creating invoices.
- **`pages/invoices/InvoiceList.jsx`**: (New) For listing invoices.
- **`pages/bills/BillCreate.jsx`**: (New) For creating bills.
- **`pages/bills/BillList.jsx`**: (New) For listing bills.
- **`components/common/LoadingStates.jsx`**: (Refine) For various loading indicators.
- **`contexts/ToastContext.js`**: (Refine) For global toast notifications.

### Backend-side (`server/src/`)

- **`accounting/chart-of-accounts.controller.ts`**: (New) CRUD for COA.
- **`accounting/chart-of-accounts.service.ts`**: (New) Logic for COA.
- **`accounting/journal-entry.service.ts`**: (New) Service for managing journal entries.
- **`accounting/reports.service.ts`**: (New) Logic for generating financial statements.
- **`invoices/invoices.controller.ts`**: (New) CRUD for invoices.
- **`invoices/invoices.service.ts`**: (New) Logic for invoices.
- **`bills/bills.controller.ts`**: (New) CRUD for bills.
- **`bills/bills.service.ts`**: (New) Logic for bills.
- **`transactions/transactions.service.ts`**: (Refine) Integrate double-entry logic.
- **`prisma/schema.prisma`**: (Refine) Add `JournalEntry`, `Invoice`, `InvoiceLineItem`, `Bill`, `BillLineItem` models. Update `Account` model.

## Testing Considerations

- Verify that all financial statements generate correctly for different timeframes.
- Test CRUD operations for Chart of Accounts, Invoices, and Bills.
- Ensure double-entry bookkeeping is correctly applied for all transaction types.
- Verify proper tax calculation and reporting.
- Test all form validations and error handling mechanisms.
- Check for toast notifications and loading states during user interactions.
- Conduct thorough mobile responsiveness and cross-browser compatibility tests.
- Perform accessibility checks.

## Expected Outcome

A fully functional and compliant accounting system within FinT, capable of handling double-entry bookkeeping, generating accurate financial statements, and managing invoicing and billing processes. The application will be robust, user-friendly, and accessible across various devices and browsers.

