import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider, PortalManager } from '@chakra-ui/react';
import App from './App';
import store from './redux/store';
import theme from './theme';
import { checkAuth } from './redux/slices/authSlice';
import './styles/index.css';

// Check authentication status on app load
store.dispatch(checkAuth());

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ChakraProvider theme={theme}>
          <PortalManager>
            <App />
          </PortalManager>
        </ChakraProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
); 