import { Link } from 'react-router';
<<<<<<< Updated upstream
=======
import { useAppContext } from '#app/AppContext';
import { useState } from 'react';
import LifelineAPI from '#app/LifelineAPI';
import PasskeyRegister from '#components/PassKey/PasskeyRegister';
>>>>>>> Stashed changes
import {
  Box,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  Title,
} from '@mantine/core';
import { BsQrCode } from 'react-icons/bs';

/**
 * Authenticated Dashboard.
 */
function Dashboard () {
  return (
    <Container fluid mt='xl'>
      <Title mb='xl'>Dashboard</Title>
      <Grid>
        <Grid.Col span={{ sm: 6, lg: 4 }}>
          <Paper shadow='xs' p='md'>
            <Group gap='md' align='top'>
              <BsQrCode size='5rem' />
              <Box>
                <Title mb='sm' order={3}>
                  QR Codes
                </Title>
                <Button
                  component={Link}
                  to='/patients/generate'
                  target='_blank'
                >
                  Print QR Codes
                </Button>
              </Box>
            </Group>
          </Paper>
        </Grid.Col>
<<<<<<< Updated upstream
=======
        <Grid.Col span={{ sm: 6, lg: 4 }}>
          <Paper shadow='xs' p='md'>
            <Group gap='md' align='top'>
              <BsBell size='5rem' />
              <Box>
                <Title mb='sm' order={3}>
                  Notifications
                </Title>
                <Text mb='xs'>
                  Receive email notifications when a patient is updated.
                </Text>
                <Switch checked={notificationsEnabled} onChange={handleNotificationsChange} />
              </Box>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ sm: 6, lg: 4 }}>
          <Paper shadow='xs' p='md'>
            <Group gap='md' align='top'>
              <BsBell size='5rem' />
              <Box>
                <Title mb='sm' order={3}>
                  Passkey
                </Title>
                <Text mb='xs'>
                  Enable passkey login.
                </Text>
                <PasskeyRegister />
              </Box>
            </Group>
          </Paper>
        </Grid.Col>
>>>>>>> Stashed changes
      </Grid>
    </Container>
  );
}
export default Dashboard;
