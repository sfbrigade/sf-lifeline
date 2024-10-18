import { TextInput, InputBase, Button } from '@mantine/core';
import { IMaskInput } from 'react-imask';
import { useForm, isNotEmpty } from '@mantine/form';

export default function RegisterPhysician() {
  const form = useForm({
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

  const handleSubmit = (values) => {
    console.log(values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <p>Register a new physician</p>
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
