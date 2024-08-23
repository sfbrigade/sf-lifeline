import '@mantine/core/styles.css';
import { PasswordForgotForm } from './PasswordForgotForm';

export default {
  title: 'Password Forgot Form',
  component: PasswordForgotForm,
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
};

export const Default = {
  args: {
    email: '',
    emailError: null,
    isLoading: false,
    onEmailChange: () => {},
    onSubmit: () => {},
    formState: 1,
  },
};

export const Loading = {
  args: {
    email: 'user@test.com',
    emailError: null,
    isLoading: true,
    onEmailChange: () => {},
    onSubmit: () => {},
    formState: 1,
  },
};

export const Error = {
  args: {
    email: 'troll@test.com',
    emailError: 'Email not found in SF Life Line Database',
    isLoading: false,
    onEmailChange: () => {},
    onSubmit: () => {},
    formState: 1,
  },
};

export const Success = {
  args: {
    email: 'user@test.com',
    emailError: null,
    isLoading: false,
    onEmailChange: () => {},
    onSubmit: () => {},
    formState: 2,
  },
};
