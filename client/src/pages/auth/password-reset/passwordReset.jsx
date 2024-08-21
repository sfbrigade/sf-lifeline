import React, { useState } from 'react';
import classes from './passwordReset.module.css';
import { Flex } from '@mantine/core';
import { ResetForm } from './ResetForm';

/**
 * Password reset page
 */
function PasswordReset() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState(1);

  function sendPasswordReset() {
    setEmailError(null);
    setIsLoading(true);
    fetch('/api/v1/users/request-password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email }),
    })
      .then((response) => {
        if (!response.ok) {
          return Promise.reject(response);
        }
        setFormState(2);
      })
      .catch((error) => {
        console.log(error);
        error.json().then(({ message }) => {
          setEmailError(message);
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }
  return (
    <div>
      <div className={classes.header}>
        <h2>Forgot Password</h2>
        <p>
          Enter the email associated to your account and we will send a reset
          password link
        </p>
      </div>
      <Flex direction="column" gap="md">
        <ResetForm
          email={email}
          emailError={emailError}
          onEmailChange={(event) => {
            setEmailError(null);
            setEmail(event.target.value);
          }}
          isLoading={isLoading}
          onSubmit={sendPasswordReset}
          formState={formState}
        />
      </Flex>
    </div>
  );
}

export default PasswordReset;
