import { useEffect, ReactElement } from 'react';
import { useNavigate } from 'react-router';
import { Loader } from '@mantine/core';
import PropTypes from 'prop-types';

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
 * @returns {ReactElement}
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

export default ProtectedRoute;
