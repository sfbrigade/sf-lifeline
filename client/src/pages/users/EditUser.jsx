import { Container, Grid, Group, NativeSelect, PasswordInput, Title, TextInput, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, Link } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';

import LifelineAPI from '#app/LifelineAPI';

function EditUser () {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      password: '',
      role: '',
      licenseNumber: '',
      licenseData: null,
    },
  });

  const { userId } = useParams();
  const { t } = useTranslation();

  useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      const res = await LifelineAPI.getUser(userId);
      if (res.status === StatusCodes.OK) {
        const values = await res.json();
        form.setValues(values);
        return values;
      } else {
        throw new Error('Failed to fetch patient.');
      }
    },
    retry: false,
  });

  const { mutateAsync } = useMutation({
    mutationKey: ['users', userId],
    mutationFn: async (data) => {
      const res = await LifelineAPI.updateUser(userId, form.getValues());
      if (res.status === StatusCodes.OK) {
        return res.json();
      } else {
        const { message } = await res.json();
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      navigate(`/users/${userId}`);
    }
  });

  async function onSubmit (event) {
    event.preventDefault();
    try {
      await mutateAsync(form.getValues());
      navigate(`/users/${userId}`);
    } catch (error) {
      console.error('Failed to update user:', error);
      form.setErrors({ general: error.message });
    }
  }

  return (
    <Container component='main'>
      <Group>
        <Title order={2} my='sm'>
          Edit User
        </Title>
      </Group>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <form onSubmit={onSubmit}>
            <TextInput
              withAsterisk
              label='First Name'
              placeholder='John'
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
              withAsterisk
              label='Last Name'
              placeholder='Doe'
              key={form.key('lastName')}
              {...form.getInputProps('lastName')}
              mb='sm'
            />
            <TextInput
              withAsterisk
              label='Email'
              placeholder='your@email.com'
              key={form.key('email')}
              {...form.getInputProps('email')}
              mb='sm'
            />
            <PasswordInput
              description='Leave blank to keep the same password.'
              label='New Password'
              key={form.key('password')}
              {...form.getInputProps('password')}
              mb='sm'
            />
            <NativeSelect
              withAsterisk
              label='Role'
              key={form.key('role')}
              {...form.getInputProps('role')}
              mb='sm'
              data={[
                { label: t('Role.ADMIN'), value: 'ADMIN' },
                { label: t('Role.STAFF'), value: 'STAFF' },
                { label: t('Role.VOLUNTEER'), value: 'VOLUNTEER' },
                { label: t('Role.FIRST_RESPONDER'), value: 'FIRST_RESPONDER' },
              ]}
            />
            <TextInput
              label='License Number'
              key={form.key('licenseNumber')}
              {...form.getInputProps('licenseNumber')}
              mb='sm'
            />
            <Group mt='lg' gap='sm'>
              <Button type='submit' variant='filled'>
                Save
              </Button>
              <Button component={Link} to={`/users/${userId}`} variant='light'>Cancel</Button>
            </Group>
          </form>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default EditUser;
