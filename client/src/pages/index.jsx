import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const indexProps = {
  redirectToLogin: PropTypes.bool,
};

/**
 * Home page component.
 * @param {PropTypes.InferProps<typeof indexProps>} props
 */
function Index({ redirectToLogin }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (redirectToLogin) {
      navigate('/login');
    }
  }, [redirectToLogin, navigate]);

  return <main>Index is working</main>;
}

Index.propTypes = indexProps;

export default Index;
