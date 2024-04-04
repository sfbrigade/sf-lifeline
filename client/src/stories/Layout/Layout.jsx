import React from 'react';
import PropTypes from 'prop-types';

import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';

import './layout.css';

/**
 * Main layout
 * @param {PropTypes.InferProps<typeof LayoutProps>} props
 */
export const Layout = ({ children }) => {
  return (
    <div className="layout">
      <div className="layout-header">
        <Header />
      </div>
      <div
        className="layout-content">{children}</div>
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
