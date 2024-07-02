import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages';
import Login from './pages/login/login';
import { Layout } from './stories/Layout/Layout';
import Context from './Context';
import { useQuery } from '@tanstack/react-query';

/**
 * Top-level application component.  *
 * @returns {React.ReactElement}
 */
function App() {
  const { setUser } = useContext(Context);
  useQuery({
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

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
        </Route>

        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
