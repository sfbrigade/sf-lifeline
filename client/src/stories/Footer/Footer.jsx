import React from 'react';
import { Group, Button } from '@mantine/core';

import { useAuthorization } from '../../hooks/useAuthorization';

import classes from './footer.module.css';

/**
 *
 */
export function Footer() {
  const { user } = useAuthorization();

  return (
    <footer className={classes.footer}>
      <Group justify="space-between" py="md" px="sm">
        <div>
          <div>
            <strong>{`${user?.firstName} ${user?.lastName}`}</strong>
          </div>
          <div>{user?.email}</div>
        </div>
        <Button>G</Button>
      </Group>
    </footer>
  );
}
