import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useBusiness } from './contexts/BusinessContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotFound from './components/common/NotFound';
import BusinessSelector from './components/business/BusinessSelector';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import InitializeUser from './pages/InitializeUser';
import api from './services/api';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Journal = lazy(() => import('./pages/journal/JournalEntries'));
const NewJournalEntry = lazy(() => import('./pages/journal/NewJournalEntry'));
const ViewJournalEntry = lazy(() => import('./pages/journal/view'));
const Reports = lazy(() => import('./pages/Reports/index.jsx'));
const Accounts = lazy(() => import('./pages/accounts'));
const BankStatements = lazy(() => import('./pages/bankStatements/BankReconciliation'));
const BusinessManagement = lazy(() => import('./pages/business/BusinessManagement'));
const BusinessDetails = lazy(() => import('./pages/business/BusinessDetails'));
const Ledgers = lazy(() => import('./pages/ledgers'));
const Settings = lazy(() => import('./pages/Settings'));
const Transactions = lazy(() => import('./pages/TransactionsPage'));
const InventoryDashboard = lazy(() => import('./components/inventory/InventoryDashboard'));
const AnalyticsDashboard = lazy(() => import('./components/analytics/AnalyticsDashboard'));
const IntegrationManager = lazy(() => import('./components/integrations/IntegrationManager'));

// Phase 2 Components
const EnhancedBankReconciliation = lazy(() => import('./components/bankStatements/EnhancedBankReconciliation'));
const PeriodClosing = lazy(() => import('./components/accounting/PeriodClosing'));
const TaxConfiguration = lazy(() => import('./components/accounting/TaxConfiguration'));
const UserProfile = lazy(() => import('./pages/UserProfile'));

// Financial Reports
const TrialBalance = lazy(() => import('./components/reports/TrialBalance'));
const ProfitAndLoss = lazy(() => import('./components/reports/ProfitAndLoss'));
const BalanceSheet = lazy(() => import('./components/reports/BalanceSheet'));
const CashFlow = lazy(() => import('./components/reports/CashFlow'));

// Invoice and Bill Management
const CustomerList = lazy(() => import('./components/customers/CustomerList'));
const InvoiceList = lazy(() => import('./components/invoices/InvoiceList'));
const InvoicesPage = lazy(() => import('./pages/invoices'));
const BillsPage = lazy(() => import('./pages/bills'));

// Protected route component
const ProtectedRoute = ({ children, requireBusiness = true }) => {
  const { user } = useAuth();
  const { selectedBusiness } = useBusiness();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireBusiness && !selectedBusiness) {
    return <BusinessSelector />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const [checking, setChecking] = useState(true);
  const [needsInit, setNeedsInit] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get('/users/check');
        setNeedsInit(response.data.needsInit);
      } catch (err) {
        console.error("Error checking user existence:", err);
        setNeedsInit(false); // fallback
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) return <div>Loading...</div>;
  if (needsInit) return <InitializeUser onInitialized={() => setNeedsInit(false)} />;

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Business management routes */}
          <Route
            path="/businesses"
            element={
              <ProtectedRoute requireBusiness={false}>
                <BusinessManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/businesses/:id"
            element={
              <ProtectedRoute requireBusiness={false}>
                <BusinessDetails />
              </ProtectedRoute>
            }
          />

          {/* Business-specific routes */}
          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <Journal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journal/new"
            element={
              <ProtectedRoute>
                <NewJournalEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journal/:id"
            element={
              <ProtectedRoute>
                <ViewJournalEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/trial-balance"
            element={
              <ProtectedRoute>
                <TrialBalance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/profit-and-loss"
            element={
              <ProtectedRoute>
                <ProfitAndLoss />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/balance-sheet"
            element={
              <ProtectedRoute>
                <BalanceSheet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/cash-flow"
            element={
              <ProtectedRoute>
                <CashFlow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomerList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <InvoicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bills"
            element={
              <ProtectedRoute>
                <BillsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                <Accounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bank-statements"
            element={
              <ProtectedRoute>
                <BankStatements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bank-reconciliation"
            element={
              <ProtectedRoute>
                <EnhancedBankReconciliation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/period-closing"
            element={
              <ProtectedRoute>
                <PeriodClosing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tax-management"
            element={
              <ProtectedRoute>
                <TaxConfiguration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ledgers"
            element={
              <ProtectedRoute>
                <Ledgers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/integrations"
            element={
              <ProtectedRoute>
                <IntegrationManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute requireBusiness={false}>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes; 