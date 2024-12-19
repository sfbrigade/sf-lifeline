import React, { useContext } from 'react';
import { Routes, Route } from 'react-router';
import { Loader } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';

import ProtectedRoute from './components/ProtectedRoute';
import Redirect from './components/Redirect';

import { Layout } from './stories/Layout/Layout';
import Home from './pages/home';
import Login from './pages/auth/login/login';
import Register from './pages/auth/register/register';
import Dashboard from './pages/dashboard/Dashboard';
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
