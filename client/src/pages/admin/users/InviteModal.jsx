import React, { useEffect } from 'react';
import { Modal, Select, TextInput, Group, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import PropTypes from 'prop-types';
import classes from './admin.module.css';

/**
 * Invite Modal
 *  @param {object} props - The prop for the component
 *  @param {boolean} props.opened - State of modal being open or not
 *  @param {Function} props.close - Function to close the modal
 */
export function InviteModal({ opened, close }) {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      role: 'Volunteer',
      name: '',
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

  /**
   * Calls API to create an invite
   * @param {object} props - The props that contain form values
   * @param {string} props.role - Role value on the form
   * @param {string} props.name - Name of recipient
   * @param {string} props.email - Email of recipient
   */
  function onSubmit({ role, name, email }) {
    const formattedBody = {
      recipients: `${name} <${email}>`,
      role: role.toLocaleUpperCase().replace(' ', '_'),
    };
    fetch('/api/v1/invites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedBody),
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
          title: `Invite sent to ${name}`,
          autoClose: 5000,
        });
      })
      .catch((error) => {
        console.log(error);
        notifications.show({
          color: 'red',
          title: `Invite failed to send`,
          autoClose: 5000,
        });
      });
  }

  /**
   * Resets form value and closes the modal.
   */
  function onClose() {
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
            <h3>Single Invite</h3>
            <p>Select the role and enter the recepient&apos;s name and email</p>
          </div>
        }
        className={classes.modal}
      >
        <form
          className="form"
          onSubmit={form.onSubmit((values) => onSubmit(values))}
        >
          <Select
            allowDeselect={false}
            label="Member Type"
            data={['Volunteer', 'First Responder', 'Admin']}
            key={form.key('role')}
            {...form.getInputProps('role')}
          />
          <TextInput
            label="Name"
            placeholder="Name"
            key={form.key('name')}
            {...form.getInputProps('name')}
          />
          <TextInput
            label="Email"
            placeholder="Email"
            key={form.key('email')}
            {...form.getInputProps('email')}
          />
          <Group justify="flex-end">
            <Button variant="outline" color="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={
                !form.getValues().name.length || !form.getValues().email.length
              }
              type="submit"
            >
              Send Invite
            </Button>
          </Group>
        </form>
      </Modal>
    </>
  );
}

const inviteModalProps = {
  opened: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

InviteModal.propTypes = inviteModalProps;
