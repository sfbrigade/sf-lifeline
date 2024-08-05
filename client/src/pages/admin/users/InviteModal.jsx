import React from 'react';
import { Modal, Select, TextInput, Group, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import PropTypes from 'prop-types';
import classes from './admin.module.css';

const inviteModalProps = {
  opened: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};
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
        close();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={
        <div>
          <h3>Single Invite</h3>
          <p>Select the role and enter the recepient's name and email</p>
        </div>
      }
      className={classes.modal}
    >
      <form
        className="form"
        onSubmit={form.onSubmit((values) => onSubmit(values))}
      >
        <Select
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
          <Button variant="outline" color="gray" onClick={close}>
            Cancel
          </Button>
          <Button type="submit">Send Invite</Button>
        </Group>
      </form>
    </Modal>
  );
}

InviteModal.propTypes = inviteModalProps;
