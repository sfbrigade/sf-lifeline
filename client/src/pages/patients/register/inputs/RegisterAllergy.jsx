import {
  Modal,
  TextInput,
  Group,
  Button,
  Alert,
  Transition,
  Select,
  Stack,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';

import LifelineAPI from '../../LifelineAPI';

export default function RegisterAllergy ({
  registerAllergyOpened,
  closeRegisterAllergy,
  setAllergy,
  fetchOptions,
}) {
  const form = useForm({
    initialValues: {
      name: '',
      type: '',
    },

    validate: {
      name: (value) => (value.length > 0 ? null : 'Name is required'),
      type: (value) => (value.length > 0 ? null : 'Type is required'),
    },
  });

  const {
    error,
    reset: mutationReset,
    mutateAsync,
    isLoading,
  } = useMutation({
    mutationKey: ['allergy'],
    mutationFn: async (data) => {
      const res = await LifelineAPI.registerAllergy(data);
      if (res.status === StatusCodes.CREATED || res.status === StatusCodes.OK) {
        return { data: await res.json(), status: res.status };
      } else {
        const { message } = await res.json();
        throw new Error(message);
      }
    },
  });

  async function handleSubmit (values) {
    try {
      const { data: allergy, status } = await mutateAsync(values);

      if (status === StatusCodes.OK) {
        notifications.show({
          title: 'Info',
          message: 'Allergy already exists and has been added.',
          color: 'blue',
        });
        // Do not call setAllergy or closeRegisterAllergy if it already exists
      } else if (status === StatusCodes.CREATED) {
        setAllergy(allergy.id, { children: allergy.name });
        notifications.show({
          title: 'Success',
          message: 'Successfully registered allergy.',
          color: 'green',
        });
        closeRegisterAllergy();
      }

      fetchOptions('');
      form.reset();
      mutationReset();
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error',
        message: 'Issue with registering allergy',
        color: 'red',
      });
    }
  }

  return (
    <Modal
      opened={registerAllergyOpened}
      onClose={closeRegisterAllergy}
      title='Register New Allergy'
    >
      <Stack component='form' onSubmit={form.onSubmit(handleSubmit)}>
        <Transition
          mounted={error}
          transition='slide-right'
          duration={400}
          timingFunction='ease'
        >
          {(transitionStyle) => (
            <Alert
              title='Failed to register allergy.'
              color='red'
              style={{ ...transitionStyle }}
            >
              {error?.message}
            </Alert>
          )}
        </Transition>
        <TextInput
          withAsterisk
          label='Name'
          placeholder='Allergy Name'
          {...form.getInputProps('name')}
        />
        <Select
          withAsterisk
          label='Type'
          placeholder='Select type'
          data={['DRUG', 'OTHER']}
          {...form.getInputProps('type')}
        />

        <Group justify='flex-end' mt='md'>
          <Button variant='default' onClick={closeRegisterAllergy}>
            Cancel
          </Button>
          <Button type='submit' loading={isLoading}>
            Register
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
