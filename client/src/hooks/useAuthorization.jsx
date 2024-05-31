import { useContext, useCallback, useState } from 'react';
// import { useMutation } from '@tanstack/react-query';

import Context from '../Context';

/*globals user*/

/**
 *
 * @returns {{
 *  user: user,
 *  isLoading: boolean,
 *  handleLogin: (credentials: any) => Promise<void>,
 *  handleLogout: () => Promise<void>,
 * }}
 */
export function useAuthorization() {
  const { user, setUser } = useContext(Context);
  const [isLoading, setIsLoading] = useState(false);

  // const mutation = useMutation({
  //   mutationFn: (event) => {
  //     event.preventDefault();
  //     return fetch('/api/v1/users', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({}),
  //     });
  //   },
  // });

  const handleLogin = useCallback(
    async (credentials) => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsLoading(false);
        return true;
      } catch (error) {
        setIsLoading(false);
        return false;
      }
    },
    [setUser],
  );

  const handleLogout = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/auth/logout');
      setIsLoading(false);
      if (response.status === 200) {
        setUser(null);
        return true;
      }
      return false;
    } catch (error) {
      setIsLoading(false);
    }
  }, [setUser]);

  return {
    user,
    isLoading,
    // mutation,
    handleLogin,
    handleLogout,
  };
}
