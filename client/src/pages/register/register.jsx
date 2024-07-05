import React, { useCallback, useState } from 'react';
import classes from './register.module.css';
import { RegistrationForm } from './RegisterForm';
import { Container, Flex } from '@mantine/core';

function Register() {
  const [user, setUser] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    licenseNumber: '',
  });
  const [errors, setErrors] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    licenseNumber: '',
  });

  const [showLicenseHelper, setShowLicenseHelper] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState(1);

  function onFormChange(event) {
    const newUserChange = {},
      newErrorsChange = {};
    newUserChange[event.target.name] = event.target.value;
    newErrorsChange[event.target.name] = '';
    setUser({ ...user, ...newUserChange });
    setErrors({ ...errors, ...newErrorsChange });
  }

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
          setUser({ ...user, licenseNumber: license.licenseNumber });
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

  function handleRegister() {
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
      .then((result) => {
        console.log('success', result);
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
      });
  }

  return (
    <div className={classes.register}>
      <div className={classes.banner}>Image goes here</div>
      <div>
        <div className={classes.header}>
          <h2>Interest Form</h2>
          <p>
            description of filling out interest form to start account
            registration process
          </p>
        </div>
        <Flex direction="column" gap="md">
          <RegistrationForm
            user={user}
            errors={errors}
            isLoading={isLoading}
            onFormChange={onFormChange}
            onSubmit={formState === 1 ? fetchLicenseNumber : handleRegister}
            setShowLicenseHelper={() => {
              setShowLicenseHelper(!showLicenseHelper);
            }}
            formState={formState}
          />
          <Container hidden={!showLicenseHelper} size="25rem">
            <div className={classes.licenseHelper}>
              <h3>License not found?</h3>
              <p>
                Contact{' '}
                <a href="mailto:admin@SFLifeline.com">admin@SFLifeline.com</a>{' '}
                if we have made a mistake.
              </p>
              <h3>Don't have a license?</h3>
              <p>
                Sign up to volunteer! Email{' '}
                <a href="mailto:admin@SFLifeline.com">admin@SFLifeline.com</a>{' '}
                with your name and contact information.
              </p>
            </div>
          </Container>
        </Flex>
      </div>
    </div>
  );
}

export default Register;
