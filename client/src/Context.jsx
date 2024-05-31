import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * @typedef {object} user
 * @property {string} id uuid
 * @property {'ADMIN' | 'STAFF' | 'VOLUNTEER' | 'FIRST_RESPONDER'} role enum
 * @property {string} name user name
 */

/**
 * @typedef {object} lifeLineContext
 * @property {user | null} user object
 */

const Context = createContext(/** @type {lifeLineContext} */ (null));

const contextProviderProps = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

/**
 *
 * @param {PropTypes.InferProps<typeof contextProviderProps>} props
 */
function ContextProvider({ children }) {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  const handleLogin = (user) => {
    setUser(user);
  };

  const contextValue = {
    user,
    setUser,
    handleLogin,
    handleLogout,
  };

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

ContextProvider.propTypes = contextProviderProps;

export { ContextProvider };

export default Context;
