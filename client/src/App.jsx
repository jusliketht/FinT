import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './contexts/AuthContext';
import { BusinessProvider } from './contexts/BusinessContext';
import AppRoutes from './routes';
import Layout from './components/layout/Layout';
import { ToastProvider } from './contexts/ToastContext';
import theme from './theme/theme';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ToastProvider>
        <AuthProvider>
          <BusinessProvider>
            <Layout>
              <AppRoutes />
            </Layout>
          </BusinessProvider>
        </AuthProvider>
      </ToastProvider>
    </ChakraProvider>
  );
}

export default App; 