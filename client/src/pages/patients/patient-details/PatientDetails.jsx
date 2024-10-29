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
          <Paper shadow="xs" p="md" radius="md" withBorder>
            <div className={classes.titleRow}>
              <Text className={classes.contactInfoColumnTitle}>
                Emergency Contact
              </Text>
              <Text className={classes.contactInfoColumnTitle}>
                Primary care physician (PCP) contact
              </Text>
            </div>
            <div className={classes.twoColumnGrid}>
              <section>
                <div className={classes.contactRow}>
                  <Text className={classes.boldText}>Name</Text>
                  <Text>
                    {data?.emergencyContact?.firstName}{' '}
                    {data?.emergencyContact?.lastName}
                  </Text>
                </div>
                <div className={classes.contactRow}>
                  <Text className={classes.boldText}>Phone</Text>
                  <Text>{data?.emergencyContact?.phone}</Text>
                </div>
                <div className={classes.contactRow}>
                  <Text className={classes.boldText}>Relationship</Text>
                  <Text>
                    {data.emergencyContact &&
                      humanize(data?.emergencyContact?.relationship)}
                  </Text>
                </div>
              </section>

              <section>
                <div className={classes.contactRow}>
                  <Text className={classes.boldText}>Name</Text>
                  <Text>
                    {data?.physician?.firstName} {data?.physician?.lastName}
                  </Text>
                </div>
                <div className={classes.contactRow}>
                  <Text className={classes.boldText}>Phone</Text>
                  <Text>{data?.physician?.phone}</Text>
                </div>
                <div className={classes.contactRow}>
                  <Text className={classes.boldText}>Hospital</Text>
                  <Text>{data?.physician?.hospitals[0]?.name}</Text>
                </div>
              </section>
            </div>
          </Paper>
        </section>

        <section>
          <Text className={classes.sectionTitle}>Medical Information</Text>
          <Paper shadow="xs" p="md" radius="md" withBorder>
            <section>
              <Text className={classes.boldText}>Allergies</Text>
              {data?.allergies.length === 0 && <Text>None</Text>}
              {data?.allergies.map((entry) => (
                <Pill
                  size="md"
                  key={entry.id}
                  className={classes.medicalInfoPills}
                >
                  {entry.allergy.name}
                </Pill>
              ))}
            </section>
            <section>
              <Text className={classes.boldText}>Medications</Text>
              {data?.medications.length === 0 && <Text>None</Text>}
              {data?.medications.map((entry) => (
                <Pill
                  size="md"
                  key={entry.id}
                  className={classes.medicalInfoPills}
                >
                  {entry.medication.name}
                </Pill>
              ))}
            </section>
            <section>
              <Text className={classes.boldText}>Conditions</Text>
              {data?.conditions?.length === 0 ? (
                <Text>None</Text>
              ) : (
                <ul>
                  {data?.conditions.map((entry) => (
                    <li key={entry.id}>{entry.condition.name}</li>
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
              <Text className={classes.boldText}>Code status</Text>
              <Text>{data?.codeStatus || 'Not provided'}</Text>
              <Text className={classes.boldText}>Hospital</Text>
              <Text>{data?.hospital?.name}</Text>
            </section>
          </Paper>
        </section>
      </Container>
    </main>
  );
}
