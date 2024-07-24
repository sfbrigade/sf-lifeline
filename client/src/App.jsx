import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages';
import Login from './pages/login/login';
import { Layout } from './stories/Layout/Layout';
import Context from './Context';
import { useQuery } from '@tanstack/react-query';
import { AdminUsers } from './pages/admin/users/AdminUsers';
import Register from './pages/register/register';

/**
 * Top-level application component.  *
 * @returns {React.ReactElement}
 */
function App() {
  const { setUser } = useContext(Context);
  const { isLoading, data } = useQuery({
    queryKey: ['user'],
    queryFn: () => {
      return fetch('/api/v1/users/me', { credentials: 'include' })
        .then((response) => response.json())
        .then((user) => {
          if (user) {
            setUser(user);
          }
          return user;
        });
    },
  });
  const isLoggedIn = !isLoading && !!data?.id;

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index redirectToLogin={!isLoggedIn} />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>

        <Route path="/login" element={<Login isLoggedIn={isLoggedIn} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;
