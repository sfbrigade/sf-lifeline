import React from 'react';
import { Outlet } from 'react-router-dom';

import './authlayout.css';
/**
 * Auth Layout for login, register, password reset
 */
export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="banner">testing</div>
      <div className="form">
        <Outlet />
      </div>
    </div>
  );
}
