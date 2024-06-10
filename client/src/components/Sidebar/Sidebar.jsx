import React from 'react';
import { ScrollArea } from '@mantine/core';
import {
  IconDashboard,
  IconEmergencyBed,
  IconUsersGroup,
  IconZoomCheck,
  IconQrcode,
  IconUserCircle,
  IconNotification,
  IconSpeakerphone,
} from '@tabler/icons-react';

import { SidebarNavSection, SidebarLink } from './SidebarNavSection';

import classes from './sidebar.module.css';

const sections = [
  { label: 'Dashboard', icon: <IconDashboard stroke={2} />, href: '/' },
  {
    label: 'Management',
    icon: null,
    links: [
      { label: 'Patient', href: '/', icon: <IconEmergencyBed stroke={2} /> },
      { label: 'Team Member', href: '/', icon: <IconUsersGroup stroke={2} /> },
      { label: 'Verification', href: '/', icon: <IconZoomCheck stroke={2} /> },
      { label: 'QR Code', href: '/', icon: <IconQrcode stroke={2} /> },
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
    </nav>
  );
}
