# FinT - Financial Tracking Application

A modern financial tracking application for managing journal entries, bookkeeping, statements, and bank/credit card management.

## Features

- Account management and categorization
- Transaction tracking and reconciliation
- Journal entries and double-entry accounting
- Bank account and credit card management
- Financial reporting and analytics
- File upload for bank statements
- Modern, responsive UI

## Tech Stack

### Frontend
- React
- Material-UI
- Redux Toolkit
- React Router
- Axios

### Backend
- Node.js
- Express
- Prisma
- PostgreSQL

## Project Structure

```
fint/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── redux/        # State management
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
│
├── server/                # Express backend
│   ├── controllers/      # Route controllers
│   ├── routes/          # API routes
│   ├── prisma/          # Database schema and migrations
│   └── utils/           # Utility functions
│
└── docs/                 # Documentation
```

## Development Guidelines

### Code Organization

1. **File Structure**
   - Keep related files together (components, styles, tests)
   - Use index files for clean exports
   - Follow the established directory structure

2. **Naming Conventions**
   - Components: PascalCase (e.g., `JournalEntry.jsx`)
   - Utilities: camelCase (e.g., `formatCurrency.js`)
   - Constants: UPPER_SNAKE_CASE
   - CSS Modules: `ComponentName.module.css`

3. **Component Structure**
   ```jsx
   // Imports (external, internal, types)
   import React from 'react';
   import PropTypes from 'prop-types';
   import { useDispatch } from 'react-redux';
   
   // Local imports
   import { Button } from '@/components/common';
   import { useAuth } from '@/hooks';
   
   // Component
   export const ComponentName = ({ prop1, prop2 }) => {
     // Hooks
     const dispatch = useDispatch();
     
     // State
     const [state, setState] = useState();
     
     // Effects
     useEffect(() => {
       // Effect logic
     }, []);
     
     // Handlers
     const handleClick = () => {
       // Handler logic
     };
     
     // Render
     return (
       <div>
         {/* Component JSX */}
       </div>
     );
   };
   
   // PropTypes
   ComponentName.propTypes = {
     prop1: PropTypes.string.isRequired,
     prop2: PropTypes.number
   };
   ```

### Code Style

1. **Formatting**
   - Use Prettier for consistent formatting
   - Run `npm run format` before committing
   - Line length: 100 characters max

2. **Linting**
   - Follow ESLint rules
   - Run `npm run lint` before committing
   - Fix issues with `npm run lint:fix`

3. **Best Practices**
   - Use functional components with hooks
   - Keep components small and focused
   - Implement proper error handling
   - Write meaningful comments
   - Use TypeScript for new features

### Git Workflow

1. **Branches**
   - `main`: Production-ready code
   - `develop`: Development branch
   - `feature/*`: New features
   - `bugfix/*`: Bug fixes
   - `hotfix/*`: Urgent production fixes

2. **Commits**
   - Use conventional commits
   - Format: `type(scope): description`
   - Types: feat, fix, docs, style, refactor, test, chore

3. **Pull Requests**
   - Create from feature/bugfix branches
   - Include description of changes
   - Reference related issues
   - Ensure CI passes

### Testing

1. **Unit Tests**
   - Write tests for utilities and hooks
   - Use Jest and React Testing Library
   - Maintain good coverage

2. **Integration Tests**
   - Test component interactions
   - Mock API calls
   - Test user flows

### Performance

1. **Optimization**
   - Use React.memo for expensive renders
   - Implement proper code splitting
   - Optimize images and assets
   - Monitor bundle size

2. **Monitoring**
   - Track key performance metrics
   - Monitor error rates
   - Profile slow operations

## Getting Started

1. **Installation**
   ```bash
   npm install
   ```

2. **Development**
   ```bash
   npm run dev
   ```

3. **Building**
   ```bash
   npm run build
   ```

4. **Linting**
   ```bash
   npm run lint
   npm run lint:fix
   ```

5. **Formatting**
   ```bash
   npm run format
   ```

## Available Scripts

- `npm start`: Start production server
- `npm run dev`: Start development servers
- `npm run build`: Build for production
- `npm run lint`: Run linter
- `npm run format`: Format code
- `npm run prisma:generate`: Generate Prisma client
- `npm run prisma:migrate`: Run database migrations
- `npm run prisma:studio`: Open Prisma Studio

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.