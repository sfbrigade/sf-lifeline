import { useParams, useNavigate, Link } from 'react-router';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import { Container, Grid, Loader, Text, Title, Group, Button, Paper } from '@mantine/core';

import { useAuthorization } from '../../../hooks/useAuthorization.jsx';
import LifelineAPI from '../../../LifelineAPI.js';
import PhysiciansTable from './Components/PhysiciansComponent/Physicians.jsx';
import Patients from './Components/PatientsComponent/Patients.jsx';

/**
 *
 * Hospital Detail page component
 */
export default function HospitalDetail () {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthorization();

  const { data, isError, isLoading } = useQuery({
    queryKey: ['hospital', hospitalId],
    queryFn: async () => {
      const res = await LifelineAPI.getHospital(hospitalId);
      if (res.status === StatusCodes.OK) {
        return await res.json();
      } else {
        throw new Error('Failed to fetch hospital.');
      }
    },
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      navigate(`/hospitals/${hospitalId}/edit`, {
        replace: true,
        state: { existingPatient: false },
      });
    }
  }, [isError, navigate, hospitalId]);

  if (isLoading || isError) {
    return <Loader />;
  }

  const canEdit = user?.role === 'VOLUNTEER' || user?.role === 'STAFF' || user?.role === 'ADMIN';

  return (
    <Container component='main'>
      <Group>
        <Title order={2} my='sm'>
          {data?.name}
        </Title>
        {canEdit && <Button component={Link} to='edit'>Edit</Button>}
      </Group>
      <Grid mb='md'>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper shadow='xs' p='md' radius='md' withBorder>
            <Title order={5}>Phone</Title>
            <Text mb='xs'>{data?.phone}</Text>
            <Title order={5}>Email</Title>
            <Text>{data?.email}</Text>
            <Title order={5}>Address</Title>
            <Text>{data?.address}</Text>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Title order={2} my='sm'> Physicians</Title>
          <PhysiciansTable hospitalId={hospitalId} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Title order={2} my='sm'> Patients</Title>
          <Patients hospitalId={hospitalId} />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
