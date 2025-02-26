import { useForm } from '@mantine/form';
import { useNavigate, useLocation } from 'react-router';
import { Button, Group, TextInput } from '@mantine/core';
import LifelineAPI from '../../LifelineAPI';

export default function PhysicianForm ({ physician }) {
  const navigate = useNavigate();
  const location = useLocation();

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

  async function onSubmit (values) {
    const response = await LifelineAPI.updatePhysician(values, physician.id);
    if (response.status === 200) {
      navigate(location.pathname.replace('/edit', ''));
    }
    console.log(response);
  }

  return (
    <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
      <TextInput
        withAsterisk
        label='First Name'
        placeholder={physician.firstName}
        key={form.key('firstName')}
        {...form.getInputProps('firstName')}
      />
      <TextInput
        label='Middle Name'
        placeholder={physician.middleName}
        key={form.key('middleName')}
        {...form.getInputProps('middleName')}
      />
      <TextInput
        withAsterisk
        label='Last Name'
        placeholder={physician.lastName}
        key={form.key('lastName')}
        {...form.getInputProps('lastName')}
      />
      <TextInput
        withAsterisk
        label='Phone'
        placeholder={physician.phone}
        key={form.key('phone')}
        {...form.getInputProps('phone')}
      />
      <TextInput
        withAsterisk
        label='Email'
        placeholder={physician.email}
        key={form.key('email')}
        {...form.getInputProps('email')}
      />
      <Group justify='flex-end' mt='md'>
        <Button type='submit'>Submit</Button>
      </Group>
    </form>
  );
}
