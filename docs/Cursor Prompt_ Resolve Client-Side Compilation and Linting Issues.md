## Cursor Prompt: Resolve Client-Side Compilation and Linting Issues

**Goal:** Fix the `Module not found` errors related to financial report components, resolve file duplication, and address ESLint warnings to ensure the React client application compiles and runs cleanly.

**Current State:**
- The client application fails to compile with `Module not found` errors for `TrialBalance.jsx`, `ProfitAndLoss.jsx`, `BalanceSheet.jsx`, and `CashFlow.jsx`.
- The error message indicates a case sensitivity mismatch in file paths (e.g., `pages/reports` vs `pages/Reports`).
- Financial report components exist in two locations: `client/src/components/reports/` and `client/src/pages/Reports/`.
- Numerous ESLint warnings exist for unused variables and missing `useEffect` dependencies.

**Tasks for Cursor:**

1.  **Standardize Financial Report Component Location:**
    *   **Decision:** All financial report components (`TrialBalance.jsx`, `ProfitAndLoss.jsx`, `BalanceSheet.jsx`, `CashFlow.jsx`, `IncomeStatement.jsx`) should reside *only* in `client/src/components/reports/`.
    *   **Action:** Delete the duplicate files from `client/src/pages/Reports/`.
        *   `rm client/src/pages/Reports/BalanceSheet.jsx`
        *   `rm client/src/pages/Reports/CashFlow.jsx`
        *   `rm client/src/pages/Reports/ProfitAndLoss.jsx`
        *   `rm client/src/pages/Reports/TrialBalance.jsx`
        *   `rm client/src/pages/Reports/Reports.js` (This file seems to be a remnant, remove it).

2.  **Correct Import Paths in `client/src/routes.jsx`:**
    *   Ensure all imports for `TrialBalance`, `ProfitAndLoss`, `BalanceSheet`, and `CashFlow` in `client/src/routes.jsx` correctly point to `../../components/reports/`.
    *   Example: `const TrialBalance = lazy(() => import('../../components/reports/TrialBalance'));`

3.  **Correct Import Paths in `client/src/pages/Reports/index.jsx`:**
    *   Verify that `IncomeStatement`, `BalanceSheet`, `TrialBalance`, and `CashFlow` are imported from `../../components/reports/`.
    *   Ensure the `CashFlow` component is correctly rendered in its `TabPanel` (it was previously commented out with a 


coming soon" message).

4.  **Address ESLint Warnings:**
    *   Go through each file listed in the ESLint warnings (e.g., `src/components/bankStatements/ReconciliationTable.jsx`, `src/components/business/BusinessForm.jsx`, etc.).
    *   For `no-unused-vars` warnings: Either use the declared variables/imports or remove them if they are truly unnecessary.
    *   For `react-hooks/exhaustive-deps` warnings: Add the missing dependencies to the `useEffect` dependency array or, if the effect truly doesn't depend on those values and you understand the implications, disable the rule for that specific line (though adding dependencies is generally preferred).

5.  **Clean and Reinstall Dependencies:**
    *   After making all code changes, run:
        ```bash
        rm -rf node_modules
        npm install
        ```
    *   This ensures a clean slate and that all dependencies are correctly installed based on the updated `package.json`.

6.  **Attempt Client Application Startup:**
    *   Run `npm start` in the `client` directory.
    *   Confirm that the application compiles successfully and starts without errors.

**Expected Outcome:**
- The React client application compiles and starts without any `Module not found` errors.
- All financial report components load and render correctly.
- All ESLint warnings are resolved, leading to a cleaner codebase.
- The application is accessible in the browser, and all routes function as expected.

**Action:** Proceed with the above steps to diagnose and fix the client-side startup and linting issues.

