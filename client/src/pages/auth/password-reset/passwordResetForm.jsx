import React from 'react';
import PropTypes from 'prop-types';
import classes from '../form.module.css';
import { Button, Container, Loader, PasswordInput } from '@mantine/core';

const formProps = {
  form: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  onFormChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  formState: PropTypes.number.isRequired,
  onBackToLogin: PropTypes.func.isRequired,
};

/**
 * Password rest formfor Password Reset page
 * @param {PropTypes.InferProps<typeof formProps>} props
 */
export function PasswordResetForm({
  form,
  errors,
  onFormChange,
  onSubmit,
  isLoading,
  formState,
  onBackToLogin,
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Container size="25rem" className={classes.form}>
        <PasswordInput
          disabled={isLoading || formState == 2}
          name="password"
          label="New Password"
          placeholder="New password"
          value={form.password}
          onChange={onFormChange}
          error={errors.password}
        />
        <PasswordInput
          disabled={isLoading || formState == 2}
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm new password"
          value={form.confirmPassword}
          onChange={onFormChange}
          error={errors.confirmPassword}
        />
        {formState == 1 && (
          <Button
            type="submit"
            disabled={!form.password.length || !form.confirmPassword.length}
          >
            {isLoading ? <Loader size={20} /> : 'Send Password Reset'}
          </Button>
        )}
        {formState == 2 && (
          <>
            <Container size="25rem" styles={{ root: { padding: 0 } }}>
              <div className={classes.formCompletion}>
                <p>
                  Your password jas been successfully reset! You can now log in
                  with your new password. If you have any issues, please contact
                  our support team.
                </p>
              </div>
            </Container>
            <Button onClick={onBackToLogin}>Back to Login</Button>
          </>
        )}
      </Container>
    </form>
  );
}

PasswordResetForm.propTypes = formProps;
