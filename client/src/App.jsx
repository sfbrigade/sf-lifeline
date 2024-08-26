import React, { useContext, useEffect } from 'react';
import {
  Outlet,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Loader } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';

import { Layout } from './stories/Layout/Layout';
import Index from './pages';
import Login from './pages/login/login';
import Register from './pages/register/register';
import Dashboard from './pages/dashboard/dashboard';
import AdminPatientsGenerate from './pages/admin/patients/AdminPatientsGenerate';
import { AdminUsers } from './pages/admin/users/AdminUsers';

import Context from './Context';
import AdminPendingUsers from './pages/admin/pending-users/AdminPendingUsers';
import Verify from './pages/verify/verify';

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
          <Route element={<Layout />}>
            <Route
              path="/admin/patients/generate"
              element={<AdminPatientsGenerate />}
            />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route
              path="/admin/pending-users"
              element={<AdminPendingUsers />}
            />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>
        <Route
          element={<Redirect isLoading={isLoading} isLoggedIn={isLoggedIn} />}
        >
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/:inviteId" element={<Register />} />
          <Route path="verify/:emailVerificationToken" element={<Verify />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
