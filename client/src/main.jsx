import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import App from './App.jsx';
import { theme } from './theme';

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
