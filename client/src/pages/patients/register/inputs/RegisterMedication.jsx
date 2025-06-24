import {
  Modal,
  TextInput,
  Group,
  Button,
  Alert,
  Transition,
  Stack,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';

import LifelineAPI from '../../LifelineAPI';

export default function RegisterMedication ({
  registerMedicationOpened,
  closeRegisterMedication,
  setMedication,
  fetchOptions,
}) {
  const form = useForm({
    initialValues: {
      name: '',
    },

    validate: {
      name: (value) => (value.length > 0 ? null : 'Name is required'),
    },
  });

  const {
    error,
    reset: mutationReset,
    mutateAsync,
    isLoading,
  } = useMutation({
    mutationKey: ['medication'],
    mutationFn: async (data) => {
      const res = await LifelineAPI.registerMedication(data);
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
      const { data: medication, status } = await mutateAsync(values);

      if (status === StatusCodes.OK) {
        notifications.show({
          title: 'Info',
          message: 'Medication already exists and has been added.',
          color: 'blue',
        });
        // Do not call setMedication or closeRegisterMedication if it already exists
      } else if (status === StatusCodes.CREATED) {
        setMedication(medication.id, { children: medication.name });
        notifications.show({
          title: 'Success',
          message: 'Successfully registered medication.',
          color: 'green',
        });
        closeRegisterMedication();
      }

      fetchOptions('');
      form.reset();
      mutationReset();
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error',
        message: 'Issue with registering medication',
        color: 'red',
      });
    }
  }

  return (
    <Modal
      opened={registerMedicationOpened}
      onClose={closeRegisterMedication}
      title='Register New Medication'
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
              title='Failed to register medication.'
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
          placeholder='Medication Name'
          {...form.getInputProps('name')}
        />

        <Group justify='flex-end' mt='md'>
          <Button variant='default' onClick={closeRegisterMedication}>
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
