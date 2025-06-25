import { useForm } from '@mantine/form';
import { useNavigate, useParams } from 'react-router';
import { Container, Button, Grid, Group, TextInput } from '@mantine/core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import { IMaskInput } from 'react-imask';

import LifelineAPI from '#app/LifelineAPI';

export default function PhysicianForm () {
  const navigate = useNavigate();
  const { physicianId } = useParams();

  const form = useForm({
    mode: 'uncontrolled',
    initalValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      phone: '',
      email: '',
    }
  });

  useQuery({
    queryKey: ['physician', physicianId],
    queryFn: async () => {
      const res = await LifelineAPI.getPhysician(physicianId);
      if (res.status === StatusCodes.OK) {
        const values = await res.json();
        form.setValues(values);
        return values;
      } else {
        throw new Error('Failed to fetch physician.');
      }
    },
    retry: false,
  });

  const { mutateAsync } = useMutation({
    mutationFn: async (values) => {
      const response = await LifelineAPI.updatePhysician(values, physicianId);
      if (response.status !== 200) {
        throw new Error('Failed to update physician.');
      }
      return response.json();
    },
    onSuccess: () => {
      navigate(`/physicians/${physicianId}`);
    },
    onError: (error) => {
      console.error('Error updating physician:', error);
    }
  });

  return (
    <Container component='main'>
      <h1>Edit Physician</h1>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <form onSubmit={form.onSubmit(mutateAsync)}>
            <TextInput
              label='First Name'
              key={form.key('firstName')}
              {...form.getInputProps('firstName')}
              mb='sm'
            />
            <TextInput
              label='Middle Name'
              key={form.key('middleName')}
              {...form.getInputProps('middleName')}
              mb='sm'
            />
            <TextInput
              label='Last Name'
              key={form.key('lastName')}
              {...form.getInputProps('lastName')}
              mb='sm'
            />
            <TextInput
              label='Phone'
              component={IMaskInput}
              mask='(000) 000-0000'
              placeholder='(000) 000-0000'
              key={form.key('phone')}
              {...form.getInputProps('phone')}
              mb='sm'
            />
            <TextInput
              label='Email'
              key={form.key('email')}
              {...form.getInputProps('email')}
              mb='sm'
            />
            <Group mt='md'>
              <Button type='submit'>Submit</Button>
            </Group>
          </form>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
