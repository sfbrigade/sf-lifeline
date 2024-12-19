import React, { useContext } from 'react';
import { Outlet } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { Notifications } from '@mantine/notifications';

import Context from './Context';

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
        .then((newUser) => {
          setUser(newUser);
          return newUser;
        });
    },
  });

  return (
    <>
      <Outlet />
      <Notifications position="bottom-right" />
    </>
  );
}

export default App;
