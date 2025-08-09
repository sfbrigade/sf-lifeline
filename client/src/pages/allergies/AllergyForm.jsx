import { useForm } from '@mantine/form';
import { Button, TextInput, Select } from '@mantine/core';
import { useParams } from 'react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';

import LifelineAPI from '#app/LifelineAPI';

export default function AllergyForm ({ onSuccess, onError }) {
  const { allergyId } = useParams();

  const form = useForm({
    mode: 'uncontrolled',
    initalValues: {
      name: '',
      type: '',
      code: '',
      system: '',
    },
    validate: {
      name: (value) =>
        /[^\s]{1,30}$/.test(value)
          ? null
          : 'Name must be between 1 and 30 characters long.',
      code: (value, values) => values.system
        ? (/^[\s+]{1,10}$/.test(value)
            ? null
            : 'Code must be between 1 and 10 characters long.')
        : null,
    },
  });

  useQuery({
    queryKey: ['allergy', allergyId],
    queryFn: async () => {
      if (allergyId) {
        const res = await LifelineAPI.getAllergy(allergyId);
        if (res.status === StatusCodes.OK) {
          const values = await res.json();
          form.setValues(values);
        } else {
          throw new Error('Failed to fetch allergy.');
        }
      }
      return null;
    },
    retry: false,
  });

  const { mutateAsync } = useMutation({
    mutationFn: async (values) => {
      let response;
      if (allergyId) {
        response = await LifelineAPI.updateAllergy(allergyId, values);
      } else {
        response = await LifelineAPI.createAllergy(values);
      }
      if (!response.ok) {
        throw new Error('Failed to create/update allergy.');
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
      <Select
        allowDeselect={false}
        label='Allergy Type'
        data={['DRUG', 'OTHER']}
        key={form.key('type')}
        {...form.getInputProps('type')}
      />
      <Select
        allowDeselect={false}
        label='Coding System'
        data={['SNOMED', 'RXNORM', 'ICD10']}
        key={form.key('system')}
        {...form.getInputProps('system')}
      />
      <TextInput
        label='Code'
        key={form.key('code')}
        {...form.getInputProps('code')}
        mb='sm'
      />
      <Button type='submit'>Submit</Button>
    </form>
  );
}
