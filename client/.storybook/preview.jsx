/** @type { import('@storybook/react').Preview } */

import { useEffect } from 'react';
import { addons } from '@storybook/preview-api';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
import { MantineProvider, useMantineColorScheme } from '@mantine/core';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppContextProvider } from '../src/Context';
import theme from '../src/theme';

const channel = addons.getChannel();

// SchemaWrapper for dark mode of storybook UI
const ColorSchemeWrapper = ({ children }) => {
  const { setColorScheme } = useMantineColorScheme();
  const handleColorScheme = (value) => setColorScheme(value ? 'dark' : 'light');
  useEffect(() => {
    channel.on(DARK_MODE_EVENT_NAME, handleColorScheme);
    return () => channel.off(DARK_MODE_EVENT_NAME, handleColorScheme);
  }, [channel]);
  return <>{children}</>;
};

const queryClient = new QueryClient({});

const USERS = {
  NONE: null,
  ADMIN: {
    id: 'b3dedbd4-5092-4303-a487-98d3d010b4eb',
    role: 'ADMIN',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin.user@sflifeline.app',
  },
  STAFF: {
    id: 'b3dedbd4-5092-4303-a487-98d3d010b4eb',
    role: 'STAFF',
    firstName: 'Staff',
    lastName: 'User',
    email: 'staff.user@sflifeline.app',
  },
  VOLUNTEER: {
    id: 'b3dedbd4-5092-4303-a487-98d3d010b4eb',
    role: 'VOLUNTEER',
    firstName: 'Volunteer',
    lastName: 'User',
    email: 'volunteer.user@sflifeline.app',
  },
  FIRST_RESPONDER: {
    id: 'b3dedbd4-5092-4303-a487-98d3d010b4eb',
    role: 'FIRST_RESPONDER',
    firstName: 'First',
    lastName: 'Responder',
    email: 'first.responder@sflifeline.app',
  },
};

export const decorators = [
  (renderStory) => <ColorSchemeWrapper>{renderStory()}</ColorSchemeWrapper>,
  (renderStory) => (
    <MantineProvider theme={theme}>{renderStory()}</MantineProvider>
  ),
  (renderStory, context) => (
    <AppContextProvider initialUser={USERS[context.globals.user]}>
      {renderStory()}
    </AppContextProvider>
  ),
  (renderStory) => (
    <MemoryRouter initialEntries={['/']}>{renderStory()}</MemoryRouter>
  ),
  (renderStory) => (
    <QueryClientProvider client={queryClient}>
      {renderStory()}
    </QueryClientProvider>
  ),
];

const preview = {
  globalTypes: {
    user: {
      description: 'Global user type',
      toolbar: {
        title: 'User',
        icon: 'user',
        items: ['NONE', 'ADMIN', 'STAFF', 'VOLUNTEER', 'FIRST_RESPONDER'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    user: 'NONE',
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  tags: ['autodocs'],
};

export default preview;
