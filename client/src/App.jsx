import React, { Suspense } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import ProtectedRoute from './components/common/ProtectedRoute';
import { PageLoadingSpinner } from './components/common/LoadingStates';
import Layout from './components/layout/Layout';
import FloatingActionButton from './components/common/FloatingActionButton';
import GlobalTransactionModal from './components/transactions/GlobalTransactionModal';

// Pages - Lazy loaded for better performance
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const TransactionsPage = React.lazy(() => import('./pages/TransactionsPage'));
const Reports = React.lazy(() => import('./pages/Reports'));
const BusinessManagement = React.lazy(() => import('./pages/business/BusinessManagement'));
const Settings = React.lazy(() => import('./pages/Settings'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const ChartOfAccountsPage = React.lazy(() => import('./pages/accounts/ChartOfAccountsPage'));
const InvoiceList = React.lazy(() => import('./components/invoices/InvoiceList'));
const BillsPage = React.lazy(() => import('./pages/bills'));
const BankReconciliation = React.lazy(() => import('./pages/bankStatements/BankReconciliation'));

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Loading component for lazy-loaded routes
const RouteLoading = () => <PageLoadingSpinner message="Loading page..." />;

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
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      
                      {/* Protected Routes */}
                      <Route path="/" element={
                        <ProtectedRoute requireAuth={true} requireBusiness={false}>
                          <Layout>
                            <Dashboard />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/transactions" element={
                        <ProtectedRoute requireAuth={true} requireBusiness={false}>
                          <Layout>
                            <TransactionsPage />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/reports" element={
                        <ProtectedRoute requireAuth={true} requireBusiness={false}>
                          <Layout>
                            <Reports />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/business" element={
                        <ProtectedRoute requireAuth={true} requireBusiness={false}>
                          <Layout>
                            <BusinessManagement />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/accounts" element={
                        <ProtectedRoute requireAuth={true} requireBusiness={false}>
                          <Layout>
                            <ChartOfAccountsPage />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/invoices" element={
                        <ProtectedRoute requireAuth={true} requireBusiness={true}>
                          <Layout>
                            <InvoiceList />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/bills" element={
                        <ProtectedRoute requireAuth={true} requireBusiness={true}>
                          <Layout>
                            <BillsPage />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/bank-statements" element={
                        <ProtectedRoute requireAuth={true} requireBusiness={true}>
                          <Layout>
                            <BankReconciliation />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/settings" element={
                        <ProtectedRoute requireAuth={true} requireBusiness={false}>
                          <Layout>
                            <Settings />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/profile" element={
                        <ProtectedRoute requireAuth={true} requireBusiness={false}>
                          <Layout>
                            <UserProfile />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      
                      {/* Journal Routes */}
                      <Route path="/journal" element={
                        <ProtectedRoute requireAuth={true} requireBusiness={false}>
                          <Layout>
                            <Navigate to="/transactions" replace />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/journal/new" element={
                        <ProtectedRoute requireAuth={true} requireBusiness={false}>
                          <Layout>
                            <Navigate to="/transactions" replace />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      
                      {/* Catch all route - redirect to dashboard */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
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