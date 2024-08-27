import '@mantine/core/styles.css';
import { PasswordResetForm } from './passwordResetForm';

export default {
  title: 'Password Reset Form',
  component: PasswordResetForm,
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
};

export const Default = {
  args: {
    form: { password: '', confirmPassword: '' },
    errors: {},
    isLoading: false,
    onFormChange: () => {},
    onSubmit: () => {},
    formState: 1,
    onBackToLogin: () => {},
  },
};

export const PasswordFormatError = {
  args: {
    form: { password: 'bad', confirmPassword: 'bad' },
    errors: {
      password:
        'Password must be at least 8 characters long. Password must include uppercase, lowercase, number, and special character',
    },
    isLoading: false,
    onFormChange: () => {},
    onSubmit: () => {},
    formState: 1,
    onBackToLogin: () => {},
  },
};

export const PasswordNotMatchError = {
  args: {
    form: { password: 'Testing123!', confirmPassword: 'testing123!' },
    errors: {
      confirmPassword: 'Passwords do not match',
    },
    isLoading: false,
    onFormChange: () => {},
    onSubmit: () => {},
    formState: 1,
    onBackToLogin: () => {},
  },
};

export const Success = {
  args: {
    form: { password: 'Testing123!', confirmPassword: 'Testing123!' },
    errors: {},
    isLoading: false,
    onFormChange: () => {},
    onSubmit: () => {},
    formState: 2,
    onBackToLogin: () => {},
  },
};
