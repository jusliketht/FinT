# Cursor Optimization Rules for FinT Development

## Goal
To guide Cursor in generating high-quality, consistent, and efficient code for the FinT application, ensuring adherence to architectural best practices, maintainability, and project standards.

## General Principles for Cursor

1.  **Adhere to Previous Prompts**: Always prioritize and strictly follow instructions from previous Cursor prompts, especially those related to architectural streamlining, DTO management, and phase-wise development. These establish the project's foundation and direction.
2.  **Prioritize Clarity and Readability**: Generate code that is easy to understand, well-commented (where necessary), and follows standard naming conventions (e.g., camelCase for variables, PascalCase for classes/components).
3.  **Focus on Modularity and Reusability**: Break down complex functionalities into smaller, reusable modules, components, and services. Avoid monolithic code blocks.
4.  **Implement Robust Error Handling**: For both backend and frontend, implement comprehensive error handling mechanisms. Use try-catch blocks, appropriate HTTP status codes, and user-friendly error messages/notifications.
5.  **Ensure Data Validation**: Always include data validation at the entry points (e.g., DTOs in backend, forms in frontend) to maintain data integrity and prevent invalid data from entering the system.
6.  **Consider Performance**: Write efficient code, especially for database queries and complex calculations. Avoid unnecessary re-renders in React components.
7.  **Write Testable Code**: Structure code in a way that facilitates easy unit, integration, and end-to-end testing.

## Backend (NestJS/TypeScript/Prisma) Specific Rules

1.  **Strict Type Checking**: Always use explicit types for variables, function parameters, and return values. Avoid `any` unless absolutely necessary for external libraries or complex dynamic data.
2.  **DTO as Single Source of Truth**: All data transfer objects (`.dto.ts` files) must be the single source of truth for data structures. Services and controllers must import and use these DTOs directly, never redefine them as interfaces.
3.  **Validation Pipes**: Leverage `class-validator` and `class-transformer` decorators extensively in DTOs for validation and type transformation (e.g., converting string dates to `Date` objects). Ensure the global `ValidationPipe` is enabled in `main.ts`.
4.  **Dependency Injection**: Always use NestJS's Dependency Injection system for services, controllers, and modules. Avoid manual instantiation of services within other services/controllers unless explicitly required (e.g., for testing utilities).
5.  **Prisma Usage**: 
    *   Use Prisma Client for all database interactions. 
    *   Ensure `PrismaService` is correctly injected into services that interact with the database.
    *   After any schema changes, always instruct to run `npx prisma generate` and `npx prisma migrate dev` (if new migrations are needed).
6.  **Module Organization**: Keep modules focused on a single domain (e.g., `AccountingModule`, `AuthModule`, `TransactionsModule`).
7.  **Error Handling in Services**: Services should handle business logic errors and throw custom exceptions (e.g., `NotFoundException`, `BadRequestException`) that can be caught by controllers or global exception filters.

## Frontend (React/Chakra UI) Specific Rules

1.  **Component Reusability**: Design React components to be as reusable as possible. Use props effectively to make components configurable.
2.  **Chakra UI Consistency**: Utilize Chakra UI components and styling props (`sx`, `css`) for all UI elements to maintain a consistent design system. Adhere to the established design tokens (colors, typography, spacing).
3.  **State Management**: Use React Hooks (`useState`, `useEffect`, `useContext`) for local component state. For global state, ensure `BusinessContext` or other relevant contexts are used appropriately.
4.  **`useEffect` Dependencies**: Always ensure `useEffect` hooks have exhaustive dependencies. If a dependency is a function, consider memoizing it with `useCallback` if it's passed down to child components.
5.  **Form Handling**: Use a consistent approach for form handling (e.g., `react-hook-form` or similar) with integrated validation.
6.  **Responsive Design**: Implement responsive layouts using Chakra UI's responsive props (e.g., `columns={{ base: 1, md: 2, lg: 3 }}`) to ensure the application looks good on all screen sizes.
7.  **User Feedback**: Provide clear user feedback for asynchronous operations (loading states, success messages, error notifications using `toast`).

## Development Workflow Rules

1.  **Incremental Changes**: Implement changes in small, testable increments. Avoid large, sweeping changes that are difficult to debug.
2.  **Verify After Each Step**: After implementing a significant change, always attempt to start both the backend and frontend to verify that no new compilation errors or runtime issues have been introduced.
3.  **Address ESLint Warnings**: While not always critical, address ESLint warnings (especially `no-unused-vars` and `exhaustive-deps`) as part of the development process to maintain code quality.
4.  **Clear Communication**: If a task is ambiguous or requires a design decision, ask clarifying questions. If a solution involves trade-offs, explain them.

By following these rules, Cursor will be optimized to contribute effectively to the FinT project, producing a robust, maintainable, and user-friendly application.

