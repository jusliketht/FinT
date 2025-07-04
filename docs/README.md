# FinT - Financial Tracking Application Documentation

## Overview

FinT is a modern financial tracking application designed for managing journal entries, bookkeeping, statements, and bank/credit card management. The application follows a full-stack architecture with a React frontend and NestJS backend.

## Project Structure

```
FinT/
├── client/                 # React frontend application
├── server/                 # NestJS backend application
├── docs/                   # Documentation (this folder)
├── prisma/                 # Database schema and migrations
└── ...
```

## Documentation Index

### 1. [Architecture Overview](./architecture.md)
- System architecture
- Technology stack
- Design patterns

### 2. [Backend Documentation](./backend/)
- [API Documentation](./backend/api.md)
- [Database Schema](./backend/database.md)

### 3. [Frontend Documentation](./frontend/)
- [Frontend Overview](./frontend/README.md)

### 4. Other Documentation
- [Accounting Workflow](./Accounting_Workflow_Documentation.md)
- [PDF Statement Processing](./pdf-statement-processing.md)
- [Accounts](./Accounts.md)


## Quick Start

1. **Installation**: See the root [README.md](../README.md)
2. **Development**: See the root [README.md](../README.md)
3. **API Reference**: See [API Documentation](./backend/api.md)

## Key Features

- **Account Management**: Complete account categorization and management system
- **Journal Entries**: Double-entry bookkeeping with transaction tracking
- **Banking Integration**: Bank account and credit card management
- **Financial Reporting**: Comprehensive reporting and analytics
- **File Upload**: Support for bank statement uploads
- **Modern UI**: Responsive UI with Chakra UI and Tailwind CSS

## Technology Stack

### Frontend
- React 18
- Chakra UI & Tailwind CSS
- Redux Toolkit
- React Router
- Axios

### Backend
- NestJS (Node.js framework)
- Prisma (database ORM)
- PostgreSQL

### Development Tools
- TypeScript
- ESLint
- Prettier

## Contributing

Please refer to the root [README.md](../README.md) for contribution guidelines and coding standards.

## License

This project is licensed under the MIT License. 