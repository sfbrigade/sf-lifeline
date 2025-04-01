import { useParams, useNavigate, Link } from 'react-router';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import { Container, Grid, Loader, Text, Title, Group, Button, Paper } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { useAuthorization } from '../../../hooks/useAuthorization.jsx';
import LifelineAPI from '../LifelineAPI.js';

import PhysicanPatients from './Components/PatientComponent/PhysicanPatients.jsx';
import Hospital from './Components/HospitalComponent/Hospital.jsx';

/**
 *
 * Physician page component
 */
export default function PhysicianDetail () {
  const { physicianId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthorization();

  const { data, isError, isLoading } = useQuery({
    queryKey: ['physician', physicianId],
    queryFn: async () => {
      const res = await LifelineAPI.getPhysician(physicianId);
      if (res.status === StatusCodes.OK) {
        return await res.json();
      } else {
        throw new Error('Failed to fetch physician.');
      }
    },
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      navigate(`/physicans/${physicianId}/edit`, {
        replace: true,
        state: { existingPatient: false },
      });
    }
  }, [isError, navigate, physicianId]);

  if (isLoading || isError) {
    return <Loader />;
  }

  const canEdit = user?.role === 'VOLUNTEER' || user?.role === 'STAFF' || user?.role === 'ADMIN';

  return (
    <Container component='main'>
      <Group>
        <Title order={2} my='sm'>
          {data?.firstName} {data?.middleName} {data?.lastName}
        </Title>
        {canEdit && <Button component={Link} to='edit'>Edit</Button>}
      </Group>
      <Grid mb='md'>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper shadow='xs' p='md' radius='md' withBorder>
            {data?.phone &&
              <>
                <Title order={5}>Phone</Title>
                <Text mb='xs'>{data?.phone}</Text>
              </>}
            <Title order={5}>Email</Title>
            <Text>{data?.email && t(`${data?.email}`)}</Text>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Title order={2} my='sm'> Hospitals</Title>
          <Hospital physicansId={physicianId} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Title order={2} my='sm'> Patients</Title>
          <PhysicanPatients physicansId={physicianId} />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
