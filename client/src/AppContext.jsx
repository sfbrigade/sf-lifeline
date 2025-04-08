import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * @typedef {object} env
 * @property {boolean} FEATURE_COLLECT_PHI set to true to collect PHI
 */
const env = {
  FEATURE_COLLECT_PHI: import.meta.env.VITE_FEATURE_COLLECT_PHI === 'true',
};
if (window.env) {
  env.FEATURE_COLLECT_PHI = window.env.VITE_FEATURE_COLLECT_PHI === 'true';
}

/**
 * @typedef {object} user
 * @property {string} id uuid
 * @property {'ADMIN' | 'STAFF' | 'VOLUNTEER' | 'FIRST_RESPONDER'} role enum
 * @property {string} name user name
 */

/**
 * @typedef {object} lifeLineContext
 * @property {env} env object
 * @property {user | null} user object
 * @property {Function} setUser update function for user
 */

const AppContext = createContext(/** @type {lifeLineContext} */ (null));

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
function AppContextProvider ({ children, initialUser }) {
  const [user, setUser] = useState(initialUser);

  const contextValue = {
    user,
    setUser,
    env,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

AppContextProvider.propTypes = contextProviderProps;

function useAppContext () {
  return useContext(AppContext);
}

export { useAppContext, AppContext, AppContextProvider };

export default AppContext;
