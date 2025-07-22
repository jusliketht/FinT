# Cursor Prompt: FinT Application Development - Phase 2: Global Transaction Management, Reconciliation, and User Profile

This prompt outlines the second phase of development for the FinT application, focusing on implementing robust global transaction management, bank statement parsing and reconciliation, and comprehensive user profile management.

## Phase Goal
To enable users to seamlessly add, edit, and manage transactions from anywhere in the application, reconcile bank statements efficiently, and maintain their personal and business registration details within a dedicated user profile.

## Key Features to Implement/Refine

### 1. Global Transaction Management

#### 1.1. Add Transaction (Modal)

**Objective**: Provide a highly accessible and user-friendly modal for adding new transactions, available from any part of the application.

**Details**:
- **Accessibility**: A prominent button (e.g., a floating action button, or a dedicated button in the Topbar/Sidebar) should trigger the transaction modal.
- **Modal Fields**: The modal should include the following input fields:
    - **Date**: Date picker for selecting the transaction date.
    - **Transaction Type**: Dropdown with options: `Income`, `Expense`, `Transfer`, `Adjustment`. This should dynamically adjust subsequent fields or logic.
    - **Amount**: Numeric input for the transaction amount.
    - **Description/Narration**: Text area for detailed transaction description.
    - **Category/Account**: Dropdown populated from the Chart of Accounts. This should be a searchable dropdown.
    - **Person/Entity Tag**: Text input or searchable dropdown to tag the transaction with a specific customer, vendor, employee, or other entity. This should link to a separate entity management module if available, or allow free-form entry.
    - **Payment Method**: Dropdown for payment methods (e.g., Cash, Bank Transfer, Credit Card, Cheque).
    - **Reference Number**: Optional text input for invoice numbers, cheque numbers, etc.
    - **Attachments**: Functionality to upload multiple attachments (e.g., receipts, invoices) associated with the transaction.
- **Add New Account from Modal**: If the user needs to select an account that doesn't exist in the Chart of Accounts, there should be an option (e.g., a button next to the Category/Account dropdown) to quickly add a new account directly within the modal, without navigating away. Upon creation, the new account should be pre-selected in the transaction form.

**Implementation Notes**:
- Use Chakra UI `Modal`, `FormControl`, `Input`, `Select`, `Textarea`, `DatePicker` (or a suitable third-party date picker integrated with Chakra), and `Button` components.
- Implement form validation for all fields (e.g., required fields, numeric amounts, valid dates).
- Integrate with backend APIs for creating transactions and fetching Chart of Accounts data.
- Ensure proper loading states and error messages for form submission.

#### 1.2. Edit Transaction

**Objective**: Allow users to modify all details of an existing transaction.

**Details**:
- **Access**: The edit functionality should be accessible from transaction lists (e.g., a dedicated edit button/icon next to each transaction) and potentially from a transaction detail view.
- **Full Editability**: All fields that are available during transaction creation should be editable. The modal used for adding transactions can be reused for editing, pre-populated with existing transaction data.
- **Validation**: Apply the same validation rules as for new transactions.

**Implementation Notes**:
- Fetch the existing transaction data from the backend using its ID.
- Populate the modal fields with the fetched data.
- Implement backend API for updating transactions.

#### 1.3. Transaction Listing

**Objective**: Provide a comprehensive view of all transactions with robust filtering, sorting, and search capabilities.

**Details**:
- **Filter Options**: Filters for:
    - Date Range (e.g., custom range, current month, last quarter, current year)
    - Transaction Type (Income, Expense, Transfer, Adjustment)
    - Account/Category
    - Person/Entity Tag
    - Reconciliation Status (Verified, Unverified)
- **Sorting**: Sort by Date, Amount, Description, etc.
- **Search**: Free-text search across description, reference number, and entity tags.
- **Pagination**: Implement pagination for efficient loading and display of large datasets.
- **Status Display**: Clearly display the reconciliation status of each transaction (e.g., a badge or icon for 'Verified' or 'Unverified').

**Implementation Notes**:
- Use Chakra UI `Table`, `Input`, `Select`, `DatePicker`, and `Pagination` components.
- Implement client-side filtering/sorting if dataset is small, otherwise integrate with backend API for server-side filtering/sorting/searching.

### 2. Bank Statement Parsing and Reconciliation

#### 2.1. PDF Statement Upload

**Objective**: Enable secure upload and processing of password-protected PDF bank and credit card statements.

**Details**:
- **Secure Upload**: Implement a secure file upload mechanism for PDF files.
- **Password Protection**: Handle password-protected PDFs. The user should be prompted to enter the password if the PDF is encrypted.
- **Bank Format Handling**: The backend should be capable of parsing statements from various Indian banks (e.g., HDFC, ICICI, SBI, Axis, etc.). This implies a flexible parsing engine or pre-configured parsers for common formats.

**Implementation Notes**:
- Frontend: Use Chakra UI `Input type=


file"` for file selection. Display upload progress and success/error messages.
- Backend: Implement a robust file upload endpoint. Use a library like `multer` for handling file uploads and `pdf-parse` or similar for PDF content extraction. For password-protected PDFs, integrate a library that supports decryption (e.g., `pdf-lib` or `pdftk` via shell commands if necessary, but prefer Node.js libraries).

#### 2.2. Automated Parsing

**Objective**: Automatically extract transaction data from parsed PDF content and suggest intelligent categorizations.

**Details**:
- **Data Extraction**: Extract key transaction details: date, description, amount, and transaction type (debit/credit).
- **Intelligent Categorization**: Based on the transaction description, suggest a category/account from the Chart of Accounts. This can be achieved through rule-based matching (e.g., keywords) or machine learning models (if scope allows, otherwise start with rule-based).

**Implementation Notes**:
- Backend: Develop a parsing service that takes the raw text from the PDF and applies parsing rules. Store extracted transactions temporarily before reconciliation.
- Frontend: Display the extracted transactions in a review interface, allowing users to confirm or modify suggested categorizations.

#### 2.3. Reconciliation Process

**Objective**: Facilitate the matching of imported bank transactions with existing journal entries and allow for manual verification.

**Details**:
- **Matching Algorithm**: Implement an algorithm to automatically suggest matches between imported bank statement lines and existing transactions in the system (e.g., based on date, amount, description similarity).
- **Review Interface**: Present suggested matches to the user for review and confirmation.
- **Create New Entries**: For unmatched bank statement lines, provide an option to create a new journal entry directly from the reconciliation interface, pre-populating fields with extracted data.
- **Tagging as Verified**: Once a bank statement line is successfully matched or a new entry is created from it, the corresponding transaction in the system should be tagged as `Verified` or `Reconciled`.
- **Manual Verification**: Allow users to manually mark any transaction as `Verified` or `Reconciled` even if it wasn't part of a bank statement import.

**Implementation Notes**:
- Frontend: Design a clear and interactive reconciliation UI, possibly with two panes (bank statement on one side, system transactions on the other) or a single list with clear matching indicators.
- Backend: Develop API endpoints for matching transactions, creating new transactions during reconciliation, and updating reconciliation status.

### 3. User Profile Management

#### 3.1. Profile Access

**Objective**: Provide easy access to the user's personal and business registration information.

**Details**:
- **Top Menu Access**: The user profile section should be accessible via a clickable element (e.g., user avatar or name) in the top header, leading to a dedicated profile page.

**Implementation Notes**:
- Frontend: Implement the click handler in `components/layout/Topbar.jsx` to navigate to the user profile page.

#### 3.2. Basic Info

**Objective**: Allow users to view and edit their fundamental personal details.

**Details**:
- **Fields**: Display and allow editing of:
    - Name
    - Email (might require re-verification upon change)
    - Contact Number
- **Password Change**: Provide a secure form for changing the user's password.

**Implementation Notes**:
- Frontend: Create a form using Chakra UI components for displaying and editing user details. Implement client-side validation.
- Backend: Develop API endpoints for fetching and updating user basic info and for changing passwords. Ensure secure password hashing.

#### 3.3. Business Registration Details

**Objective**: Enable users to store and manage their business-specific registration details, crucial for compliance and reporting.

**Details**:
- **Fields**: For each business associated with the user, allow viewing and editing of:
    - **PAN (Permanent Account Number)**: Text input for the business's PAN.
    - **GST (Goods and Services Tax) Registration Number**: Text input for the business's GSTIN.
- **Editable**: All these fields should be editable by the user.

**Implementation Notes**:
- Frontend: Integrate these fields into the user profile page, possibly within a dedicated section or tab for business details. Ensure these fields are associated with the currently selected business context.
- Backend: Develop API endpoints for fetching and updating business registration details. Ensure data is stored securely and linked to the correct business entity.

## Files to Modify/Create

### Client-side (`client/src/`)

- **`pages/TransactionsPage/index.jsx`**: Refine this page to include the transaction listing with filters, sorting, and search.
- **`components/transactions/TransactionForm.jsx`**: (New/Refine) Component for the Add/Edit Transaction modal. This should be a reusable component.
- **`components/transactions/TransactionList.jsx`**: (New/Refine) Component for displaying the list of transactions.
- **`pages/bankStatements/BankReconciliation.jsx`**: (Refine) Implement PDF upload, automated parsing review, and reconciliation interface.
- **`pages/Settings/index.jsx`**: (Refine/Rename to `UserProfilePage.jsx` if more appropriate) This page will host the user profile management.
- **`components/user/UserProfileForm.jsx`**: (New) Component for basic user info and password change.
- **`components/user/BusinessRegistrationForm.jsx`**: (New) Component for PAN and GST registration details.
- **`contexts/AuthContext.js`**: Review for any necessary updates related to user profile management.

### Backend-side (`server/src/`)

- **`transactions/transactions.controller.ts`**: Update endpoints for creating, updating, and fetching transactions, including new fields.
- **`transactions/transactions.service.ts`**: Implement logic for creating, updating, and fetching transactions. Ensure proper type handling for all fields.
- **`transactions/dto/create-transaction.dto.ts`**: Update DTO with new fields and correct types (e.g., `transactionType` as union type, `startDate` as `Date` with transformation).
- **`transactions/dto/update-transaction.dto.ts`**: Similar updates as `create-transaction.dto.ts`.
- **`transactions/dto/get-transactions-query.dto.ts`**: Update DTO with new filter fields and correct types.
- **`pdf-statement/pdf-statement.controller.ts`**: Implement endpoints for PDF upload and parsing.
- **`pdf-statement/pdf-statement.service.ts`**: Implement PDF parsing logic, data extraction, and reconciliation algorithms.
- **`users/users.controller.ts`**: Add/update endpoints for fetching and updating user profile information, including password change.
- **`users/users.service.ts`**: Implement logic for user profile management.
- **`business/business.controller.ts`**: Add/update endpoints for managing business registration details (PAN, GSTIN).
- **`business/business.service.ts`**: Implement logic for managing business registration details.
- **`prisma/schema.prisma`**: Update schema to include new fields for transactions (attachments, reconciliation status), and business registration details (PAN, GSTIN).

## Testing Considerations

- Verify that the Add Transaction modal appears correctly from various parts of the application.
- Test all fields in the transaction modal, including adding a new account on the fly.
- Test editing existing transactions and ensure all fields are updated correctly.
- Verify filtering, sorting, and searching on the transaction listing page.
- Test PDF upload for both password-protected and unprotected files.
- Verify accurate parsing and suggested categorization of bank statement lines.
- Test the reconciliation process, including automatic matching, manual confirmation, and creating new entries from unmatched lines.
- Ensure transactions are correctly tagged as `Verified` after reconciliation.
- Test accessing the user profile from the top menu.
- Verify viewing and editing of basic user info and password change functionality.
- Test viewing and editing of business PAN and GST registration details.

## Expected Outcome

A fully functional transaction management system with global access, robust bank statement parsing and reconciliation, and a comprehensive user profile management section, significantly enhancing the FinT application's core functionality and user experience.

