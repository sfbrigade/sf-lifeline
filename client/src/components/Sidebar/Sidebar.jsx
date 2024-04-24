import React from 'react';
import { ScrollArea } from '@mantine/core';

import { SidebarNavSection, SidebarLink } from './SidebarNavSection';

import classes from './sidebar.module.css';

const sections = [
  { label: 'Dashboard', icon: '🚘', href: '/' },
  {
    label: 'Management',
    icon: '🗄️',
    links: [
      { label: 'Patient', href: '/', icon: '👩‍🦳' },
      { label: 'Team Member', href: '/', icon: '👩‍⚕️' },
      { label: 'Verification', href: '/', icon: '📺' },
      { label: 'QR Code', href: '/', icon: '📱' },
    ],
  },
  {
    label: 'Settings',
    icon: '⚙️',
    links: [
      { label: 'Account', href: '/', icon: '💼' },
      { label: 'Notification', href: '/', icon: '📢' },
      { label: 'Report Issue', href: '/', icon: '🚨' },
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
