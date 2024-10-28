import { useParams, useNavigate } from 'react-router-dom';
import { Loader, Container, Paper, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { StatusCodes } from 'http-status-codes';
import { humanize } from 'inflection';
import LifelineAPI from '../LifelineAPI.js';

import classes from './PatientDetails.module.css';

/**
 *
 * Patient page component
 */
export default function PatientDetails() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const { data, isSuccess, isError, isLoading } = useQuery({
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
  console.log(data, isSuccess, isError, isLoading);

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

        <section>
          <Text className={classes.sectionTitle}> Contact Information</Text>
          <Paper shadow="xs" p="md" radius="md" withBorder className={classes.contactInfo}>
            <section>
              <Text>Emergency contact</Text>
              <Text>Name</Text>
              <Text>
                {data?.emergencyContact?.firstName}{' '}
                {data?.emergencyContact?.lastName}
              </Text>
              <Text>Phone</Text>
              <Text>{data?.emergencyContact?.phone}</Text>
              <Text>Relationship</Text>
              <Text>
                {data.emergencyContact &&
                  humanize(data?.emergencyContact?.relationship)}
              </Text>
            </section>
            <section>
              <Text>Primary care physician (PCP) contact</Text>
              <Text>Name</Text>
              <Text>
                {data?.physician?.firstName} {data?.physician?.lastName}
              </Text>
              <Text>Phone</Text>
              <Text>{data?.physician?.phone}</Text>
              <Text>Hospital</Text>
              <Text>{data?.physician?.hospitals[0]?.name}</Text>
            </section>
          </Paper>
        </section>

        <section>
          <Text className={classes.sectionTitle}>Medical Information</Text>
          <Paper shadow="xs" p="md" radius="md" withBorder>
            <section>
              <p>Allergies</p>
              <ul>
                {data?.medicalData?.allergies?.map((allergy) => (
                  <li>{allergy}</li>
                ))}
              </ul>
            </section>
            <section>
              <p>Medication</p>
              <ul>
                {data?.medicalData?.medications?.map((medication) => (
                  <li>{medication}</li>
                ))}
              </ul>
            </section>
            <section>
              <p>Medical history</p>
              <ul>
                {data?.medicalData?.conditions?.map((condition) => (
                  <li>{condition}</li>
                ))}
              </ul>
            </section>
          </Paper>
        </section>

        <section>
          <Text className={classes.sectionTitle}>Preferences</Text>
          <Paper shadow="xs" p="md" radius="md" withBorder>
            <section>
              <p>Code status</p>
              <p>{data?.codeStatus}</p>
              <Text>Hospital</Text>
              <Text>{data?.hospital?.name}</Text>
            </section>
          </Paper>
        </section>
      </Container>
    </main>
  );
}
