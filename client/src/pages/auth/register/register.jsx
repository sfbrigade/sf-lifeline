import React, { useEffect, useState } from 'react';
import classes from '../form.module.css';
import { RegisterForm } from './RegisterForm';
import { Flex } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

/**
 * Register page component
 */
function Register() {
  const { inviteId } = useParams();
  const [user, setUser] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    licenseNumber: '',
  });
  const [errors, setErrors] = useState({});
  const [showLicenseHelper, setShowLicenseHelper] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (!inviteId) return;
    fetch(`/api/v1/invites/${inviteId}`)
      .then((response) => {
        if (!response.ok) {
          return Promise.reject(response);
        }
        return response.json();
      })
      .then((data) => {
        if (data.acceptedById.length != 0) {
          throw Error();
        }

        setUser((prevUser) => ({
          ...prevUser,
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
          inviteId: inviteId,
        }));

        if (data.role != 'FIRST_RESPONDER') {
          setFormState(2);
        }
      })
      .catch(() => {
        notifications.show({
          color: 'red',
          title: `Invalid invite`,
          autoClose: 5000,
        });
        navigate('/register');
      });
  }, [inviteId, navigate]);

  /**
   * Handles input fields in the Registration form
   * @param {*} event text field events
   */
  function onFormChange(event) {
    const newUserChange = {},
      newErrorsChange = {};
    newUserChange[event.target.name] = event.target.value;
    newErrorsChange[event.target.name] = '';
    setUser({ ...user, ...newUserChange });
    setErrors({ ...errors, ...newErrorsChange });
  }

  /**
   * Checks if License Number is a valid license number.
   * Toggles Error if invalid.
   */
  function fetchLicenseNumber() {
    setIsLoading(true);
    fetch('/api/v1/licenses?license=' + user.licenseNumber)
      .then((response) => {
        if (!response.ok) {
          return Promise.reject(response);
        }
        return response.json();
      })
      .then((license) => {
        if (license) {
          const [lastName, name] = license.name.split(', ');
          const match = name.match(/^(\w+)\s*(.*)$/);

          setUser({
            ...user,
            firstName: match[1],
            middleName: match[2],
            lastName,
            licenseNumber: license.licenseNumber,
          });
          setFormState(2);
          setShowLicenseHelper(false);
        }
      })
      .catch((error) => {
        setShowLicenseHelper(true);
        error.json().then((body) => {
          setErrors({ ...errors, licenseNumber: body.message });
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  /**
   * Process the Registration with the Register API
   * Toggles any field errors if any is invalid
   */
  function handleRegister() {
    setErrors({});
    setIsLoading(true);
    fetch('/api/v1/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
      .then((response) => {
        if (!response.ok) {
          return Promise.reject(response);
        }
        return response.json();
      })
      .then(() => {
        setFormState(3);
      })
      .catch((error) => {
        error.json().then(({ message }) => {
          const updatedErrors = new Object();
          message.forEach((m) => {
            if (updatedErrors[m.path]) {
              updatedErrors[m.path] += `. ${m.message}`;
            } else {
              updatedErrors[m.path] = m.message;
            }
          });
          setErrors(updatedErrors);
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div>
      <div className={classes.header}>
        <h2>Interest Form</h2>
        <p>
          description of filling out interest form to start account registration
          process
        </p>
      </div>
      <Flex direction="column" gap="md">
        <RegisterForm
          user={user}
          errors={errors}
          isLoading={isLoading}
          showLicenseHelper={showLicenseHelper}
          onFormChange={onFormChange}
          onSubmit={formState === 1 ? fetchLicenseNumber : handleRegister}
          setShowLicenseHelper={() => {
            setShowLicenseHelper(!showLicenseHelper);
          }}
          formState={formState}
          showLicenseField={
            !inviteId || (inviteId && user.role == 'FIRST_RESPONDER')
          }
        />
      </Flex>
    </div>
  );
}

export default Register;
