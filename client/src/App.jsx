import React, { Suspense } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from 'react-query';

// Theme and Providers
import theme from './theme/theme';
import { AuthProvider } from './contexts/AuthContext';
import { BusinessProvider } from './contexts/BusinessContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TransactionProvider } from './contexts/TransactionContext';

// Components
import ErrorBoundary from './components/common/ErrorBoundary';
import { PageLoadingSpinner } from './components/common/LoadingStates';
import FloatingActionButton from './components/common/FloatingActionButton';
import GlobalTransactionModal from './components/transactions/GlobalTransactionModal';

// Routes
import AppRoutes from './routes';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RouteLoading = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <PageLoadingSpinner />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <BusinessProvider>
                  <TransactionProvider>
                    <Suspense fallback={<RouteLoading />}>
                      <AppRoutes />
                    </Suspense>
                    
                    {/* Global Components */}
                    <FloatingActionButton />
                    <GlobalTransactionModal />
                  </TransactionProvider>
                </BusinessProvider>
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );
}

export default App; 