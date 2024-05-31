import React from 'react';
import PropTypes from 'prop-types';

import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';
import { Sidebar } from '../../components/Sidebar/Sidebar.jsx';

import { useAuthorization } from '../../hooks/useAuthorization';

import './layout.css';

/**
 * Main layout
 * @param {PropTypes.InferProps<typeof layoutProps>} props
 */
export const Layout = ({ children }) => {
  const { user, handleLogin } = useAuthorization();
  return (
    <div className="layout">
      <div className="layout-sidebar">
        <Sidebar />
      </div>
      <div className="layout-header">
        <Header
          user={user}
          onCreateAccount={() => {
            handleLogin({ name: 'John Doe' });
          }}
          onLogin={() => {
            handleLogin({
              email: 'admin.user@test.com',
              password: 'Abcd1234!',
            });
          }}
        />
      </div>
      <div className="layout-content">{children}</div>
      <div className="layout-footer">
        <Footer />
      </div>
    </div>
  );
};

const layoutProps = {
  children: PropTypes.node,
};

Layout.propTypes = layoutProps;

Layout.defaultProps = {
  children: null,
};
