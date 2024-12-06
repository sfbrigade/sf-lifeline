import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { StatusCodes } from 'http-status-codes';

import { useAuthorization } from '../../../hooks/useAuthorization';
import { LoginForm } from './LoginForm';

import classes from '../form.module.css';

/**
 * Login page component.
 */
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const { handleLogin, error } = useAuthorization();
  const location = useLocation();

  const login = async () => {
    setEmailError(null);
    setPasswordError(null);
    const { redirectTo } = location.state ?? {};
    await handleLogin({ email, password, redirectTo });
  };

  useEffect(() => {
    if (error && error.status != StatusCodes.OK) {
      switch (error.status) {
        case StatusCodes.NOT_FOUND:
          setEmailError('The email you entered isn’t connected to an account.');
          break;
        case StatusCodes.UNAUTHORIZED:
          setPasswordError('The password you’ve entered is incorrect.');
          break;
        case StatusCodes.FORBIDDEN:
          setEmailError(error.message);
          break;
        default:
          setEmailError(`${error.status}: ${error.message}`);
          break;
      }
    }
  }, [error]);

  return (
    <div>
      <h2 className={classes.header}>Login</h2>
      <LoginForm
        email={email}
        onEmailChange={(event) => {
          setEmailError(null);
          setEmail(event.target.value);
        }}
        emailError={emailError}
        password={password}
        onPasswordChange={(event) => {
          setPasswordError(null);
          setPassword(event.target.value);
        }}
        passwordError={passwordError}
        onLogin={login}
      />
    </div>
  );
}

export default Login;
