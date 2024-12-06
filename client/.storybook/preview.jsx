/** @type { import('@storybook/react').Preview } */

import { useEffect } from 'react';
import { addons } from '@storybook/preview-api';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
import { MantineProvider, useMantineColorScheme } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from '../src/theme';
import { ContextProvider } from '../src/Context';

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

export const decorators = [
  (renderStory) => <ColorSchemeWrapper>{renderStory()}</ColorSchemeWrapper>,
  (renderStory) => (
    <MantineProvider theme={theme}>{renderStory()}</MantineProvider>
  ),
  (renderStory) => <ContextProvider>{renderStory()}</ContextProvider>,
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
