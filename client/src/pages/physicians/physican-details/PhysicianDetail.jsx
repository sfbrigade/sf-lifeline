import { useParams, useNavigate, useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import { Container, Grid, Loader, Text, Title } from '@mantine/core';
import PhysicianForm from './Components/PhysicianForm.jsx';

import LifelineAPI from '../LifelineAPI.js';
/**
 *
 * Physician page component
 */
export default function PhysicianDetail () {
  const { physicianId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditAble = location.pathname.endsWith('edit');

  const { data, isError, isLoading } = useQuery({
    queryKey: ['physician', isEditAble],
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

  if (isLoading || isError) {
    return <Loader />;
  }

  return (
    <main>
      <Container>
        {isEditAble
          ? (
            <PhysicianForm physician={data} />
            )
          : (
            <Grid>
              <button onClick={() => {
                navigate(`${location.pathname}/edit`);
              }}
              >Edit Page
              </button>
              <Grid.Col span={12}>
                <Title order={1}>{data.firstName}</Title>
                <Text>{data.email}</Text>
                <Text>{data.phone}</Text>
              </Grid.Col>
            </Grid>
            )}
      </Container>
    </main>
  );
}
