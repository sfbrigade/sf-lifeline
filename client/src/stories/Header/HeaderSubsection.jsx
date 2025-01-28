import React from 'react';
import PropTypes from 'prop-types';
import { UnstyledButton, Center, Box, Collapse, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import classes from './header.module.css';

const HeaderSubsectionProps = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.node,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
      icon: PropTypes.node,
    })
  ).isRequired,
};

/**
 *
 * @param {PropTypes.InferProps<typeof HeaderSubsectionProps>} props
 */
export const HeaderSubsection = ({ label, icon, links }) => {
  const [isOpen, { toggle: toggleLinks }] = useDisclosure(false);

  return (
    <React.Fragment key={label}>
      <UnstyledButton className={classes.link} onClick={toggleLinks}>
        <Center inline>
          <div>{icon}</div>
          <Box component='span' mr={5}>
            {label}
          </Box>
        </Center>
      </UnstyledButton>
      <Collapse in={isOpen}>
        {links.map(({ label, icon, link }) => (
          <NavLink
            key={`nav_link_${label}`}
            href={link}
            label={label}
            leftSection={icon}
          />
        ))}
      </Collapse>
    </React.Fragment>
  );
};

HeaderSubsection.propTypes = HeaderSubsectionProps;
