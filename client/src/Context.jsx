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
 * @property {Function} setUser update function for user
 */

const Context = createContext(/** @type {lifeLineContext} */ (null));

const contextProviderProps = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  initialUser: PropTypes.object,
};

/**
 *
 * @param {PropTypes.InferProps<typeof contextProviderProps>} props
 */
function ContextProvider ({ children, initialUser }) {
  const [user, setUser] = useState(initialUser);

  const contextValue = {
    user,
    setUser,
  };

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

ContextProvider.propTypes = contextProviderProps;

export { ContextProvider };

export default Context;
