import React from 'react';
import { Outlet } from 'react-router';

import { Header } from '../Header/Header';
import { Sidebar } from '../../components/Sidebar/Sidebar.jsx';

import { useAuthorization } from '../../hooks/useAuthorization';

import classes from './layout.module.css';

/**
 * Main layout
 */
export const Layout = () => {
  const { user } = useAuthorization();
  return (
    <div className={classes.layout}>
      <div className={classes.layout__sidebar}>
        <Sidebar />
      </div>
      <div className={classes.layout__header}>
        <Header user={user} />
      </div>
      <div className={classes.layout__content}>
        <Outlet />
      </div>
    </div>
  );
};
