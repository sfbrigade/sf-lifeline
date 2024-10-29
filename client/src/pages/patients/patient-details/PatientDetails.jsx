import { useParams, useNavigate } from 'react-router-dom';
import { Loader, Container, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { StatusCodes } from 'http-status-codes';
import { humanize } from 'inflection';
import LifelineAPI from '../LifelineAPI.js';

import ContactInfo from './components/ContactInfo.jsx';

import classes from './PatientDetails.module.css';
import MedicalInfo from './components/MedicalInfo.jsx';
import Preferences from './components/Preferences.jsx';

/**
 *
 * Patient page component
 */
export default function PatientDetails() {
  const { patientId } = useParams();
  const navigate = useNavigate();

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
        <h1>
          {data?.firstName} {data?.lastName}
        </h1>
        <section className={classes.patientInfoContainer}>
          <Text>Date of birth</Text>
          <Text>Gender</Text>
          <Text>Preferred language</Text>
          <Text>{data?.dateOfBirth}</Text>
          <Text>{humanize(data?.gender)}</Text>
          <Text>{humanize(data?.language)}</Text>
        </section>
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
