import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import './index.css';
import '@mantine/core/styles.css';
import { theme } from './theme';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import { ContextProvider } from './Context.jsx';

const queryClient = new QueryClient({});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ContextProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <MantineProvider theme={theme}>
            <Notifications position="bottom-right" />
            <App />
          </MantineProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ContextProvider>
  </React.StrictMode>,
);
