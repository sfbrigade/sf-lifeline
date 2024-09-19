import { Container } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * Patient not found page component
 *
 */
export default function PatientNotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.state?.fromRedirect) {
      navigate('/', { replace: true });
    }
  }, [navigate, location]);

  return (
    <Container>
      <h1>Patient Does Not Exist</h1>
      <p> The patient you are looking for does not exist yet.</p>
    </Container>
  );
}