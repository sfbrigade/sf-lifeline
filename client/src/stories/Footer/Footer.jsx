import React from 'react';
import PropTypes from 'prop-types';
import { Container, Group, Anchor } from '@mantine/core';
import './footer.css';

const links = [
  { link: '#', label: 'Contact' },
  { link: '#', label: 'Privacy' },
  { link: '#', label: 'Blog' },
  { link: '#', label: 'Careers' },
];

/**
 * Footer
 * @param {PropTypes.InferProps<typeof FooterProps>} props
 */
export const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Group className="links">
          {links.map((link) => (
            <Anchor
              c="dimmed"
              key={link.label}
              href={link.link}
              onClick={(event) => event.preventDefault()}
              size="sm"
            >
              {link.label}
            </Anchor>
          ))}
        </Group>
      </Container>
    </footer>
  );
};

const FooterProps = {
  children: PropTypes.node,
};

Footer.propTypes = FooterProps;

Footer.defaultProps = {
  children: null,
};
