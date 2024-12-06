import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import { humanize } from 'inflection';
import { QRCode } from 'react-qrcode-logo';
import { Container, Grid, Loader, Text, Title } from '@mantine/core';

import LifelineAPI from '../LifelineAPI.js';
import ContactInfo from './components/ContactInfo.jsx';
import MedicalInfo from './components/MedicalInfo.jsx';
import Preferences from './components/Preferences.jsx';

import classes from './PatientDetails.module.css';

/**
 *
 * Patient page component
 */
export default function PatientDetails() {
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
  });

  useEffect(() => {
    if (isError) {
      navigate('/patients/register/' + patientId, {
        replace: true,
        state: { existingPatient: false },
      });
    }
  }, [isError, navigate, patientId]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <main className={classes.details}>
      <Container style={{ marginBottom: '2rem' }}>
        <Grid my="2rem">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Title mb="1rem">
              {data?.firstName} {data?.lastName}
            </Title>
            <section className={classes.patientInfoContainer}>
              <Text>Date of birth</Text>
              <Text>Gender</Text>
              <Text>Preferred language</Text>
              <Text>{data?.dateOfBirth}</Text>
              <Text>{humanize(data?.gender)}</Text>
              <Text>{humanize(data?.language)}</Text>
            </section>
          </Grid.Col>
          <Grid.Col display={{ base: 'none', md: 'block' }} span={4} ta="right">
            <QRCode value={`${window.location.origin}${location.pathname}`} />
          </Grid.Col>
        </Grid>
        <ContactInfo
          emergencyContact={data?.emergencyContact}
          physician={data?.physician}
        />
        <MedicalInfo
          allergies={data?.allergies}
          medications={data?.medications}
          conditions={data?.conditions}
        />
        <Preferences codeStatus={data?.codeStatus} hospital={data?.hospital} />
      </Container>
    </main>
  );
}
