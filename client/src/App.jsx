import React, { useContext, useEffect } from 'react';
import { Outlet, Routes, Route, useLocation, useNavigate } from 'react-router';
import { Loader } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';

import { Layout } from './stories/Layout/Layout';
import Home from './pages/home';
import Login from './pages/auth/login/login';
import Register from './pages/auth/register/register';
import Dashboard from './pages/dashboard/dashboard';
import AdminPatientsGenerate from './pages/admin/patients/AdminPatientsGenerate';
import NotFound from './pages/notFound/NotFound';
import { AdminUsers } from './pages/admin/users/AdminUsers';

import Context from './Context';
import AdminPendingUsers from './pages/admin/pending-users/AdminPendingUsers';
import PasswordForgot from './pages/auth/password-forgot/passwordForgot';
import PasswordReset from './pages/auth/password-reset/passwordReset';
import AuthLayout from './stories/AuthLayout/AuthLayout';
import Verify from './pages/verify/verify';
import PatientRegistration from './pages/patients/register/PatientRegistration';
import PatientDetails from './pages/patients/patient-details/PatientDetails';
import Patients from './pages/patients/Patients';

const RedirectProps = {
  isLoading: PropTypes.bool.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  isLoggedInRequired: PropTypes.bool,
};

/**
 * Redirects browser based on props
 * @param {PropTypes.InferProps<typeof RedirectProps>} props
 * @returns {React.ReactElement}
 */
function Redirect({ isLoading, isLoggedIn, isLoggedInRequired }) {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoading) {
      if (isLoggedInRequired && !isLoggedIn) {
        let redirectTo = `${location.pathname}`;
        if (location.search) {
          redirectTo = `${redirectTo}?${location.search}`;
        }
        navigate('/login', { state: { redirectTo } });
      } else if (!isLoggedInRequired && isLoggedIn) {
        navigate('/dashboard');
      }
    }
  }, [isLoading, isLoggedIn, isLoggedInRequired, location, navigate]);
  if (isLoading) {
    return <Loader />;
  }
  return <Outlet />;
}

Redirect.propTypes = RedirectProps;

const ProtectedRouteProps = {
  role: PropTypes.string.isRequired,
  restrictedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  destination: PropTypes.string,
  message: PropTypes.string,
  children: PropTypes.element.isRequired,
};

/**
 * Protect route elements that don't allow for FIRST_RESPONDER role
 * @param {PropTypes.InferProps<typeof ProtectedRouteProps>} props
 * @returns {React.ReactElement}
 */
function ProtectedRoute({
  restrictedRoles,
  role,
  destination = 'notFound',
  message,
  children,
}) {
  const navigate = useNavigate();
  useEffect(() => {
    if (restrictedRoles.includes(role)) {
      if (destination === 'forbidden') {
        navigate('/forbidden', {
          replace: true,
        });
      } else {
        navigate('/not-found', {
          replace: true,
          state: { message },
        });
      }
    }
  }, [restrictedRoles, role, navigate, destination, message]);

  return restrictedRoles.includes(role) ? <Loader /> : children;
}

ProtectedRoute.propTypes = ProtectedRouteProps;

/**
 * Top-level application component.  *
 * @returns {React.ReactElement}
 */
function App() {
  const { user, setUser } = useContext(Context);
  const { isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => {
      return fetch('/api/v1/users/me', { credentials: 'include' })
        .then((response) => response.json())
        .then((newUser) => {
          setUser(newUser);
          return newUser;
        });
    },
  });
  const isLoggedIn = !isLoading && !!user?.id;

  return (
    <>
      <Routes>
        <Route
          element={
            <Redirect
              isLoading={isLoading}
              isLoggedIn={isLoggedIn}
              isLoggedInRequired={true}
            />
          }
        >
          <Route
            path="/admin/patients/generate"
            element={<AdminPatientsGenerate />}
          />
          <Route element={<Layout />}>
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:patientId" element={<PatientDetails />} />
            <Route
              path="/patients/register/:patientId"
              element={
                user ? (
                  <ProtectedRoute
                    role={user?.role}
                    restrictedRoles={['FIRST_RESPONDER']}
                    message={'Patient does not exist.'}
                  >
                    <PatientRegistration />
                  </ProtectedRoute>
                ) : (
                  <Loader />
                )
              }
            />

            <Route path="/admin/users" element={<AdminUsers />} />
            <Route
              path="/admin/pending-users"
              element={<AdminPendingUsers />}
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
        <Route
          element={<Redirect isLoading={isLoading} isLoggedIn={isLoggedIn} />}
        >
          <Route path="/" element={<Home />} />
          <Route element={<AuthLayout />}>
            <Route path="/register" element={<Register />} />
            <Route path="/register/:inviteId" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/password/forgot" element={<PasswordForgot />} />
            <Route
              path="/password/:passwordResetToken"
              element={<PasswordReset />}
            />
            <Route path="verify/:emailVerificationToken" element={<Verify />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
