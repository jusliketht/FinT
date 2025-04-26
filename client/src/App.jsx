import React, { Suspense } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { Loading } from './components/Loading';
import theme from './theme';
import AppRoutes from './routes';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ErrorBoundary>
        <Router>
          <Suspense fallback={<Loading />}>
            <AppRoutes />
          </Suspense>
        </Router>
      </ErrorBoundary>
    </ChakraProvider>
  );
}

export default App; 