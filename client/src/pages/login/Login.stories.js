import { LoginForm } from './LoginForm';

import '@mantine/core/styles.css';

export default {
  title: 'Login Form',
  component: LoginForm,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
};

export const DefaultLoginForm = {
  args: {
    email: '',
    password: '',
    onEmailChange: () => {},
    onPasswordChange: () => {},
    emailError: '',
    passwordError: '',
    onLogin: () => {},
  },
};

export const ErrorForm = {
  args: {
    email: '',
    password: '',
    onEmailChange: () => {},
    onPasswordChange: () => {},
    emailError: 'Invalid Input',
    passwordError: 'Invalid Input',
    onLogin: () => {},
  },
};
