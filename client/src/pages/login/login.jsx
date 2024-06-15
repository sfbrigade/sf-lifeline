import React, { useState } from 'react';
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
  const { handleLogin } = useAuthorization();

  const login = () => {
    let isValid = true;
    if (!email) {
      setEmailError('Invalid email');
      isValid = false;
    }
    if (!password) {
      setPasswordError('Invalid password');
      isValid = false;
    }
    if (isValid) {
      handleLogin({ email, password });
    }
  };

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
