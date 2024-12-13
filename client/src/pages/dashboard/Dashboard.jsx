import { Link } from 'react-router';
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
function Dashboard() {
  return (
    <Container fluid mt="xl">
      <Title mb="xl">Dashboard</Title>
      <Grid>
        <Grid.Col span={{ sm: 6, lg: 4 }}>
          <Paper shadow="xs" p="md">
            <Group gap="md" align="top">
              <BsQrCode size="5rem" />
              <Box>
                <Title mb="sm" order={3}>
                  QR Codes
                </Title>
                <Button
                  component={Link}
                  to="/admin/patients/generate"
                  target="_blank"
                >
                  Print QR Codes
                </Button>
              </Box>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
export default Dashboard;
