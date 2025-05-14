import { useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import { QRCode } from 'react-qrcode-logo';
import { Box, Button, Center, Container, Grid, Group, Loader, Paper, Pill, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { useAppContext } from '../../../AppContext.jsx';
import LifelineAPI from '../LifelineAPI.js';

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
            {env.FEATURE_COLLECT_PHI &&
              <>
                <Title order={5}>Date of Birth</Title>
                <Text mb='xs'>{data?.dateOfBirth}</Text>
                <Title order={5}>Gender</Title>
                <Text mb='xs'>{data?.gender && t(`Gender.${data?.gender}`)}</Text>
              </>}
            <Title order={5}>Code status</Title>
            <Text mb='xs'>{data?.codeStatus ? t(`CodeStatus.${data?.codeStatus}`) : 'Not provided'}</Text>
          </Paper>
        </Grid.Col>
        <Grid.Col display={{ base: 'none', md: 'block' }} span={4}>
          <Center h='100%'>
            <QRCode value={`${window.location.origin}${location.pathname}`} />
          </Center>
        </Grid.Col>
      </Grid>
      <Box component='section' mb='md'>
        <Title order={4} mb='xs'>Medical Information</Title>
        <Paper shadow='xs' p='md' radius='md' withBorder>
          <Box component='section' mb='xs'>
            <Title order={5} mb='xs'>Allergies</Title>
            {data?.allergies.length === 0
              ? (
                <Text>None</Text>
                )
              : (
                  data?.allergies.map((entry) => (
                    <Pill
                      size='md'
                      key={entry.allergy.id}
                      me='xs'
                      mb='xs'
                    >
                      {entry.allergy.name}
                    </Pill>
                  ))
                )}
          </Box>
          <Box component='section' mb='xs'>
            <Title order={5} mb='xs'>Medical History</Title>
            {data?.conditions?.length === 0
              ? (
                <Text>None</Text>
                )
              : (
                  data?.conditions.map((entry) => (
                    <Pill
                      size='md'
                      key={entry.condition.id}
                      me='xs'
                      mb='xs'
                    >
                      {entry.condition.name}
                    </Pill>
                  ))
                )}
          </Box>
          <Box component='section'>
            <Title order={5} mb='xs'>Medications</Title>
            {data?.medications.length === 0
              ? (
                <Text>None</Text>
                )
              : (
                  data?.medications.map((entry) => (
                    <Pill
                      size='md'
                      key={entry.medication.id}
                      me='xs'
                      mb='xs'
                    >
                      {entry.medication.name}
                    </Pill>
                  ))
                )}
          </Box>
        </Paper>
      </Box>
      <Box component='section' mb='md'>
        <Title order={4} mb='xs'>Contact Information</Title>
        <Paper shadow='xs' p='md' radius='md' withBorder>
          <Title order={5}>Language</Title>
          <Text>{data?.language && t(`Language.${data?.language}`)}</Text>
          {env.FEATURE_COLLECT_PHI &&
            <Box component='section' mb='xs'>
              <Title order={5}>
                Emergency Contact
              </Title>
              <Text>
                {(data?.emergencyContact?.firstName || data?.emergencyContact?.lastName)
                  ? `${data?.emergencyContact?.firstName || ''} ${data?.emergencyContact?.middleName || ''} ${data?.emergencyContact?.lastName || ''}`
                  : '-'}
                {data?.emergencyContact?.relationship &&
            ` (${t(`Relationship.${data?.emergencyContact?.relationship}`)})`}
                {data?.emergencyContact?.phone && <><br />{data?.emergencyContact?.phone}</>}
              </Text>
            </Box>}
        </Paper>
      </Box>
      <Box component='section' mb='md'>
        <Title order={4} mb='xs'>Preferences</Title>
        <Paper shadow='xs' p='md' radius='md' withBorder>
          <Box component='section'>
            <Title order={5}>Hospital</Title>
            <Text mb='xs'>{data?.hospital ? data?.hospital.name : 'Not provided'}</Text>
          </Box>
          <Box component='section'>
            <Title order={5}>
              Primary care physician (PCP)
            </Title>
            <Text>
              {data?.physician
                ? `${data?.physician?.firstName} ${data?.physician?.lastName}`
                : '-'}
              {data?.physician?.phone && <><br />{data?.physician?.phone}</>}
              {data?.physician?.hospitals[0]?.name && <><br />{data?.physician?.hospitals[0]?.name}</>}
            </Text>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
