import React from 'react';
import PropTypes from 'prop-types';

import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';
import { Sidebar } from '../../components/Sidebar/Sidebar.jsx';

import './layout.css';

/**
 * Main layout
 * @param {PropTypes.InferProps<typeof LayoutProps>} props
 */
export const Layout = ({ children }) => {
  const [user, setUser] = React.useState(null);
  return (
    <div className="layout">
      <div className="layout-sidebar">
        <Sidebar />
      </div>
      <div className="layout-header">
        <Header
          user={user}
          onCreateAccount={() => {
            setUser({ name: 'John Doe' });
          }}
          onLogin={() => {
            setUser({ name: 'Jane Doe' });
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

const LayoutProps = {
  children: PropTypes.node,
};

Layout.propTypes = LayoutProps;

Layout.defaultProps = {
  children: null,
};
