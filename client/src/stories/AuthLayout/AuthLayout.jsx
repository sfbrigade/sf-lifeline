import React from 'react';
import { Outlet } from 'react-router-dom';

import classes from './AuthLayout.module.css';

/**
 * Auth Layout for login, register, password reset
 */
export default function AuthLayout() {
  return (
    <div className={classes.authLayout}>
      <div className={classes.banner}>testing</div>
      <div className={classes.form}>
        <Outlet />
      </div>
    </div>
  );
}
