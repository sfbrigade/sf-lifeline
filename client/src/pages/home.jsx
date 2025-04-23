import { Link, useNavigate } from 'react-router';
import {
  Box,
  Button,
  Container,
  Image,
  Paper,
  Text,
  Title,
} from '@mantine/core';
import { useEffect } from 'react';

import { useAppContext } from '../AppContext';

/**
 * Home page component.
 */
function Home () {
  const { user } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <>
      <header>
        <Image
          src='/assets/logo.svg'
          w={{ base: 60, sm: 100 }}
          h={{ base: 60, sm: 100 }}
          m='2rem'
        />
      </header>
      <main>
        <Container>
          <Title order={1} ta='center'>
            SF Life Line
          </Title>
          <Box maw={300} m='1.25rem auto 4rem'>
            Provide more efficient and equitable care with timely access to
            patient information.
          </Box>
        </Container>
        <Container size='sm'>
          <Paper bg='blue.1' p={{ base: '2.5rem 1.5rem', sm: '2.5rem 4rem' }}>
            <Title order={3} mb='1rem'>
              For First Responders
            </Title>
            <Title order={4}>Benefits of Signing Up</Title>
            <Text mb='2rem'>
              You will obtain timely access to patient healthcare information.
              This can be helpful in situations where there are barriers to
              care, including language barriers or mental incapacity.
            </Text>
            <Button component={Link} to='/register'>
              Sign Up
            </Button>
            &nbsp;
            <Button component={Link} to='/login' variant='default'>
              Log In
            </Button>
          </Paper>
        </Container>
      </main>
    </>
  );
}

export default Home;
