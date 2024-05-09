import { Header } from './Header';
import '@mantine/core/styles.css';

export default {
  title: 'Example/Header',
  component: Header,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
};

export const LoggedIn = {
  args: {
    user: {
      name: 'Jane Doe',
    },
    onLogin: function () {},
    onLogout: function () {},
    onCreateAccount: function () {},
  },
};

export const LoggedOut = {
  args: {
    onLogin: function () {},
    onLogout: function () {},
    onCreateAccount: function () {},
  },
};
