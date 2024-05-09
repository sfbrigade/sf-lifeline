import React from 'react';
import PropTypes from 'prop-types';
import {
  Group,
  Button,
  ScrollArea,
  Box,
  Burger,
  Drawer,
  rem,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import classes from './header.module.css';
import { Sidebar } from '../../components/Sidebar/Sidebar';

/**
 * Buttons for logged out buttons
 * @param {PropTypes.InferProps<typeof HeaderProps>} props
 */
export function Header({ user, onLogin, onCreateAccount }) {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);

  return (
    <Box>
      <header className={classes.header}>
        <Group justify="end" h="100%">
          {user ? (
            <Group visibleFrom="sm">
              <Button variant="default">Alerts</Button>
              <Button>Profile</Button>
            </Group>
          ) : (
            <LoggedOutButtons
              visibleFrom="sm"
              onLogin={onLogin}
              onCreateAccount={onCreateAccount}
            />
          )}

          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            hiddenFrom="sm"
          />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1}
        position="left"
        className={classes.header_drawer}
      >
        <ScrollArea
          className={classes.drawerBody}
          h={`calc(100vh - ${rem(80)})`}
          mx="-md"
        >
          <Sidebar />
        </ScrollArea>
      </Drawer>
    </Box>
  );
}

const HeaderProps = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }),
  onLogin: PropTypes.func.isRequired,
  onCreateAccount: PropTypes.func.isRequired,
};

Header.propTypes = HeaderProps;
Header.defaultProps = {
  user: null,
};

const LoggedOutButtonsProps = {
  onLogin: PropTypes.func.isRequired,
  onCreateAccount: PropTypes.func.isRequired,
};

/**
 * Buttons for logged out buttons
 * @param {PropTypes.InferProps<typeof LoggedOutButtonsProps>} props
 */
const LoggedOutButtons = ({ onLogin, onCreateAccount, ...groupProps }) => {
  return (
    <Group {...groupProps}>
      <Button variant="default" onClick={onLogin}>
        Log in
      </Button>
      <Button onClick={onCreateAccount}>Sign up</Button>
    </Group>
  );
};
LoggedOutButtons.propTypes = LoggedOutButtonsProps;
