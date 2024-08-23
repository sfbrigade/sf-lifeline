import React, { useState } from 'react';
import formClasses from '../form.module.css';
import { RegisterForm } from './RegisterForm';
import { Flex } from '@mantine/core';

/**
 * Register page component
 */
function Register() {
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
      <div className={formClasses.header}>
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
        />
      </Flex>
    </div>
  );
}

export default Register;
