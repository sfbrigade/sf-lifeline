import App from './App';

import AuthLayout from './stories/AuthLayout/AuthLayout';
import { Layout } from './stories/Layout/Layout';

import NotFound from './pages/notFound/NotFound';

import Home from './pages/home';
import Login from './pages/auth/login/login';
import Register from './pages/auth/register/register';
import PasswordForgot from './pages/auth/password-forgot/passwordForgot';
import PasswordReset from './pages/auth/password-reset/passwordReset';
import Verify from './pages/verify/verify';

import Dashboard from './pages/dashboard/Dashboard';

import AdminPatientsGenerate from './pages/admin/patients/AdminPatientsGenerate';
import { AdminUsers } from './pages/admin/users/AdminUsers';

import AdminPendingUsers from './pages/admin/pending-users/AdminPendingUsers';
import PatientRegistration from './pages/patients/register/PatientRegistration';
import PatientDetails from './pages/patients/patient-details/PatientDetails';
import Patients from './pages/patients/Patients';

export default [
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <Login />,
          },
          {
            path: 'password/forgot',
            element: <PasswordForgot />,
          },
          {
            path: 'password/:passwordResetToken',
            element: <PasswordReset />,
          },
          {
            path: 'verify/:emailVerificationToken',
            element: <Verify />,
          },
          {
            path: 'register',
            element: <Register />,
          },
          {
            path: 'register/:inviteId',
            element: <Register />,
          },
        ],
      },
      {
        element: <Layout />,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'patients',
            children: [
              {
                index: true,
                element: <Patients />,
              },
              {
                path: ':patientId',
                element: <PatientDetails />,
              },
              {
                path: 'register/:patientId',
                element: <PatientRegistration />,
              },
            ],
          },
          {
            path: 'admin/users',
            element: <AdminUsers />,
          },
          {
            path: 'admin/pending-users',
            element: <AdminPendingUsers />,
          },
        ],
      },
      {
        path: 'admin/patients/generate',
        element: <AdminPatientsGenerate />,
      },
    ],
  },
];
