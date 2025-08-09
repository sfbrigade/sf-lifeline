import { Flex, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import classes from '../form.module.css';
import { PasswordResetForm } from './passwordResetForm';

/**
 * Password reset page
 */
function PasswordReset () {
  const { passwordResetToken } = useParams();
  const navigate = useNavigate();
  const { isFetching } = useQuery({
    queryFn: () =>
      fetch('/api/v1/auth/password/' + passwordResetToken, {
        method: 'GET',
      })
        .then((response) => {
          if (!response.ok) {
            return Promise.reject(response);
          }
        })
        .catch((error) => {
          error.json().then(({ message }) => {
            notifications.show({
              color: 'red',
              title: message,
              autoClose: 5000,
            });
          });
          navigate('/');
        }),
    refetchOnWindowFocus: false,
  });
  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState(1);

  /**
   * Handles input fields in the form
   * @param {*} event text field events
   */
  function onFormChange (event) {
    const newFormChange = {};
    const newErrorsChange = {};
    newFormChange[event.target.name] = event.target.value;
    newErrorsChange[event.target.name] = '';
    setForm({ ...form, ...newFormChange });
    setErrors({ ...errors, ...newErrorsChange });
  }

  /**
   * API call to reset password
   */
  function resetPassword () {
    setErrors({});
    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    fetch('/api/v1/auth/password', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        passwordResetToken,
        password: form.password,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return Promise.reject(response);
        }
      })
      .then(() => {
        setFormState(2);
      })
      .catch((error) => {
        error.json().then((payload) => {
          const message = payload.message.filter((item) => item.path === 'password').map((item) => item.message).join(', ');
          setErrors({ password: message });
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div>
      <LoadingOverlay
        visible={isFetching}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      {!isFetching && (
        <>
          <div className={classes.header}>
            <h2>Reset Password</h2>
            <p>Enter a new password below to change your password</p>
          </div>
          <Flex direction='column' gap='md'>
            <PasswordResetForm
              form={form}
              errors={errors}
              isLoading={isLoading}
              onFormChange={onFormChange}
              onSubmit={resetPassword}
              formState={formState}
              onBackToLogin={() => navigate('/login')}
            />
          </Flex>
        </>
      )}
    </div>
  );
}

export default PasswordReset;
