/** @type { import('@storybook/react').Preview } */

import { useEffect } from 'react';
import { addons } from '@storybook/preview-api';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
import { MantineProvider, useMantineColorScheme } from '@mantine/core';
import { theme } from '../src/theme';

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

export const decorators = [
  (renderStory) => <ColorSchemeWrapper>{renderStory()}</ColorSchemeWrapper>,
  (renderStory) => (
    <MantineProvider theme={theme}>{renderStory()}</MantineProvider>
  ),
];

const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
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
