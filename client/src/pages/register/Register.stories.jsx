import { RegisterForm } from './RegisterForm';

import '@mantine/core/styles.css';

export default {
  title: 'Register Form',
  component: RegisterForm,
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
};

export const DefaultRegisterForm = {
  args: {
    user: {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      password: '',
      licenseNumber: '',
    },
    errors: {},
    isLoading: false,
    showLicenseHelper: false,
    onFormChange: () => {},
    onSubmit: () => {},
    setShowLicenseHelper: () => {},
    formState: 1,
  },
};

export const LicenseErrorForm = {
  args: {
    user: {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      password: '',
      licenseNumber: 'WRONG',
    },
    errors: { licenseNumber: 'No license match' },
    isLoading: false,
    showLicenseHelper: true,
    onFormChange: () => {},
    onSubmit: () => {},
    setShowLicenseHelper: () => {},
    formState: 1,
  },
};

export const State2Form = {
  args: {
    user: {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      password: '',
      licenseNumber: 'SUCCESS',
    },
    errors: {},
    isLoading: false,
    showLicenseHelper: false,
    onFormChange: () => {},
    onSubmit: () => {},
    setShowLicenseHelper: () => {},
    formState: 2,
  },
};

export const State2ErrorForm = {
  args: {
    user: {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      password: '',
      licenseNumber: 'SUCCESS',
    },
    errors: {
      firstName: 'First name must be between 2 and 30 characters long',
      middleName: 'Middle name must be between 2 and 30 characters long',
      lastName: 'Last name must be between 2 and 30 characters long',
      email: 'Invalid email format',
      password:
        'Password must be at least 8 characters long. Password must include uppercase, lowercase, number, and special character',
      licenseNumber: 'License already registered',
    },
    isLoading: false,
    showLicenseHelper: false,
    onFormChange: () => {},
    onSubmit: () => {},
    setShowLicenseHelper: () => {},
    formState: 2,
  },
};

export const State3Form = {
  args: {
    user: {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      password: '',
      licenseNumber: '',
    },
    errors: {},
    isLoading: false,
    showLicenseHelper: false,
    onFormChange: () => {},
    onSubmit: () => {},
    setShowLicenseHelper: () => {},
    formState: 3,
  },
};