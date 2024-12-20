import PropTypes from 'prop-types';
import { matchPath } from 'react-router';

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

// roles in order of least to most privileged
export const ROLES = ['FIRST_RESPONDER', 'VOLUNTEER', 'STAFF', 'ADMIN'];

// these are routes that require authentication and authorization by role
export const AUTH_ROUTES = [
  ['ADMIN', ['admin/users', 'admin/pending-users']],
  ['STAFF', ['admin/patients/generate', 'patients']],
  ['VOLUNTEER', ['patients/register/:patientId']],
  ['FIRST_RESPONDER', ['dashboard', 'patients/:patientId']],
];

// these are routes that should sign out a user if one is already logged in
export const UNAUTH_ROUTES = [
  'register',
  'register/:inviteId',
  'password/forgot',
  'password/:passwordResetToken',
  'verify/:emailVerificationToken',
];

/**
 * Redirect handler compares specified location to routes configured above
 * and checks the user role as appropriate. It invokes the callback if
 * a redirect is needed, and throws an error if the user is already logged in
 * but visits an unauthenticated route.
 * @param {PropTypes.object} user
 * @param {PropTypes.object} location
 * @param {PropTypes.func} callback
 */
export function handleRedirects(user, location, callback) {
  const { pathname, search } = location;
  const from = `${pathname}${search}`;
  let match;
  // check authenticated routes
  for (const [role, routes] of AUTH_ROUTES) {
    for (const route of routes) {
      match = matchPath(route, pathname);
      if (match) {
        if (!user) {
          return callback('/login', { state: { from } });
        } else if (ROLES.indexOf(user.role) < ROLES.indexOf(role)) {
          return callback('/forbidden', { state: { from } });
        }
        break;
      }
    }
  }
  // check if we need to sign out for any unauthenticated routes
  if (!match && user) {
    for (const route of UNAUTH_ROUTES) {
      match = matchPath(route, pathname);
      if (match) {
        throw new Error('User is already logged in');
      }
    }
  }
}

export default [
  {
    path: '/',
    element: <App handleRedirects={handleRedirects} />,
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