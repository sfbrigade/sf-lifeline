import { useContext, useEffect, ReactElement } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';

import { Notifications } from '@mantine/notifications';

import Context from './Context';
import { useAuthorization } from './hooks/useAuthorization';

/**
 * Top-level application component.  *
 * @param  {PropTypes.func} handleRedirects
 * @returns {ReactElement}
 */
function App({ handleRedirects }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, setUser } = useContext(Context);
  const { handleLogout } = useAuthorization();

  useQuery({
    queryKey: ['user'],
    queryFn: () => {
      return fetch('/api/v1/users/me', { credentials: 'include' })
        .then((response) => (response.ok ? response.json() : null))
        .then((newUser) => {
          setUser(newUser);
          return newUser;
        });
    },
  });

  useEffect(() => {
    try {
      handleRedirects(user, location, (to, options) =>
        navigate(to, { ...options, replace: true }),
      );
    } catch {
      handleLogout();
    }
  }, [handleRedirects, handleLogout, user, location, navigate]);

  return (
    <>
      <Outlet />
      <Notifications position="bottom-right" />
    </>
  );
}

App.propTypes = {
  handleRedirects: PropTypes.func.isRequired,
};

export default App;
