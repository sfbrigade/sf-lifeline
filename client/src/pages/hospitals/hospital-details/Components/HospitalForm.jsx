import { useForm } from '@mantine/form';
import { Button, TextInput } from '@mantine/core';
import { useParams } from 'react-router';
import { IMaskInput } from 'react-imask';
import { useMutation, useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';

import LifelineAPI from '#app/LifelineAPI';

export default function HospitalForm ({ onSuccess, onError }) {
  const { hospitalId } = useParams();

  const form = useForm({
    mode: 'uncontrolled',
    initalValues: {
      name: '',
      address: '',
      phone: '',
      email: '',
    },
    validate: {
      name: (value) =>
        /^[a-zA-Z\s\-']{2,30}$/.test(value)
          ? null
          : "Name must be between 2 and 30 characters long. It can only contain alphabetic characters (A-Z, a-z), spaces, hyphens (-), and apostrophes (').",
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  useQuery({
    queryKey: ['hospital', hospitalId],
    queryFn: async () => {
      if (hospitalId) {
        const res = await LifelineAPI.getHospital(hospitalId);
        if (res.status === StatusCodes.OK) {
          const values = await res.json();
          form.setValues(values);
        } else {
          throw new Error('Failed to fetch hospital.');
        }
      }
      return null;
    },
    retry: false,
  });

  const { mutateAsync } = useMutation({
    mutationFn: async (values) => {
      let response;
      if (hospitalId) {
        response = await LifelineAPI.updateHospital(values, hospitalId);
      } else {
        response = await LifelineAPI.createHospital(values);
      }
      if (!response.ok) {
        throw new Error('Failed to update hospital.');
      }
      return response.json();
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    }
  });

  return (
    <form onSubmit={form.onSubmit(mutateAsync)}>
      <TextInput
        label='Name'
        key={form.key('name')}
        {...form.getInputProps('name')}
        mb='sm'
      />
      <TextInput
        label='Address'
        key={form.key('address')}
        {...form.getInputProps('address')}
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
        type='email'
        key={form.key('email')}
        {...form.getInputProps('email')}
        mb='sm'
      />
      <Button type='submit'>Submit</Button>
    </form>
  );
}
