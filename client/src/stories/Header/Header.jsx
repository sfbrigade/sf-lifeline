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
 * @param {PropTypes.InferProps<typeof headerProps>} props
 */
export function Header({ user }) {
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
            <LoggedOutButtons visibleFrom="sm" />
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
          scrollbars="y"
        >
          <Sidebar />
        </ScrollArea>
      </Drawer>
    </Box>
  );
}

const headerProps = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }),
};

Header.propTypes = headerProps;
Header.defaultProps = {
  user: null,
};

const loggedOutButtonsProps = {};

/**
 * Buttons for logged out buttons
 * @param {PropTypes.InferProps<typeof loggedOutButtonsProps>} props
 */
const LoggedOutButtons = ({ ...groupProps }) => {
  return (
    <Group {...groupProps}>
      <Button variant="default" component="a" href="/login">
        Log in
      </Button>
      <Button component="a" href="/login">
        Sign up
      </Button>
    </Group>
  );
};
LoggedOutButtons.propTypes = loggedOutButtonsProps;
