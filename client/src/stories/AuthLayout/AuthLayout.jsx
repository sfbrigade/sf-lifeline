import React from 'react';
import { Outlet } from 'react-router-dom';
import { Image, Text, Title } from '@mantine/core';

import classes from './AuthLayout.module.css';

/**
 * Auth Layout for login, register, password reset
 */
export default function AuthLayout() {
  return (
    <div className={classes.authLayout}>
      <div className={classes.banner}>
        <Image w={60} h={60} src="/logo.svg" m="4rem auto 1.5rem" />
        <Title order={1} ta="center" mb="0.5rem">
          SF Life Line
        </Title>
        <Text maw={300} ta="center" m="0 auto">
          SF Life Line is a tool to help first responders provide more efficient
          and equitable care to patients.
        </Text>
      </div>
      <div className={classes.form}>
        <Outlet />
      </div>
    </div>
  );
}
