# FinT Frontend - Complete Implementation Guide

## PHASE 10: FRONTEND SETUP

### Step 10.1: Initialize React Project

```bash
# Create React project with TypeScript
npx create-react-app fint-frontend --template typescript
cd fint-frontend

# Install additional dependencies
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
npm install @reduxjs/toolkit react-redux
npm install react-router-dom
npm install axios
npm install react-hook-form @hookform/resolvers yup
npm install react-query
npm install date-fns
npm install react-icons
npm install @types/node

# Install development dependencies
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/react @types/react-dom
npm install -D eslint-config-prettier prettier
```

### Step 10.2: Configure Tailwind CSS

```bash
# Initialize Tailwind CSS
npx tailwindcss init -p
```

### Update tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
        }
      }
    },
  },
  plugins: [],
}
```

### Update src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors;
  }
  
  .btn-secondary {
    @apply bg-secondary-100 hover:bg-secondary-200 text-secondary-700 font-medium py-2 px-4 rounded-lg transition-colors;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
  }
  
  .form-input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
  }
  
  .form-label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }
  
  .form-error {
    @apply text-red-600 text-sm mt-1;
  }
}
```

### Step 10.3: Setup Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common components (Button, Input, etc.)
│   ├── forms/           # Form components
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   └── ui/              # UI-specific components
├── pages/               # Page components
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Dashboard pages
│   ├── businesses/      # Business management pages
│   ├── accounts/        # Chart of accounts pages
│   ├── journal-entries/ # Journal entry pages
│   ├── invoices/        # Invoice pages
│   └── reports/         # Report pages
├── hooks/               # Custom React hooks
├── services/            # API services
├── store/               # Redux store
│   ├── slices/          # Redux slices
│   └── api/             # RTK Query API slices
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── constants/           # Application constants
└── assets/              # Static assets
```

### Step 10.4: Configure Chakra UI

### Update src/index.tsx
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { store } from './store';
import App from './App';
import './index.css';

const theme = extendTheme({
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'primary',
      },
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    </ChakraProvider>
  </React.StrictMode>
);
```

## PHASE 11: REDUX STORE SETUP

### Create src/store/index.ts
```typescript
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authSlice from './slices/authSlice';
import businessSlice from './slices/businessSlice';
import uiSlice from './slices/uiSlice';
import { apiSlice } from './api/apiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    business: businessSlice,
    ui: uiSlice,
    api: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(apiSlice.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Create src/store/slices/authSlice.ts
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businesses?: any[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setCredentials, logout, setLoading, updateUser } = authSlice.actions;
export default authSlice.reducer;
```

### Create src/store/slices/businessSlice.ts
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Business {
  id: string;
  name: string;
  type: string;
  role: string;
  isDefault: boolean;
}

interface BusinessState {
  businesses: Business[];
  currentBusiness: Business | null;
  isLoading: boolean;
}

const initialState: BusinessState = {
  businesses: [],
  currentBusiness: null,
  isLoading: false,
};

const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    setBusinesses: (state, action: PayloadAction<Business[]>) => {
      state.businesses = action.payload;
      // Set default business as current if none selected
      if (!state.currentBusiness && action.payload.length > 0) {
        const defaultBusiness = action.payload.find(b => b.isDefault) || action.payload[0];
        state.currentBusiness = defaultBusiness;
      }
    },
    setCurrentBusiness: (state, action: PayloadAction<Business>) => {
      state.currentBusiness = action.payload;
    },
    addBusiness: (state, action: PayloadAction<Business>) => {
      state.businesses.push(action.payload);
      // Set as current if it's the first business
      if (state.businesses.length === 1) {
        state.currentBusiness = action.payload;
      }
    },
    updateBusiness: (state, action: PayloadAction<Business>) => {
      const index = state.businesses.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.businesses[index] = action.payload;
        if (state.currentBusiness?.id === action.payload.id) {
          state.currentBusiness = action.payload;
        }
      }
    },
    removeBusiness: (state, action: PayloadAction<string>) => {
      state.businesses = state.businesses.filter(b => b.id !== action.payload);
      if (state.currentBusiness?.id === action.payload) {
        state.currentBusiness = state.businesses[0] || null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setBusinesses,
  setCurrentBusiness,
  addBusiness,
  updateBusiness,
  removeBusiness,
  setLoading,
} = businessSlice.actions;

export default businessSlice.reducer;
```

### Create src/store/slices/uiSlice.ts
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Toast {
  id: string;
  title: string;
  description?: string;
  status: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface UIState {
  sidebarCollapsed: boolean;
  toasts: Toast[];
  isLoading: boolean;
  loadingMessage?: string;
}

const initialState: UIState = {
  sidebarCollapsed: false,
  toasts: [],
  isLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const toast: Toast = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<{ isLoading: boolean; message?: string }>) => {
      state.isLoading = action.payload.isLoading;
      state.loadingMessage = action.payload.message;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  addToast,
  removeToast,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
```

### Create src/store/api/apiSlice.ts
```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Business', 'Account', 'JournalEntry', 'Invoice', 'Report'],
  endpoints: () => ({}),
});
```

## PHASE 12: API SERVICES

### Create src/services/authService.ts
```typescript
import { apiSlice } from '../store/api/apiSlice';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    businesses: any[];
  };
  accessToken: string;
  message: string;
}

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isEmailVerified: boolean;
  };
  message: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation<{ message: string }, { token: string; newPassword: string }>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    getProfile: builder.query<any, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<any, Partial<{ firstName: string; lastName: string; phone: string }>>({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi;
```

### Create src/services/businessService.ts
```typescript
import { apiSlice } from '../store/api/apiSlice';

interface Business {
  id: string;
  name: string;
  type: string;
  registrationNumber?: string;
  gstNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  role: string;
  isDefault: boolean;
  createdAt: string;
}

interface CreateBusinessRequest {
  name: string;
  type: string;
  registrationNumber?: string;
  gstNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export const businessApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBusinesses: builder.query<Business[], void>({
      query: () => '/businesses',
      providesTags: ['Business'],
    }),
    getBusiness: builder.query<Business, string>({
      query: (id) => `/businesses/${id}`,
      providesTags: (result, error, id) => [{ type: 'Business', id }],
    }),
    createBusiness: builder.mutation<{ business: Business; message: string }, CreateBusinessRequest>({
      query: (data) => ({
        url: '/businesses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Business'],
    }),
    updateBusiness: builder.mutation<{ business: Business; message: string }, { id: string; data: Partial<CreateBusinessRequest> }>({
      query: ({ id, data }) => ({
        url: `/businesses/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Business', id }],
    }),
    deleteBusiness: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/businesses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Business'],
    }),
    inviteUser: builder.mutation<{ message: string }, { businessId: string; email: string; role: string }>({
      query: ({ businessId, ...data }) => ({
        url: `/businesses/${businessId}/invite`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetBusinessesQuery,
  useGetBusinessQuery,
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
  useDeleteBusinessMutation,
  useInviteUserMutation,
} = businessApi;
```

### Create src/services/accountService.ts
```typescript
import { apiSlice } from '../store/api/apiSlice';

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  subType?: string;
  parentId?: string;
  description?: string;
  isActive: boolean;
  balance: number;
  parent?: {
    id: string;
    name: string;
    code: string;
  };
  children?: {
    id: string;
    name: string;
    code: string;
  }[];
}

interface CreateAccountRequest {
  code: string;
  name: string;
  type: string;
  subType?: string;
  parentId?: string;
  description?: string;
}

interface QueryAccountsParams {
  businessId: string;
  type?: string;
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const accountApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAccounts: builder.query<{ accounts: Account[]; pagination: any }, QueryAccountsParams>({
      query: ({ businessId, ...params }) => ({
        url: `/businesses/${businessId}/accounts`,
        params,
      }),
      providesTags: ['Account'],
    }),
    getAccount: builder.query<Account, { businessId: string; id: string }>({
      query: ({ businessId, id }) => `/businesses/${businessId}/accounts/${id}`,
      providesTags: (result, error, { id }) => [{ type: 'Account', id }],
    }),
    createAccount: builder.mutation<{ account: Account; message: string }, { businessId: string; data: CreateAccountRequest }>({
      query: ({ businessId, data }) => ({
        url: `/businesses/${businessId}/accounts`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Account'],
    }),
    updateAccount: builder.mutation<{ account: Account; message: string }, { businessId: string; id: string; data: Partial<CreateAccountRequest> }>({
      query: ({ businessId, id, data }) => ({
        url: `/businesses/${businessId}/accounts/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Account', id }],
    }),
    deleteAccount: builder.mutation<{ message: string }, { businessId: string; id: string }>({
      query: ({ businessId, id }) => ({
        url: `/businesses/${businessId}/accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Account'],
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useGetAccountQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} = accountApi;
```

## PHASE 13: COMMON COMPONENTS

### Create src/components/common/Button.tsx
```typescript
import React from 'react';
import { Button as ChakraButton, ButtonProps } from '@chakra-ui/react';

interface CustomButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export const Button: React.FC<CustomButtonProps> = ({ 
  variant = 'primary', 
  children, 
  ...props 
}) => {
  const getVariantProps = () => {
    switch (variant) {
      case 'primary':
        return { colorScheme: 'primary' };
      case 'secondary':
        return { colorScheme: 'gray', variant: 'solid' };
      case 'outline':
        return { variant: 'outline', colorScheme: 'primary' };
      case 'ghost':
        return { variant: 'ghost', colorScheme: 'primary' };
      default:
        return { colorScheme: 'primary' };
    }
  };

  return (
    <ChakraButton {...getVariantProps()} {...props}>
      {children}
    </ChakraButton>
  );
};
```

### Create src/components/common/Input.tsx
```typescript
import React from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input as ChakraInput,
  InputProps,
} from '@chakra-ui/react';

interface CustomInputProps extends InputProps {
  label?: string;
  error?: string;
  required?: boolean;
}

export const Input: React.FC<CustomInputProps> = ({
  label,
  error,
  required,
  ...props
}) => {
  return (
    <FormControl isInvalid={!!error} isRequired={required}>
      {label && <FormLabel>{label}</FormLabel>}
      <ChakraInput {...props} />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};
```

### Create src/components/common/Select.tsx
```typescript
import React from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select as ChakraSelect,
  SelectProps,
} from '@chakra-ui/react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps extends Omit<SelectProps, 'children'> {
  label?: string;
  error?: string;
  required?: boolean;
  options: Option[];
  placeholder?: string;
}

export const Select: React.FC<CustomSelectProps> = ({
  label,
  error,
  required,
  options,
  placeholder,
  ...props
}) => {
  return (
    <FormControl isInvalid={!!error} isRequired={required}>
      {label && <FormLabel>{label}</FormLabel>}
      <ChakraSelect placeholder={placeholder} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </ChakraSelect>
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};
```

### Create src/components/common/Card.tsx
```typescript
import React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';

interface CardProps extends BoxProps {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, ...props }) => {
  return (
    <Box
      bg="white"
      rounded="lg"
      shadow="sm"
      border="1px"
      borderColor="gray.200"
      p={6}
      {...props}
    >
      {children}
    </Box>
  );
};
```

### Create src/components/common/LoadingSpinner.tsx
```typescript
import React from 'react';
import { Spinner, Center, Text, VStack } from '@chakra-ui/react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'lg' 
}) => {
  return (
    <Center py={8}>
      <VStack spacing={4}>
        <Spinner size={size} color="primary.500" thickness="4px" />
        <Text color="gray.600">{message}</Text>
      </VStack>
    </Center>
  );
};
```

### Create src/components/common/DataTable.tsx
```typescript
import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Text,
  HStack,
  Button,
  Select,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  isLoading?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  pagination,
  onPageChange,
  onLimitChange,
  isLoading,
}) => {
  return (
    <Box>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              {columns.map((column) => (
                <Th key={column.key}>{column.label}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row, index) => (
              <Tr key={index}>
                {columns.map((column) => (
                  <Td key={column.key}>
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {pagination && (
        <HStack justify="space-between" mt={4}>
          <HStack>
            <Text fontSize="sm" color="gray.600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </Text>
          </HStack>

          <HStack>
            <HStack>
              <Text fontSize="sm">Rows per page:</Text>
              <Select
                size="sm"
                value={pagination.limit}
                onChange={(e) => onLimitChange?.(Number(e.target.value))}
                w="auto"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </HStack>

            <HStack>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<ChevronLeftIcon />}
                onClick={() => onPageChange?.(pagination.page - 1)}
                isDisabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <Text fontSize="sm">
                Page {pagination.page} of {pagination.pages}
              </Text>
              <Button
                size="sm"
                variant="outline"
                rightIcon={<ChevronRightIcon />}
                onClick={() => onPageChange?.(pagination.page + 1)}
                isDisabled={pagination.page >= pagination.pages}
              >
                Next
              </Button>
            </HStack>
          </HStack>
        </HStack>
      )}
    </Box>
  );
};
```

## PHASE 14: LAYOUT COMPONENTS

### Create src/components/layout/Header.tsx
```typescript
import React from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Text,
  useColorModeValue,
  Button,
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { BusinessSelector } from './BusinessSelector';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Box
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      px={4}
      py={3}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Flex justify="space-between" align="center">
        <HStack spacing={4}>
          <IconButton
            aria-label="Toggle sidebar"
            icon={<HamburgerIcon />}
            variant="ghost"
            onClick={() => dispatch(toggleSidebar())}
          />
          <Text fontSize="xl" fontWeight="bold" color="primary.600">
            FinT
          </Text>
        </HStack>

        <HStack spacing={4}>
          <BusinessSelector />
          
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              rightIcon={<ChevronDownIcon />}
              size="sm"
            >
              <HStack spacing={2}>
                <Avatar size="sm" name={`${user?.firstName} ${user?.lastName}`} />
                <Text fontSize="sm">
                  {user?.firstName} {user?.lastName}
                </Text>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem>Profile</MenuItem>
              <MenuItem>Settings</MenuItem>
              <MenuDivider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
};
```

### Create src/components/layout/Sidebar.tsx
```typescript
import React from 'react';
import {
  Box,
  VStack,
  Link,
  Icon,
  Text,
  useColorModeValue,
  Collapse,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiDollarSign,
  FiFileText,
  FiBarChart3,
  FiSettings,
  FiFolder,
  FiUpload,
} from 'react-icons/fi';
import { useAppSelector } from '../../hooks/redux';

interface NavItem {
  name: string;
  icon: any;
  path: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: FiHome, path: '/dashboard' },
  { name: 'Businesses', icon: FiUsers, path: '/businesses' },
  { name: 'Chart of Accounts', icon: FiFolder, path: '/accounts' },
  { name: 'Journal Entries', icon: FiFileText, path: '/journal-entries' },
  { name: 'Invoices', icon: FiDollarSign, path: '/invoices' },
  {
    name: 'Reports',
    icon: FiBarChart3,
    path: '/reports',
    children: [
      { name: 'Ledger', icon: FiFileText, path: '/reports/ledger' },
      { name: 'Trial Balance', icon: FiFileText, path: '/reports/trial-balance' },
      { name: 'Balance Sheet', icon: FiFileText, path: '/reports/balance-sheet' },
      { name: 'P&L Statement', icon: FiFileText, path: '/reports/profit-loss' },
    ],
  },
  { name: 'Bank Statements', icon: FiUpload, path: '/statements' },
  { name: 'Settings', icon: FiSettings, path: '/settings' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);
  const bg = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const NavLink: React.FC<{ item: NavItem; isChild?: boolean }> = ({ item, isChild = false }) => {
    const isActive = location.pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <Box w="full">
        <Link
          as={RouterLink}
          to={item.path}
          display="flex"
          alignItems="center"
          px={isChild ? 6 : 4}
          py={3}
          rounded="md"
          bg={isActive ? 'primary.50' : 'transparent'}
          color={isActive ? 'primary.600' : 'gray.600'}
          fontWeight={isActive ? 'semibold' : 'normal'}
          _hover={{
            bg: isActive ? 'primary.50' : 'gray.100',
            textDecoration: 'none',
          }}
          fontSize={isChild ? 'sm' : 'md'}
        >
          <Icon as={item.icon} mr={sidebarCollapsed ? 0 : 3} />
          <Collapse in={!sidebarCollapsed} animateOpacity>
            <Text>{item.name}</Text>
          </Collapse>
        </Link>

        {hasChildren && !sidebarCollapsed && (
          <VStack spacing={0} align="stretch" mt={1}>
            {item.children!.map((child) => (
              <NavLink key={child.path} item={child} isChild />
            ))}
          </VStack>
        )}
      </Box>
    );
  };

  return (
    <Box
      bg={bg}
      borderRight="1px"
      borderColor={borderColor}
      w={sidebarCollapsed ? '16' : '64'}
      h="calc(100vh - 64px)"
      position="sticky"
      top="64px"
      transition="width 0.2s"
      overflowY="auto"
    >
      <VStack spacing={1} align="stretch" p={4}>
        {navItems.map((item) => (
          <NavLink key={item.path} item={item} />
        ))}
      </VStack>
    </Box>
  );
};
```

### Create src/components/layout/BusinessSelector.tsx
```typescript
import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { setCurrentBusiness } from '../../store/slices/businessSlice';

export const BusinessSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const { businesses, currentBusiness } = useAppSelector((state) => state.business);

  const handleBusinessChange = (business: any) => {
    dispatch(setCurrentBusiness(business));
  };

  if (!currentBusiness) {
    return null;
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="outline"
        rightIcon={<ChevronDownIcon />}
        size="sm"
        maxW="200px"
      >
        <HStack spacing={2}>
          <Text isTruncated>{currentBusiness.name}</Text>
          <Badge colorScheme="primary" size="sm">
            {currentBusiness.role}
          </Badge>
        </HStack>
      </MenuButton>
      <MenuList>
        {businesses.map((business) => (
          <MenuItem
            key={business.id}
            onClick={() => handleBusinessChange(business)}
            bg={business.id === currentBusiness.id ? 'primary.50' : 'transparent'}
          >
            <HStack justify="space-between" w="full">
              <Text>{business.name}</Text>
              <Badge colorScheme="gray" size="sm">
                {business.role}
              </Badge>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
```

This comprehensive implementation guide provides step-by-step instructions for building the complete FinT application. Each section includes detailed code examples, proper TypeScript types, and follows React/Redux best practices. Cursor AI can follow these instructions sequentially to build a fully functional financial management application.

