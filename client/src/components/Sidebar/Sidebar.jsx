import React from 'react';
import { Box, Group, ScrollArea } from '@mantine/core';
import {
  TbDashboard as IconDashboard,
  TbEmergencyBed as IconEmergencyBed,
  TbUsersGroup as IconUsersGroup,
  TbZoomCheck as IconZoomCheck,
  TbQrcode as IconQrcode,
  TbUserCircle as IconUserCircle,
  TbNotification as IconNotification,
  TbSpeakerphone as IconSpeakerphone,
} from 'react-icons/tb';
import { FiLogOut } from 'react-icons/fi';
import PropTypes from 'prop-types';

import { SidebarNavSection, SidebarLink } from './SidebarNavSection';

import classes from './Sidebar.module.css';
import { useAuthorization } from '../../hooks/useAuthorization';

const sections = [
  { label: 'Dashboard', icon: <IconDashboard />, href: '/' },
  {
    label: 'Management',
    icon: null,
    links: [
      {
        label: 'Patients',
        href: '/patients',
        icon: <IconEmergencyBed />,
      },
      {
        label: 'Team Member',
        href: '/admin/users',
        icon: <IconUsersGroup />,
      },
      { label: 'Verification', href: '/', icon: <IconZoomCheck /> },
      {
        label: 'QR Code',
        href: '/admin/patients/generate',
        target: '_blank',
        icon: <IconQrcode />,
      },
    ],
  },
  {
    label: 'Settings',
    icon: null,
    links: [
      { label: 'Account', href: '/', icon: <IconUserCircle /> },
      {
        label: 'Notification',
        href: '/',
        icon: <IconNotification />,
      },
      {
        label: 'Report Issue',
        href: '/',
        icon: <IconSpeakerphone />,
      },
    ],
  },
];

const SidebarProps = {
  toggleSidebar: PropTypes.func,
};

/**
 * Collapsible sidebar
 * @param {PropTypes.InferProps<typeof SidebarProps>} props
 */
export function Sidebar({ toggleSidebar }) {
  return (
    <nav className={classes.navbar}>
      <Group align="center" className={classes.title}>
        <img
          src="/logo.svg"
          alt="SF Lifeline Logo"
          width={'30rem'}
          height={'30rem'}
        />
        <p>SF Life Line</p>
      </Group>
      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>
          {sections.map((item) => {
            return item.links?.length > 0 ? (
              <SidebarNavSection
                {...item}
                key={`section_${item.label}`}
                initiallyOpened
                toggleSidebar={toggleSidebar}
              />
            ) : (
              <SidebarLink
                toggleSidebar={toggleSidebar}
                {...item}
                key={`header_${item.label}`}
              />
            );
          })}
        </div>
      </ScrollArea>
      <AccountFooter />
    </nav>
  );
}

Sidebar.propTypes = SidebarProps;

/**
 *
 */
export function AccountFooter() {
  const { user, handleLogout } = useAuthorization();

  /**
   * @param {Event} event
   */
  async function onLogout(event) {
    event.preventDefault();
    handleLogout();
  }

  return (
    <footer className={classes.footer}>
      <Group justify="space-between" align="top">
        <Box fz="sm">
          {user && (
            <>
              <Box fw="bold">{`${user?.firstName} ${user?.lastName}`}</Box>
              <Box c="gray.7">{user?.email}</Box>
            </>
          )}
        </Box>
        <a className={classes.footer__logout} href="/logout" onClick={onLogout}>
          <FiLogOut />
        </a>
      </Group>
    </footer>
  );
}
