import React from 'react';
import { Outlet } from 'react-router-dom';

import classes from './authlayout.module.css';

/**
 * Auth Layout for login, register, password reset
 */
export default function AuthLayout() {
  return (
    <div className={classes['auth-layout']}>
      <div className={classes.banner}>testing</div>
      <div className={classes.form}>
        <Outlet />
      </div>
    </div>
  );
}
