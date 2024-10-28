import PropTypes from 'prop-types';

import {
  TextInput,
  InputBase,
  Button,
  Alert,
  Modal,
  Transition,
  Text,
} from '@mantine/core';
import { useForm, isNotEmpty } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';

import { IMaskInput } from 'react-imask';
import { useMutation } from '@tanstack/react-query';
import LifelineAPI from '../../LifelineAPI.js';
import { StatusCodes } from 'http-status-codes';

import classes from './RegisterPhysician.module.css';

const registerPhysicianProps = {
  setPhysician: PropTypes.func.isRequired,
  registerPhysicianOpened: PropTypes.bool.isRequired,
  closeRegisterPhysician: PropTypes.func.isRequired,
  fetchOptions: PropTypes.func.isRequired,
};

/**
 *
 * @param {PropTypes.InferProps<typeof registerPhysicianProps>} props
 */
export default function RegisterPhysician({
  setPhysician,
  registerPhysicianOpened,
  closeRegisterPhysician,
  fetchOptions,
}) {
  const [
    confirmationModalOpened,
    { open: openConfirmationModal, close: closeConfirmationModal },
  ] = useDisclosure(false);

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
        value.length > 0 || value.match(/^\(\d{3}\) \d{3}-\d{4}$/)
          ? null
          : 'Phone number is not in (XXX) XXX-XXXX format',
      email: (value) =>
        value.length === 0 ||
        value.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)
          ? null
          : 'Email is not in valid format',
    },
  });

  const {
    error,
    reset: mutationReset,
    mutateAsync,
  } = useMutation({
    mutationKey: ['physician'],
    mutationFn: async (data) => {
      const res = await LifelineAPI.registerPhysician(data);
      if (res.status === StatusCodes.CREATED) {
        return await res.json();
      } else {
        const { message } = await res.json();
        throw new Error(message);
      }
    },
  });

  const handleSubmit = async (values) => {
    try {
      const result = await mutateAsync(values);
      const { firstName, middleName, lastName, phone } = result;
      const fullName = `${firstName}${middleName ? ' ' + middleName + ' ' : ' '}${lastName}`;
      setPhysician(result.id, `${fullName}${phone ? ` - ${phone}` : ''}`);
      fetchOptions(fullName);
      form.reset();
      mutationReset();
      closeRegisterPhysician();
    } catch (error) {
      console.error(error.message);
    }
  };

  const confirmClose = (confirmed) => {
    if (form.isDirty() && confirmed) {
      closeConfirmationModal();
      form.reset();
      mutationReset();
    }
    if (form.isDirty()) {
      openConfirmationModal();
    } else {
      form.reset();
      closeRegisterPhysician();
    }
  };

  return (
    <>
      <Modal
        opened={registerPhysicianOpened}
        onClose={confirmClose}
        title="Register a new physician"
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
                title="Failed to register physician."
                color="red"
                style={{ ...transitionStyle }}
              >
                {error?.message}
              </Alert>
            )}
          </Transition>
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
            mask="(000) 000-0000"
            placeholder="(000) 000-0000"
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
          <Button
            style={{ marginTop: '1rem' }}
            color="gray"
            fullWidth
            onClick={form.onSubmit(handleSubmit)}
          >
            Register Physician
          </Button>
        </form>
      </Modal>
      <Modal
        opened={confirmationModalOpened}
        onClose={closeConfirmationModal}
        classNames={{
          title: classes.title,
        }}
        title="This form has unsaved changes."
        yOffset="16vh"
      >
        <Text fw={600}>
          Are you sure you want to close this form without submitting?
        </Text>
        <Button
          classNames={{ root: classes.button }}
          color="red"
          fullWidth
          onClick={() => confirmClose(true)}
        >
          Yes
        </Button>
        <Button
          classNames={{ root: classes.button }}
          color="blue"
          fullWidth
          onClick={closeConfirmationModal}
        >
          No
        </Button>
      </Modal>
    </>
  );
}

RegisterPhysician.propTypes = registerPhysicianProps;
