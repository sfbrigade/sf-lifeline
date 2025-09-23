import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  Title,
  Switch,
  Text,
  Alert,
} from '@mantine/core';
import { BsQrCode, BsBell, BsBellSlash } from 'react-icons/bs';
import LifelineAPI from '../../LifelineAPI';

/**
 * Authenticated Dashboard.
 */
function Dashboard () {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNotificationPreferences();
  }, []);

  const loadNotificationPreferences = async () => {
    try {
      setLoading(true);
      const response = await LifelineAPI.getNotificationPreferences();
      if (response.ok) {
        const data = await response.json();
        setNotificationsEnabled(data.patientNotification);
      } else {
        setError('Failed to load notification preferences');
      }
    } catch (err) {
      setError('Error loading notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async (enabled) => {
    try {
      setLoading(true);
      const response = await LifelineAPI.updateNotificationPreferences({
        patientNotification: enabled,
      });

      if (response.ok) {
        setNotificationsEnabled(enabled);
        setError(null);
      } else {
        setError('Failed to update notification preferences');
      }
    } catch (err) {
      setError('Error updating notification preferences');
    } finally {
      setLoading(false);
    }
  };

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

        <Grid.Col span={{ sm: 6, lg: 4 }}>
          <Paper shadow='xs' p='md'>
            <Group gap='md' align='top'>
              {notificationsEnabled
                ? (
                  <BsBell size='5rem' color='#228be6' />
                  )
                : (
                  <BsBellSlash size='5rem' color='#868e96' />
                  )}
              <Box>
                <Title mb='sm' order={3}>
                  Notifications
                </Title>
                <Text size='sm' c='dimmed' mb='md'>
                  Daily email notifications will be sent to your email address.
                </Text>
                <Switch
                  checked={notificationsEnabled}
                  onChange={(event) => toggleNotifications(event.currentTarget.checked)}
                  disabled={loading}
                  label={notificationsEnabled ? 'Enabled' : 'Disabled'}
                  size='md'
                />
                {error && (
                  <Alert color='red' mt='sm' size='sm'>
                    {error}
                  </Alert>
                )}
              </Box>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
export default Dashboard;
