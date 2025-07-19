## Cursor Prompt: Implement New UI/UX Layout and Design System

**Goal:** Implement the new UI/UX layout and design system across all relevant screens of the FinT application, adhering to the provided design concepts and design system documentation.

**Reference Documents:**
- `fint_design_system.md`: Comprehensive design system with color palette, typography, spacing, and component guidelines.
- `fint_dashboard_design.png`, `fint_reports_design.png`, `fint_transactions_design.png`, `fint_mobile_design.png`: High-fidelity visual designs for key screens.

**General Implementation Guidelines:**
1.  **Chakra UI Integration:** Leverage existing Chakra UI components where possible, applying the new design system's styles (colors, spacing, typography, shadows, rounded corners).
2.  **Consistency:** Ensure consistent application of the design system across all screens and components.
3.  **Responsiveness:** Implement responsive design principles, prioritizing mobile-first, as outlined in `fint_design_system.md`.
4.  **Clean Code:** Maintain clean, readable, and well-structured React components.

**Specific Tasks for Cursor (Screen by Screen):**

### 1. Global Layout (`client/src/App.jsx` or similar layout component)
-   **Top Navigation Bar:**
    -   Implement the new design for the top navigation bar (e.g., `Navy Blue` background, `FinT` logo, user avatar/menu).
    -   Ensure it's fixed at the top and responsive.
-   **Left Sidebar Navigation:**
    -   Redesign the left sidebar based on the `Light Gray` background and new navigation icons/styles.
    -   Implement collapsible functionality for mobile views.
-   **Main Content Area:**
    -   Apply `White` background and `Content Padding` as per the design system.

### 2. Dashboard (`client/src/pages/Dashboard/index.jsx`)
-   **Metric Cards:**
    -   Redesign the four key metric cards (Total Revenue, Expenses, Profit/Loss, Cash Flow) using the specified `Gradient Colors`.
    -   Apply `Rounded corners (8px)` and `Subtle shadow`.
    -   Ensure `Large Amounts` typography and include percentage changes with up/down arrows and mini charts as shown in `fint_dashboard_design.png`.
-   **Recent Transactions Table:**
    -   Apply `Clean data table` styling with `Alternating row colors` and `Modern typography`.
    -   Ensure `Table Cell Padding` and `Component Spacing` are applied.
-   **Action Buttons:**
    -   Redesign 'Add Transaction', 'Generate Report', and other quick action buttons using `Primary Blue` color and `Rounded corners (6px)`.

### 3. Financial Reports (`client/src/pages/Reports/index.jsx` and related components)
-   **Tabbed Interface:**
    -   Redesign the tab navigation for Trial Balance, P&L Statement, Balance Sheet, and Cash Flow with `Elegant tab navigation` and `Active state styling`.
-   **Date Range Selector & Buttons:**
    -   Apply new styles for the date range picker, export, and print buttons.
-   **Data Tables (within each report component):**
    -   Ensure all financial data tables (e.g., in `client/src/components/reports/TrialBalance.jsx`, `BalanceSheet.jsx`, `IncomeStatement.jsx`, `CashFlow.jsx`) adhere to the `Clean data table` styling.
    -   Apply `Semantic Colors` for positive/negative numbers (Green for positive, Red for negative).
    -   Ensure `Table Amounts` typography is used.

### 4. Transaction Management (`client/src/pages/TransactionsPage.jsx` and related components)
-   **Transaction List/Table:**
    -   Redesign the transaction list/table with `Clean design`, `Status badges` (green for paid, yellow for pending, red for overdue), and proper amount formatting.
-   **Top Section:**
    -   Redesign the 'Add Transaction' button, search/filter bar, and bulk actions dropdown.
-   **Transaction Summary (Right Sidebar):**
    -   Implement the transaction summary section with a `Donut chart visualization` using brand colors.
-   **Transaction Detail Modal:**
    -   Apply new design to the transaction detail modal overlay, including form fields, spacing, and call-to-action buttons.

### 5. Invoice & Bill Management (e.g., `client/src/components/invoices/InvoiceList.jsx`, `client/src/components/customers/CustomerList.jsx`)
-   **List Views:**
    -   Apply the `Clean data table` styling to invoice and customer lists.
-   **Forms:**
    -   Redesign forms for creating/editing invoices, bills, customers, and vendors using the new `Form` component guidelines (Input Fields, Labels, Validation).

### 6. Business Management (`client/src/pages/business/BusinessManagement.jsx`)
-   **Business List & Forms:**
    -   Apply the new design system to the business list and business creation/editing forms.

**Action:** Proceed with modifying the React components and their associated CSS/styling to implement the new UI/UX designs. Prioritize the global layout and then move to individual screens, ensuring consistency and responsiveness throughout. After implementing the changes, test the application to ensure all components render correctly and functionality is preserved.
