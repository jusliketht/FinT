import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './contexts/AuthContext';
import { BusinessProvider } from './contexts/BusinessContext';
import AppRoutes from './routes';
import Layout from './components/layout/Layout';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <ChakraProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BusinessProvider>
              <Layout>
                <AppRoutes />
              </Layout>
            </BusinessProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ChakraProvider>
  );
}

export default App; 