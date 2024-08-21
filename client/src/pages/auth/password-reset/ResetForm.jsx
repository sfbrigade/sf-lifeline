import React from 'react';
import { Button, Container, Loader, TextInput } from '@mantine/core';
import PropTypes from 'prop-types';
import classes from './passwordReset.module.css';

const resetFormProps = {
  email: PropTypes.string.isRequired,
  emailError: PropTypes.string,
  onEmailChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  formState: PropTypes.number.isRequired,
};
/**
 * Reset Form component for Password Reset page
 * @param {PropTypes.InferProps<typeof resetFormProps>} props
 */
export function ResetForm({
  email,
  emailError,
  onEmailChange,
  onSubmit,
  isLoading,
  formState,
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Container size="25rem" className={classes.form}>
        <TextInput
          disabled={isLoading || formState == 2}
          name="email"
          label="Email"
          placeholder="user@email.com"
          value={email}
          onChange={onEmailChange}
          error={emailError}
        />
        {formState == 1 && (
          <Button type="submit" disabled={!email.length}>
            {isLoading ? <Loader size={20} /> : 'Send Password Reset'}
          </Button>
        )}
        {formState == 2 && (
          <Container size="25rem" styles={{ root: { padding: 0 } }}>
            <div className={classes.formCompletion}>
              <p>
                Form Complete! You will receive a confirmation email shortly.
                Acceptance into SF life line will also be sent via the email
                address you submitted.
              </p>
              <p>Save this site to your browser window for convenience.</p>
            </div>
          </Container>
        )}
      </Container>
    </form>
  );
}

ResetForm.propTypes = resetFormProps;
