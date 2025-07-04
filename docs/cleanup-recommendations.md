# Cleanup Recommendations - Files to Remove

## Overview

This document identifies files that can be safely removed from the FinT codebase to reduce clutter, eliminate duplicates, and improve maintainability.

## Root Directory Cleanup

### Duplicate Database Check Scripts (REMOVE)
These files are identical duplicates and serve the same purpose:

1. **`db-check.js`** (2.4KB, 75 lines)
2. **`check-structure.js`** (2.4KB, 75 lines) 
3. **`check-db.js`** (2.4KB, 75 lines)
4. **`check-db-structure.js`** (2.4KB, 75 lines)

**Recommendation:** Keep only one file (suggest `db-check.js`) and remove the other three.

### Redundant Test Scripts (REMOVE)
These files are similar and can be consolidated:

1. **`test-db.js`** (1.2KB, 39 lines) - Basic connection test
2. **`check-account-table.js`** (964B, 38 lines) - Account table check
3. **`check-models.js`** (856B, 30 lines) - Model enumeration
4. **`check-account-types.js`** (629B, 23 lines) - Account types check

**Recommendation:** Consolidate into a single comprehensive test script or remove if not needed for production.

### Duplicate Seed Scripts (REMOVE)
These files appear to be duplicates:

1. **`seed-accounts.js`** (8.1KB, 277 lines) - Root directory
2. **`create-sample-accounts.js`** (13KB, 394 lines) - Root directory

**Recommendation:** Keep the more comprehensive one and remove the other.

### Outdated Documentation (MOVE/REMOVE)
1. **`Accounting_Workflow_Documentation.md`** (5.6KB, 157 lines)
2. **`Accounts.md`** (2.8KB, 166 lines)

**Recommendation:** Move to `docs/` folder or remove if superseded by new documentation.

### Legacy Prisma Schema (REMOVE)
1. **`schema.prisma`** (174B, 8 lines) - Root directory

**Recommendation:** Remove if the main schema is in `server/prisma/` directory.

## Server Directory Cleanup

### Duplicate Server Files (REMOVE)
The server has both old Express.js files and new NestJS files:

#### Old Express.js Files (REMOVE - if using NestJS)
1. **`server/server.js`** (2.3KB, 71 lines) - Express server
2. **`server/controllers/`** directory - Express controllers
3. **`server/routes/`** directory - Express routes
4. **`server/models/`** directory - Express models
5. **`server/middleware/`** directory - Express middleware
6. **`server/services/`** directory - Express services
7. **`server/utils/`** directory - Express utilities
8. **`server/config/`** directory - Express configuration
9. **`server/db/`** directory - Express database utilities

**Recommendation:** Remove all Express.js files if the application is fully migrated to NestJS.

### Duplicate Test Scripts (REMOVE)
1. **`server/test-db.js`** (1.1KB, 35 lines)
2. **`server/test-env.js`** (200B, 5 lines)
3. **`server/check-db.js`** (2.0KB, 65 lines)

**Recommendation:** Consolidate into a single test script or remove if not needed.

### Build Artifacts (REMOVE)
1. **`server/dist/`** directory - Compiled TypeScript files

**Recommendation:** Add to `.gitignore` and remove from repository.

### Test Environment Files (REMOVE)
1. **`server/.env.test`** (100B, 3 lines)

**Recommendation:** Remove if not needed for testing or add to `.gitignore`.

### Duplicate Scripts (REMOVE)
1. **`server/scripts/check-accounts.js`** (1.1KB, 40 lines)
2. **`server/scripts/seed-accounts.js`** (3.0KB, 99 lines)

**Recommendation:** Remove if duplicates of root directory scripts.

## Client Directory Cleanup

### Build Artifacts (REMOVE)
1. **`client/build/`** directory - Production build files

**Recommendation:** Add to `.gitignore` and remove from repository.

## Scripts Directory Cleanup

### Duplicate Scripts (REMOVE)
1. **`scripts/check-structure.js`** (1.0B, 1 lines) - Empty file
2. **`scripts/seed-accounts.js`** (8.8KB, 315 lines) - Duplicate
3. **`scripts/create-sample-accounts.js`** (7.3KB, 252 lines) - Duplicate

**Recommendation:** Remove empty files and consolidate duplicates.

## Src Directory Cleanup

### Empty Directories (REMOVE)
1. **`src/styles/`** directory - Empty

**Recommendation:** Remove if not used.

## Node Modules (REMOVE)
1. **`node_modules/`** directories in root, client, and server

**Recommendation:** Already in `.gitignore`, but ensure they're not committed.

## Package Lock Files (KEEP)
1. **`package-lock.json`** files - Keep these for dependency locking

**Recommendation:** Keep these files for consistent dependency versions.

## Summary of Files to Remove

### High Priority (Safe to Remove)
- 4 duplicate database check scripts in root
- 4 redundant test scripts in root
- 2 duplicate seed scripts in root
- 1 empty script file
- 1 empty styles directory
- 1 legacy Prisma schema file

### Medium Priority (Verify Before Removing)
- Old Express.js files if using NestJS
- Duplicate server test scripts
- Build artifact directories
- Test environment files

### Low Priority (Consider Moving)
- Old documentation files

## Estimated Space Savings
- **Files to Remove:** ~50 files
- **Estimated Size Reduction:** ~500KB
- **Improved Maintainability:** Significant

## Cleanup Script

Here's a PowerShell script to remove the identified files:

```powershell
# Remove duplicate database check scripts (keep db-check.js)
Remove-Item "check-structure.js" -Force
Remove-Item "check-db.js" -Force
Remove-Item "check-db-structure.js" -Force

# Remove redundant test scripts
Remove-Item "test-db.js" -Force
Remove-Item "check-account-table.js" -Force
Remove-Item "check-models.js" -Force
Remove-Item "check-account-types.js" -Force

# Remove duplicate seed scripts (keep create-sample-accounts.js)
Remove-Item "seed-accounts.js" -Force

# Remove legacy Prisma schema
Remove-Item "schema.prisma" -Force

# Remove empty styles directory
Remove-Item "src/styles" -Recurse -Force

# Remove empty script file
Remove-Item "scripts/check-structure.js" -Force

# Remove duplicate scripts
Remove-Item "scripts/seed-accounts.js" -Force
Remove-Item "scripts/create-sample-accounts.js" -Force

# Remove server duplicates (if using NestJS)
Remove-Item "server/test-db.js" -Force
Remove-Item "server/test-env.js" -Force
Remove-Item "server/check-db.js" -Force
Remove-Item "server/.env.test" -Force
Remove-Item "server/scripts" -Recurse -Force

# Remove build artifacts (add to .gitignore instead)
# Remove-Item "server/dist" -Recurse -Force
# Remove-Item "client/build" -Recurse -Force
```

## Post-Cleanup Actions

1. **Update .gitignore** to include build artifacts
2. **Update documentation** to reflect new file structure
3. **Test the application** to ensure nothing was broken
4. **Update any scripts** that reference removed files
5. **Commit the cleanup** with a descriptive message 