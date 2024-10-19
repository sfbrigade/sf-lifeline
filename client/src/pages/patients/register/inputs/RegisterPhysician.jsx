import { TextInput, InputBase, Button, Alert } from '@mantine/core';
import { IMaskInput } from 'react-imask';
import { useForm, isNotEmpty } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import LifelineAPI from '../../LifelineAPI.js';
import { StatusCodes } from 'http-status-codes';

export default function RegisterPhysician({
  setPhysician,
  close,
  fetchOptions,
}) {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      phone: '',
      email: '',
    },
    validate: {
      firstName: isNotEmpty('First Name is required'),
      lastName: isNotEmpty('Last Name is required'),
      phone: (value) =>
        value.length === 0 || value.match(/^\(\d{3}\)-\d{3}-\d{4}$/)
          ? null
          : 'Phone number is not in XXX-XXX-XXXX format',
      email: (value) =>
        value.length === 0 ||
        value.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
          ? null
          : 'Email is not in valid format',
    },
  });

  const { isSuccess, data, error, mutateAsync } = useMutation({
    mutationKey: ['physician'],
    mutationFn: async (data) => {
      const res = await LifelineAPI.registerPhysician(data);
      if (res.status === StatusCodes.CREATED) {
        return await res.json();
      } else {
        throw new Error('Failed to register physician.');
      }
    },
  });

  const handleSubmit = async (values) => {
    console.log(values);
    try {
      const result = await mutateAsync(values);
      const { firstName, middleName, lastName } = result;
      const fullName = `${firstName} ${middleName + ' '}${lastName}`;
      setPhysician(result.id, fullName);
      close();
      fetchOptions('');
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <p>Register a new physician</p>
      {error && (
        <Alert title="Error" color="red">
          {error.message}
        </Alert>
      )}
      <TextInput
        label="First Name"
        placeholder="First Name"
        withAsterisk
        key={form.key('firstName')}
        {...form.getInputProps('firstName')}
      />
      <TextInput
        label="Middle Name"
        placeholder="Middle Name"
        key={form.key('middleName')}
        {...form.getInputProps('middleName')}
      />
      <TextInput
        label="Last Name"
        placeholder="Last Name"
        withAsterisk
        key={form.key('lastName')}
        {...form.getInputProps('lastName')}
      />
      <InputBase
        label="Phone Number"
        component={IMaskInput}
        mask="(000)-000-0000"
        placeholder="(000)-000-0000"
        withAsterisk
        key={form.key('phone')}
        {...form.getInputProps('phone')}
      />
      <TextInput
        label="Email"
        placeholder="Email"
        format="email"
        key={form.key('email')}
        {...form.getInputProps('email')}
      />
      <Button onClick={form.onSubmit(handleSubmit)}>Submit</Button>
    </form>
  );
}
