import { useParams, useNavigate } from 'react-router-dom';
import { Loader, Container, Paper, Text, Pill } from '@mantine/core';
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

  console.log(data?.allergies);

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
          <Paper
            shadow="xs"
            p="md"
            radius="md"
            withBorder
            className={classes.contactInfo}
          >
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
              <Text className={classes.medicalInfoText}>Allergies</Text>
              {data?.allergies.length === 0 && <Text>None</Text>}
              {data?.allergies.map((entry) => (
                <Pill size="md" className={classes.medicalInfoPills}>
                  {entry.allergy.name}
                </Pill>
              ))}
            </section>
            <section>
              <Text className={classes.medicalInfoText}>Medications</Text>
              {data?.medications.length === 0 && <Text>None</Text>}
              {data?.medications.map((entry) => (
                <Pill size="md" className={classes.medicalInfoPills}>
                  {entry.medication.name}
                </Pill>
              ))}
            </section>
            <section>
              <Text className={classes.medicalInfoText}>Conditions</Text>
              {data?.conditions?.length === 0 ? (
                <Text>None</Text>
              ) : (
                <ul>
                  {data?.conditions.map((entry) => (
                    <li>{entry.condition.name}</li>
                  ))}
                </ul>
              )}
            </section>
          </Paper>
        </section>

        <section>
          <Text className={classes.sectionTitle}>Preferences</Text>
          <Paper shadow="xs" p="md" radius="md" withBorder>
            <section>
              <Text>Code status</Text>
              <Text>{data?.codeStatus || 'Not provided'}</Text>
              <Text>Hospital</Text>
              <Text>{data?.hospital?.name}</Text>
            </section>
          </Paper>
        </section>
      </Container>
    </main>
  );
}
