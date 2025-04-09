import { useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import { QRCode } from 'react-qrcode-logo';
import { Button, Center, Container, Grid, Group, Loader, Paper, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { useAppContext } from '../../../AppContext.jsx';
import LifelineAPI from '../LifelineAPI.js';
import ContactInfo from './components/ContactInfo.jsx';
import MedicalInfo from './components/MedicalInfo.jsx';
import Preferences from './components/Preferences.jsx';

/**
 *
 * Patient page component
 */
export default function PatientDetails () {
  const { env, user } = useAppContext();
  const { t } = useTranslation();
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
      navigate(`/patients/${patientId}/edit`, {
        replace: true,
        state: { existingPatient: false },
      });
    }
  }, [isError, navigate, patientId]);

  if (isLoading || isError) {
    return <Loader />;
  }

  const canEdit = user?.role === 'VOLUNTEER' || user?.role === 'STAFF' || user?.role === 'ADMIN';

  return (
    <Container component='main'>
      <Group>
        <Title order={2} my='sm'>
          {env.FEATURE_COLLECT_PHI ? <>{data?.firstName} {data?.lastName}</> : <>{data?.id}</>}
        </Title>
        {canEdit && <Button component={Link} to='edit'>Edit</Button>}
      </Group>
      <Grid mb='md'>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper shadow='xs' p='md' radius='md' withBorder>
            {env.FEATURE_COLLECT_PHI && <>
              <Title order={5}>Date of Birth</Title>
              <Text mb='xs'>{data?.dateOfBirth}</Text>
              <Title order={5}>Gender</Title>
              <Text mb='xs'>{data?.gender && t(`Gender.${data?.gender}`)}</Text>
            </>}
            <Title order={5}>Preferred language</Title>
            <Text>{data?.language && t(`Language.${data?.language}`)}</Text>
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
