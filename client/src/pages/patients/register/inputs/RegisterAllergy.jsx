import { useState } from 'react';
import {
  Modal,
  Text,
  TextInput,
  Group,
  Button,
  Loader,
  Alert,
  Transition,
} from '@mantine/core';
import { useForm, isNotEmpty } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';

import LifelineAPI from '../../LifelineAPI';

export default function RegisterAllergy({
  registerAllergyOpened,
  closeRegisterAllergy,
  setAllergy,
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
    mutationKey: ['allergy'],
    mutationFn: async (name) => {
      const res = await LifelineAPI.registerAllergy(name);
      if (res.status === StatusCodes.CREATED) {
        return await res.json();
      } else {
        const { message } = await res.json();
        throw new Error(message);
      }
    },
  });

  async function handleSubmit(values) {
    try {
      const allergy = await mutateAsync(values.name);
      setAllergy(allergy.id, { children: allergy.name });
      notifications.show({
        title: 'Success',
        message: 'Successfully registered allergy.',
        color: 'green',
      });
      closeRegisterAllergy();
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
      title="Register New Allergy"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Transition
          mounted={error}
          transition="slide-right"
          duration={400}
          timingFunction="ease"
        >
          {(transitionStyle) => (
            <Alert
              title="Failed to register allergy."
              color="red"
              style={{ ...transitionStyle }}
            >
              {error?.message}
            </Alert>
          )}
        </Transition>
        <TextInput
          withAsterisk
          label="Name"
          placeholder="Allergy Name"
          {...form.getInputProps('name')}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={closeRegisterAllergy}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Register
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
