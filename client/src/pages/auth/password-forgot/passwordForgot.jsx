import React, { useState } from 'react';
import classes from './passwordForgot.module.css';
import { Flex } from '@mantine/core';
import { PasswordForgotForm } from './PasswordForgotForm';

/**
 * Password reset page
 */
function PasswordForgot() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState(1);

  /**
   * Password Reset Page
   */
  function sendPasswordReset() {
    setEmailError(null);
    setIsLoading(true);
    fetch('/api/v1/users/request-password-reset', {
      method: 'PATCH',
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
        <PasswordForgotForm
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

export default PasswordForgot;
