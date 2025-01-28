import React from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import {
  TextInput,
  PasswordInput,
  Button,
  Container,
  Anchor,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import classes from './login.module.css';

const loginFormProps = {
  email: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  emailError: PropTypes.string,
  passwordError: PropTypes.string,
  onEmailChange: PropTypes.func.isRequired,
  onPasswordChange: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
};

/**
 * Login page component.
 * @param {PropTypes.InferProps<typeof loginFormProps>} props
 */
export function LoginForm ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  emailError,
  passwordError,
  onLogin,
}) {
  const [visible, { toggle }] = useDisclosure(false);

  /**
   *
   * @param {Event} event
   */
  function onSubmit (event) {
    event.preventDefault();
    onLogin();
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <Container size='25rem'>
          <TextInput
            className={classes.email}
            type='email'
            label='Email'
            placeholder='user@email.com'
            value={email}
            onChange={onEmailChange}
            error={emailError}
          />
          <PasswordInput
            className={classes.password}
            label='Password'
            placeholder='password'
            value={password}
            onChange={onPasswordChange}
            visible={visible}
            onVisibilityChange={toggle}
            error={passwordError}
          />
        </Container>
        <Container size='25rem'>
          <Button
            disabled={!email.length || !password.length}
            className={classes.loginBtn}
            variant='filled'
            fullWidth
            type='submit'
          >
            Log in
          </Button>
          <div className={classes.anchor}>
            <Anchor component={Link} to='/password/forgot'>
              Forgot password
            </Anchor>
          </div>
        </Container>
      </form>
    </>
  );
}

LoginForm.propTypes = loginFormProps;
