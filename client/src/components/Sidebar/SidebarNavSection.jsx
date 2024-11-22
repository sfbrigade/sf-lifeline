import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Group, Box, Text, UnstyledButton, Collapse } from '@mantine/core';

import classes from './sidebar.module.css';

const SidebarNavSectionProps = {
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
  initiallyOpened: PropTypes.bool,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node,
      href: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  toggleSidebar: PropTypes.func,
};
/**
 * Sidebar section of sublinks with a collapsible accordion header
 * @param {PropTypes.InferProps<typeof SidebarNavSectionProps>} props
 */
export function SidebarNavSection({
  icon,
  label,
  initiallyOpened = false,
  links = [],
  toggleSidebar,
}) {
  const [opened, setOpened] = useState(initiallyOpened);

  return (
    <>
      <UnstyledButton
        onClick={() => setOpened((o) => !o)}
        className={classes.sectionHeaderButton}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            <Box className={classes.label} ml="xs">
              {label}
            </Box>
          </Box>
        </Group>
      </UnstyledButton>

      <Collapse in={opened} className={classes.section}>
        {links.map((link) => (
          <div className={classes.sublink} key={link.label}>
            <SidebarLink toggleSidebar={toggleSidebar} {...link} />
          </div>
        ))}
      </Collapse>
    </>
  );
}

SidebarNavSection.propTypes = SidebarNavSectionProps;

const SidebarLinkProps = {
  icon: PropTypes.node,
  href: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  target: PropTypes.string,
  toggleSidebar: PropTypes.func,
};

/**
 * Navigation link for sidebar
 * @param {PropTypes.InferProps<typeof SidebarLinkProps>} props
 */
export function SidebarLink({
  icon,
  href,
  label,
  target = '_self',
  toggleSidebar,
}) {
  return (
    <div className={classes.sublink}>
      <div>{icon}</div>
      <Text
        onClick={toggleSidebar}
        component={Link}
        className={classes.link}
        to={href}
        target={target}
      >
        {label}
      </Text>
    </div>
  );
}

SidebarLink.propTypes = SidebarLinkProps;
