import { Modal, TextInput, Group, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import PropTypes from 'prop-types';

/**
 * Invite Modal
 *  @param {object} props - The prop for the component
 *  @param {boolean} props.opened - State of modal being open or not
 *  @param {Function} props.close - Function to close the modal
 */
export default function HospitalModel ({ opened, close }) {
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
   * @param {object} props - The props that contain form values
   * @param {string} props.role - Role value on the form
   * @param {string} props.name - Name of recipient
   * @param {string} props.email - Email of recipient
   */
  function onSubmit (values) {
    fetch('/api/v1/hospitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    })
      .then((response) => {
        if (!response.ok) {
          return Promise.reject(response);
        }
        return response.json();
      })
      .then(() => {
        onClose();
        notifications.show({
          color: 'green',
          title: `Hospital ${values.name} created`,
          autoClose: 5000,
        });
      })
      .catch((error) => {
        console.log(error);
        notifications.show({
          color: 'red',
          title: 'Hospital failed to create',
          autoClose: 5000,
        });
      });
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

const hospitalModelProps = {
  opened: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

HospitalModel.propTypes = hospitalModelProps;
