import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuthorization } from '../../hooks/useAuthorization';
import { LoginForm } from './LoginForm';

import classes from './login.module.css';

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
    if (error && !error.ok) {
      console.log(error.status);

      switch (error.status) {
        case 404:
          setEmailError('The email you entered isn’t connected to an account.');
          break;
        case 401:
          setPasswordError('The password you’ve entered is incorrect.');
          break;
        case 403:
          setEmailError('Your account is no longer active.');
          break;
        default:
          setEmailError(`${error.status}: ${error.statusMessage}`);
          break;
      }
    }
  }, [error]);

  return (
    <div className={classes.login}>
      <div className={classes.banner}>Image goes here</div>
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
    </div>
  );
}

export default Login;
