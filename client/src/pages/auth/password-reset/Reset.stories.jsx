import '@mantine/core/styles.css';
import { ResetForm } from './ResetForm';

export default {
  title: 'Reset Form',
  component: ResetForm,
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
};

export const DefaultResetForm = {
  args: {
    email: '',
    emailError: null,
    isLoading: false,
    onFormChange: () => {},
    onSubmit: () => {},
    formState: 1,
  },
};

export const LoadingResetForm = {
  args: {
    email: 'user@test.com',
    emailError: null,
    isLoading: true,
    onFormChange: () => {},
    onSubmit: () => {},
    formState: 1,
  },
};

export const ErrorResetForm = {
  args: {
    email: 'troll@test.com',
    emailError: 'Email not found in SF Life Line Database',
    isLoading: false,
    onFormChange: () => {},
    onSubmit: () => {},
    formState: 1,
  },
};

export const SuccessResetForm = {
  args: {
    email: 'user@test.com',
    emailError: null,
    isLoading: false,
    onFormChange: () => {},
    onSubmit: () => {},
    formState: 2,
  },
};
