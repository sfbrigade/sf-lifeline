import { Modal, TextInput, Group, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import PropTypes from 'prop-types';
import { useCreateHospital } from './useCreateHospital';

/**
 * Hospital Modal
 *  @param {object} props - The prop for the component
 *  @param {boolean} props.opened - State of modal being open or not
 *  @param {Function} props.close - Function to close the modal
 */
export default function HospitalModal ({ opened, close }) {

  const { mutateAsync: createHospital } = useCreateHospital();

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

    if(response.name){
      onClose();
      notifications.show({
        color: 'green',
        title: `Hospital ${response.name} created`,
        autoClose: 5000
      });
    }
    else {
      notifications.show({
        color: 'red',
        title: 'hospital failed to create',
        autoClose: 5000
      })
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
        <form
          className='form'
          onSubmit={form.onSubmit((values) => onSubmit(values))}
        >
          <TextInput
            label='Name'
            placeholder='Name'
            key={form.key('name')}
            {...form.getInputProps('name')}
          />
          <TextInput
            label='Email'
            placeholder='Email'
            key={form.key('email')}
            {...form.getInputProps('email')}
          />
          <TextInput
            label='Address'
            placeholder='Address'
            key={form.key('address')}
            {...form.getInputProps('address')}
          />
          <TextInput
            label='Phone'
            placeholder='Phone'
            key={form.key('phone')}
            {...form.getInputProps('phone')}
          />
          <Group justify='flex-end'>
            <Button variant='outline' color='gray' onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={
                !form.getValues().name.length || !form.getValues().email.length || !form.getValues().address.length || !form.getValues().email.length || !form.getValues().phone.length
              }
              type='submit'
            >
              Create Hospital
            </Button>
          </Group>
        </form>
      </Modal>
    </>
  );
}

const hospitalModalProps = {
  opened: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

HospitalModal.propTypes = hospitalModalProps;
