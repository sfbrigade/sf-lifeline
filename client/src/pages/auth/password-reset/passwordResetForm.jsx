import React from 'react';
import PropTypes from 'prop-types';
import classes from '../form.module.css';
import {
  Button,
  Container,
  Flex,
  Group,
  Loader,
  PasswordInput,
  Progress,
} from '@mantine/core';

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
  const { password } = form;

  const requirements = [
    { re: /[0-9]/, label: 'Includes number' },
    { re: /[a-z]/, label: 'Includes lowercase letter' },
    { re: /[A-Z]/, label: 'Includes uppercase letter' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
  ];

  let multiplier = password.length > 7 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  const strength = Math.max(
    100 - (100 / (requirements.length + 1)) * multiplier,
    0,
  );
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Container size="25rem" className={classes.form}>
        <Group grow>
          <Flex direction="column" gap="xs">
            <PasswordInput
              disabled={isLoading || formState == 2}
              name="password"
              label="New Password"
              placeholder="New password"
              value={form.password}
              onChange={onFormChange}
              error={errors.password}
            />
            <Progress
              value={strength}
              color={
                strength == 100
                  ? 'teal'
                  : strength > 50
                    ? 'yellow'
                    : strength > 20
                      ? 'orange'
                      : 'red'
              }
            />
          </Flex>
        </Group>

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
