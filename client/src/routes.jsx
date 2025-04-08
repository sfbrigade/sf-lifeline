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

import EditUser from './pages/users/EditUser';
import User from './pages/users/User';
import Users from './pages/users/Users';
import PendingUsers from './pages/users/PendingUsers';

import PatientRegistration from './pages/patients/register/PatientRegistration';
import PatientDetails from './pages/patients/patient-details/PatientDetails';
import Patients from './pages/patients/Patients';
import PatientsGenerate from './pages/patients/PatientsGenerate';
import Physicians from './pages/physicians/Physicians';
import PhysicianDetail from './pages/physicians/physican-details/PhysicianDetail';
import PhysicianForm from './pages/physicians/physican-details/Components/PhysicianForm';
import Hospitals from './pages/hospitals/Hospitals';
import HospitalDetail from './pages/hospitals/hospital-details/HospitalDetail';
import HospitalForm from './pages/hospitals/hospital-details/Components/HospitalForm';

// roles in order of least to most privileged
export const ROLES = ['FIRST_RESPONDER', 'VOLUNTEER', 'STAFF', 'ADMIN'];

// these are routes that require authentication and authorization by role
export const AUTH_ROUTES = [
  ['ADMIN', ['users', 'users/pending']],
  ['STAFF', ['patients/generate', 'patients']],
  ['VOLUNTEER', ['patients/:patientId/edit']],
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
 * @param {Object} user
 * @param {Object} location
 * @param {Function} callback
 */
export function handleRedirects (user, location, callback) {
  const { pathname, search } = location;
  const from = `${pathname}${search}`;
  const LOGIN_PATH = '/login';
  const FORBIDDEN_PATH = '/forbidden';
  let match;
  // check authenticated routes
  for (const [role, routes] of AUTH_ROUTES) {
    for (const route of routes) {
      match = matchPath(route, pathname);
      if (match) {
        if (!user) {
          return callback(LOGIN_PATH, { state: { from } });
        } else if (ROLES.indexOf(user.role) < ROLES.indexOf(role)) {
          return callback(FORBIDDEN_PATH, { state: { from } });
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
                path: ':patientId/edit',
                element: <PatientRegistration />,
              },
              {
                path: ':patientId',
                element: <PatientDetails />,
              },
            ],
          },
          {
            path: 'physicians',
            children: [
              {
                index: true,
                element: <Physicians />,
              },
              {
                path: ':physicianId',
                element: <PhysicianDetail />
              },
              {
                path: ':physicianId/edit',
                element: <PhysicianForm />
              }
            ],
          },
          {
            path: 'hospitals',
            children: [
              {
                index: true,
                element: <Hospitals />,
              },
              {
                path: ':hospitalId',
                element: <HospitalDetail />,
              },
              {
                path: ':hospitalId/edit',
                element: <HospitalForm />,
              },
            ],
          },
          {
            path: 'users',
            children: [
              {
                index: true,
                element: <Users />,
              },
              {
                path: ':userId',
                element: <User />,
              },
              {
                path: ':userId/edit',
                element: <EditUser />,
              },
            ]
          },
          {
            path: 'users/pending',
            element: <PendingUsers />,
          },
        ],
      },
      {
        path: 'patients/generate',
        element: <PatientsGenerate />,
      },
    ],
  },
];
