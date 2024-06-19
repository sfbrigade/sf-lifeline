import React from 'react';
import { Container, Group, Anchor, Button } from '@mantine/core';

import { useAuthorization } from '../../hooks/useAuthorization';

import classes from './footer.module.css';

const links = [
  { link: '#', label: 'Contact' },
  { link: '#', label: 'Privacy' },
  { link: '#', label: 'Blog' },
  { link: '#', label: 'Careers' },
];

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
