import React from 'react';
import { NavLink as RouterNavLink } from 'react-router';
import { Box, Group, NavLink, Stack, Text, Title } from '@mantine/core';
import {
  // TbHealthRecognition,
  TbHeartHandshake,
  // TbMessageReport,
  // TbNotebook,
  TbQrcode,
  // TbSettings,
} from 'react-icons/tb';
import { FiLogOut, FiUsers } from 'react-icons/fi';
import { LuLayoutDashboard } from 'react-icons/lu';
import PropTypes from 'prop-types';

import classes from './Sidebar.module.css';
import { useAuthorization } from '../../hooks/useAuthorization';

const sections = [
  {
    label: 'Admin panel',
    icon: null,
    links: [
      {
        label: 'Dashboard',
        icon: <LuLayoutDashboard className={classes.navbar__icon} />,
        href: '/',
      },
      {
        label: 'QR Code',
        href: '/admin/patients/generate',
        target: '_blank',
        icon: <TbQrcode className={classes.navbar__icon} />,
      },
    ],
  },
  {
    label: 'Management',
    icon: null,
    links: [
      // {
      //   label: 'Events',
      //   href: '/',
      //   icon: <TbHealthRecognition className={classes.navbar__icon} />,
      // },
      {
        label: 'Members',
        href: '/admin/users',
        icon: <FiUsers className={classes.navbar__icon} />,
      },
      {
        label: 'Patients',
        href: '/patients',
        icon: <TbHeartHandshake className={classes.navbar__icon} />,
      },
    ],
  },
  // {
  //   label: 'Settings',
  //   icon: null,
  //   links: [
  //     { label: 'Resources', href: '/', icon: <TbNotebook className={classes.navbar__icon} /> },
  //     {
  //       label: 'Settings',
  //       href: '/',
  //       icon: <TbSettings className={classes.navbar__icon} />,
  //     },
  //     {
  //       label: 'Report Issue',
  //       href: '/',
  //       icon: <TbMessageReport className={classes.navbar__icon} />,
  //     },
  //   ],
  // },
];

const SidebarProps = {
  toggleSidebar: PropTypes.func,
};

/**
 * Collapsible sidebar
 * @param {PropTypes.InferProps<typeof SidebarProps>} props
 */
export function Sidebar({ toggleSidebar }) {
  const { user, handleLogout } = useAuthorization();

  /**
   * @param {Event} event
   */
  async function onLogout(event) {
    event.preventDefault();
    handleLogout();
  }

  return (
    <>
      <Stack justify="space-between" px="md" py="xl" w="100%" h="100%">
        <Box>
          <Group align="center" gap="sm" mb="lg">
            <img
              src="/logo.svg"
              alt="SF Lifeline Logo"
              width={'32rem'}
              height={'32rem'}
            />
            <Title order={4}>SF Life Line</Title>
          </Group>
          {sections.map((section) => (
            <Box key={section.label} mb="lg">
              <Title fw="normal" pl="sm" order={6}>
                {section.label}
              </Title>
              {section.links?.map((link) => (
                <NavLink
                  key={link.label}
                  component={RouterNavLink}
                  to={link.href}
                  label={
                    <Text fz="md" fw="600">
                      {link.label}
                    </Text>
                  }
                  leftSection={link.icon}
                  target={link.target}
                  onClick={toggleSidebar}
                />
              ))}
            </Box>
          ))}
        </Box>
        <Group className={classes.footer} justify="space-between" align="top">
          <Box fz="sm">
            {user && (
              <>
                <Box fw="600">{`${user?.firstName} ${user?.lastName}`}</Box>
                <Box c="gray.7">{user?.email}</Box>
              </>
            )}
          </Box>
          <a
            className={classes.footer__logout}
            href="/logout"
            onClick={onLogout}
          >
            <FiLogOut />
          </a>
        </Group>
      </Stack>
    </>
  );
}

Sidebar.propTypes = SidebarProps;
