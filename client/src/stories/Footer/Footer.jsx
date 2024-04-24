import React from 'react';
import { Container, Group, Anchor } from '@mantine/core';
import './footer.css';

const links = [
  { link: '#', label: 'Contact' },
  { link: '#', label: 'Privacy' },
  { link: '#', label: 'Blog' },
  { link: '#', label: 'Careers' },
];

/**
 * Basic Footer component
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
