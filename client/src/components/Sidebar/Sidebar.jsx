import React from 'react';
import { ActionIcon, Container, Group, ScrollArea } from '@mantine/core';
import {
  IconDashboard,
  IconEmergencyBed,
  IconUsersGroup,
  IconZoomCheck,
  IconQrcode,
  IconUserCircle,
  IconNotification,
  IconSpeakerphone,
  IconSquareArrowRight,
} from '@tabler/icons-react';

import { SidebarNavSection, SidebarLink } from './SidebarNavSection';

import classes from './sidebar.module.css';
import { useAuthorization } from '../../hooks/useAuthorization';

const sections = [
  { label: 'Dashboard', icon: <IconDashboard stroke={2} />, href: '/' },
  {
    label: 'Management',
    icon: null,
    links: [
      {
        label: 'Patients',
        href: '/patients',
        icon: <IconEmergencyBed stroke={2} />,
      },
      {
        label: 'Team Member',
        href: '/admin/users',
        icon: <IconUsersGroup stroke={2} />,
      },
      { label: 'Verification', href: '/', icon: <IconZoomCheck stroke={2} /> },
      {
        label: 'QR Code',
        href: '/admin/patients/generate',
        target: '_blank',
        icon: <IconQrcode stroke={2} />,
      },
    ],
  },
  {
    label: 'Settings',
    icon: null,
    links: [
      { label: 'Account', href: '/', icon: <IconUserCircle stroke={2} /> },
      {
        label: 'Notification',
        href: '/',
        icon: <IconNotification stroke={2} />,
      },
      {
        label: 'Report Issue',
        href: '/',
        icon: <IconSpeakerphone stroke={2} />,
      },
    ],
  },
];

/**
 * Collapsible sidebar
 */
export function Sidebar() {
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
              />
            ) : (
              <SidebarLink {...item} key={`header_${item.label}`} />
            );
          })}
        </div>
      </ScrollArea>
      <AccountFooter />
    </nav>
  );
}

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
      <Group justify="space-between" py="md" px="md">
        <Container px="0">
          <div>
            <strong>{`${user?.firstName} ${user?.lastName}`}</strong>
          </div>
          <div>{user?.email}</div>
        </Container>
        <ActionIcon
          component="a"
          href="/logout"
          onClick={onLogout}
          variant="default"
          aria-label="account"
        >
          <IconSquareArrowRight />
        </ActionIcon>
      </Group>
    </footer>
  );
}
