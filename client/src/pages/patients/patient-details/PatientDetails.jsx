import { useParams, useNavigate } from 'react-router-dom';
import { Loader, Container, Paper, Group } from '@mantine/core';
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
          <p>Date of birth</p>
          <p>Gender</p>
          <p>Preferred language</p>
          <p>{data?.dateOfBirth}</p>
          <p>{humanize(data?.gender)}</p>
          <p>{humanize(data?.language)}</p>
        </section>

        <section>
          <p> Contact Information</p>
          <Paper shadow="xs" p="md" radius="md">
            <section>
              <p>Emergency contact</p>
              <p>
                {data?.emergencyContact?.firstName}{' '}
                {data?.emergencyContact?.lastName}
              </p>
              <p>{data?.emergencyContact?.phone}</p>
              <p>
                Relationship:{' '}
                {data.emergencyContact &&
                  humanize(data?.emergencyContact?.relationship)}
              </p>
            </section>
            <section>
              <p>Primary care physician (PCP) contact</p>
              <p>
                {data?.physician?.firstName} {data?.physician?.lastName}
              </p>
              <p>{data?.physician?.phone}</p>
              <p>{data?.hospital?.name}</p>
            </section>
          </Paper>
        </section>

        <section>
          <p>Medical Information</p>
          <Paper shadow="xs" p="md" radius="md">
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
          <p>Preferences</p>
          <Paper shadow="xs" p="md" radius="md">
            <section>
              <p>Code status</p>
              <p>{data?.codeStatus}</p>
            </section>
          </Paper>
        </section>
      </Container>
    </main>
  );
}
