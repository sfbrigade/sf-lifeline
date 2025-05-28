import { useForm } from '@mantine/form';
import { useNavigate, useParams } from 'react-router';
import { Container, Grid } from '@mantine/core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import Form from '../../../../components/Form/Form';

import LifelineAPI from '../../../../LifelineAPI';

export default function HospitalForm () {
  const navigate = useNavigate();
  const { hospitalId } = useParams();

  const form = useForm({
    mode: 'uncontrolled',
    initalValues: {
      name: '',
      address: '',
      phone: '',
      email: '',
    }
  });

  useQuery({
    queryKey: ['hospital', hospitalId],
    queryFn: async () => {
      const res = await LifelineAPI.getHospital(hospitalId);
      if (res.status === StatusCodes.OK) {
        const values = await res.json();
        form.setValues(values);
        return values;
      } else {
        throw new Error('Failed to fetch hospital.');
      }
    },
    retry: false,
  });

  const { mutateAsync } = useMutation({
    mutationFn: async (values) => {
      const response = await LifelineAPI.updateHospital(values, hospitalId);
      if (response.status !== 200) {
        throw new Error('Failed to update hospital.');
      }
      return response.json();
    },
    onSuccess: () => {
      navigate(`/hospitals/${hospitalId}`);
    },
    onError: (error) => {
      console.error('Error updating hospital:', error);
    }
  });

  return (
    <Container component='main'>
      <h1>Edit Hospital</h1>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Form onSubmit={form.onSubmit(mutateAsync)} form={form} />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
