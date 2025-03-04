import { useParams, useNavigate, useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import { Container, Grid, Loader, Text, Title } from '@mantine/core';
import PhysicianForm from './Components/PhysicianForm.jsx';
import classes from './PhysicianDetail.module.css';

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
        throw new Error('Failed to fetch physician.');
      }
    },
    retry: false,
  });

  if (isLoading || isError) {
    return <Loader />;
  }
  if (isEditAble) {
    return <PhysicianForm physician={data} />;
  }

  return (
    <main className={classes.details}>
      <Container style={{ marginBottom: '2rem' }}>
        <Grid my='2rem'>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Title mb='1rem'>
              {data?.firstName} {data?.middleName} {data?.lastName}
            </Title>
            <section>
              <div className='editButton'>
                <button
                  onClick={() => navigate(`/physicians/${physicianId}/edit`)}
                  color='blue'
                  variant='outline'
                >
                  Edit
                </button>

              </div>
            </section>
            <section className={classes.physicianInfoContainer}>
              <Text>Phone:</Text>
              <Text>{data?.phone}</Text>
              <Text>Email:</Text>
              <Text>{data?.email}</Text>
            </section>
          </Grid.Col>
        </Grid>
      </Container>
    </main>
  );
}
