# Updated Cleanup Recommendations

## Overview

This document provides an updated list of cleanup recommendations for the FinT codebase, based on the latest review.

## High-Priority Cleanup

### 1. Remove Unused PDF Statement Feature
The PDF statement processing feature is not implemented on the backend, and the frontend service is not used by any component. To avoid confusion, all related files should be removed.

- **Files to Remove:**
  - `client/src/services/pdfStatementService.js`
  - `test-files/test-pdf-upload.js`

- **Documentation to Update:**
  - `docs/pdf-statement-processing.md`: Can be removed or kept as a reference for future implementation. The current version has a note about the feature not being implemented.

### 2. Remove Stub/Empty Controllers
Some controllers are stubs and should be either implemented or removed.

- **Files to Remove:**
  - `server/src/accounting/controllers/journal-entries.controller.ts`

### 3. Remove Unused Root-level Scripts
The following script in the root directory is not referenced in any `package.json` script and seems to be a leftover.

- **File to Remove:**
  - `create-sample-accounts.js`

### 4. Remove Duplicate User Controller
There seems to be a leftover `users.controller.ts` file in the `users` module.

- **File to Remove:**
    - `server/src/users/users.controller.ts` (the one in the root of the `users` module, not in `users/controllers/`)


## Medium-Priority Cleanup

### 1. Review and Consolidate Test Files
The `test-files` directory contains several files for testing specific functionalities. It would be beneficial to review and consolidate them into a more structured testing suite (e.g., using Jest).

- **Files to Review:**
  - `test-files/create-sample-pdf.js`
  - `test-files/sample-hdfc-statement.pdf`
  - `test-files/sample-hdfc-statement.txt`

### 2. Consolidate `db-check.js`
The `db-check.js` script in the root is used, but it could be moved to the `scripts` directory to keep all scripts in one place.

- **Action:**
  - Move `db-check.js` to `scripts/db-check.js`
  - Update the `db:check` script in the root `package.json` to point to the new location.

## Post-Cleanup Actions

1. **Test the application** to ensure nothing was broken by the cleanup.
2. **Commit the cleanup** with a descriptive message. 