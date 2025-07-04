import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
// import { ThemeProvider } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';

// Styles
import './index.css';

// Local imports
import { store } from './redux/store';
// import { theme } from './theme';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingScreen from './components/common/LoadingScreen';

// Disable service worker to prevent API interference
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

// Initialize app
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render app with providers
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          {/* <ThemeProvider theme={theme}> */}
          <React.Suspense fallback={<LoadingScreen />}>
            <App />
          </React.Suspense>
          {/* </ThemeProvider> */}
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
); 