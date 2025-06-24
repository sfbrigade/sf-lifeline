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

export default function RegisterCondition ({
  registerConditionOpened,
  closeRegisterCondition,
  setCondition,
  fetchOptions,
}) {
  const form = useForm({
    initialValues: {
      name: '',
      system: '',
    },

    validate: {
      name: (value) => (value.length > 0 ? null : 'Name is required'),
      system: (value) => (value.length > 0 ? null : 'System is required'),
    },
  });

  const {
    error,
    reset: mutationReset,
    mutateAsync,
    isLoading,
  } = useMutation({
    mutationKey: ['condition'],
    mutationFn: async (data) => {
      const res = await LifelineAPI.registerCondition(data);
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
      const { data: condition, status } = await mutateAsync(values);

      if (status === StatusCodes.OK) {
        notifications.show({
          title: 'Info',
          message: 'Condition already exists and has been added.',
          color: 'blue',
        });
        // Do not call setCondition or closeRegisterCondition if it already exists
      } else if (status === StatusCodes.CREATED) {
        setCondition(condition.id, { children: condition.name });
        notifications.show({
          title: 'Success',
          message: 'Successfully registered condition.',
          color: 'green',
        });
        closeRegisterCondition();
      }

      fetchOptions('');
      form.reset();
      mutationReset();
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error',
        message: 'Issue with registering condition',
        color: 'red',
      });
    }
  }

  return (
    <Modal
      opened={registerConditionOpened}
      onClose={closeRegisterCondition}
      title='Register New Condition'
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
              title='Failed to register condition.'
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
          placeholder='Condition Name'
          {...form.getInputProps('name')}
        />
        <Select
          withAsterisk
          label='System'
          placeholder='Select system'
          data={['SNOMED', 'RXNORM', 'ICD10']}
          {...form.getInputProps('system')}
        />

        <Group justify='flex-end' mt='md'>
          <Button variant='default' onClick={closeRegisterCondition}>
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
