import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import { humanize } from 'inflection';
import { QRCode } from 'react-qrcode-logo';
import { Center, Container, Grid, Loader, Paper, Text, Title } from '@mantine/core';

import LifelineAPI from '../LifelineAPI.js';
import ContactInfo from './components/ContactInfo.jsx';
import MedicalInfo from './components/MedicalInfo.jsx';
import Preferences from './components/Preferences.jsx';

/**
 *
 * Patient page component
 */
export default function PatientDetails () {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isError, isLoading } = useQuery({
    queryKey: ['patient'],
    queryFn: async () => {
      const res = await LifelineAPI.getPatient(patientId);
      if (res.status === StatusCodes.OK) {
        return await res.json();
      } else {
        throw new Error('Failed to fetch patient.');
      }
    },
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      navigate('/patients/register/' + patientId, {
        replace: true,
        state: { existingPatient: false },
      });
    }
  }, [isError, navigate, patientId]);

  if (isLoading || isError) {
    return <Loader />;
  }

  return (
    <Container component='main'>
      <Title order={2} my='sm'>
        {data?.firstName} {data?.lastName}
      </Title>
      <Grid mb='md'>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper shadow='xs' p='md' radius='md' withBorder>
            <Title order={5}>Date of Birth</Title>
            <Text mb='xs'>{data?.dateOfBirth}</Text>
            <Title order={5}>Gender</Title>
            <Text mb='xs'>{humanize(data?.gender)}</Text>
            <Title order={5}>Preferred language</Title>
            <Text>{humanize(data?.language)}</Text>
          </Paper>
        </Grid.Col>
        <Grid.Col display={{ base: 'none', md: 'block' }} span={4}>
          <Center h='100%'>
            <QRCode value={`${window.location.origin}${location.pathname}`} />
          </Center>
        </Grid.Col>
      </Grid>
      <MedicalInfo
        allergies={data?.allergies}
        medications={data?.medications}
        conditions={data?.conditions}
      />
      <Preferences codeStatus={data?.codeStatus} hospital={data?.hospital} />
      <ContactInfo
        emergencyContact={data?.emergencyContact}
        physician={data?.physician}
      />
    </Container>
  );
}
