import { Modal } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import PropTypes from 'prop-types';
import { useCreateHospital } from './useCreateHospital';
import Form from '../../components/Form/Form';

/**
 * Hospital Modal
 *  @param {object} props - The prop for the component
 *  @param {boolean} props.opened - State of modal being open or not
 *  @param {Function} props.close - Function to close the modal
 */
export default function HospitalModal ({ opened, close }) {
  const { mutateAsync: createHospital, isPending } = useCreateHospital();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },

    validate: {
      name: (value) =>
        /^[a-zA-Z\s\-']{2,30}$/.test(value)
          ? null
          : "Name must be between 2 and 30 characters long. It can only contain alphabetic characters (A-Z, a-z), spaces, hyphens (-), and apostrophes (').",
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  /**
   * Calls API to create an Hospital
   */
  async function onSubmit (values) {
    const response = await createHospital(values);
    if (response instanceof Error) {
      notifications.show({
        color: 'red',
        title: 'Hospital failed to create',
        message: response.message,
        autoClose: 5000
      });
    } else {
      onClose();
      notifications.show({
        color: 'green',
        title: `Hospital ${response.name} created`,
        autoClose: 5000
      });
    }
  }

  /**
   * Resets form value and closes the modal.
   */
  function onClose () {
    close();
    form.reset();
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <div>
            <h3>Create Hospital</h3>
          </div>
        }
      >
        <Form onSubmit={form.onSubmit(onSubmit)} form={form} />
      </Modal>
    </>
  );
}

const hospitalModalProps = {
  opened: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

HospitalModal.propTypes = hospitalModalProps;
