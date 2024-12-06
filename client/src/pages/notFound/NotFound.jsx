import { Container } from '@mantine/core';
import { useLocation } from 'react-router';
import { Link } from 'react-router';

/**
 * Patient not found page component
 *
 */
export default function PatientNotFound() {
  const location = useLocation();

  const message = location.state?.message ?? 'Page does not exist.';

  return (
    <Container>
      <h1>Page Does Not Exist</h1>
      <p> {message}</p>
      <Link to="/dashboard">Go to Dashboard</Link>
    </Container>
  );
}
