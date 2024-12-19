import { useEffect, ReactElement } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router';
import { Loader } from '@mantine/core';
import PropTypes from 'prop-types';

const RedirectProps = {
  isLoading: PropTypes.bool.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  isLoggedInRequired: PropTypes.bool,
};

/**
 * Redirects browser based on props
 * @param {PropTypes.InferProps<typeof RedirectProps>} props
 * @returns {ReactElement}
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

export default Redirect;
