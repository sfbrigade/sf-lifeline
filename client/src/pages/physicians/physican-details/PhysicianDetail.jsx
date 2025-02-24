import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import { Container, Grid, Loader, Text, Title } from '@mantine/core';

import LifelineAPI from '../LifelineAPI.js';
/**
 *
 * Patient page component
 */
export default function PhysicianDetail () {
  const { physicianId } = useParams();

  const { data, isError, isLoading } = useQuery({
    queryKey: ['physician'],
    queryFn: async () => {
      const res = await LifelineAPI.getPhysician(physicianId);
      if (res.status === StatusCodes.OK) {
        return await res.json();
      } else {
        throw new Error('Failed to fetch patient.');
      }
    },
    retry: false,
  });

  console.log(data);

  if (isLoading || isError) {
    return <Loader />;
  }

  return (
    <main>
      <Container>
        <Title order={1}>{data.firstName} {data.middleName} {data.lastName}</Title>
        <Grid>
          <Grid.Col span={6}>
            <Text>{data.phone}</Text>
            <Text>{data.email}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            {data.hospitals.map((hospital) => (
              <Text key={hospital.id}>{hospital.name}</Text>
            ))}
            {data.patients.map((patient) => (
              <Text key={patient.id}>{patient.firstName} {patient.lastName}</Text>
            ))}
          </Grid.Col>
        </Grid>
      </Container>
    </main>
  );
}
