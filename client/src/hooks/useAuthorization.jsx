import { useContext } from 'react';
import { useMutation } from '@tanstack/react-query';

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

  const loginMutation = useMutation({
    mutationFn: (credentials) => {
      return fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
    },
    onSuccess: (data) => {
      setUser(data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: (userToLogout) => {
      return fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userToLogout),
      });
    },
    onSuccess: () => {
      setUser(null);
    },
  });

  const handleLogin = async (credentials) => {
    loginMutation.mutate(credentials);
  };

  const handleLogout = async () => {
    logoutMutation.mutate(user);
  };

  return {
    user,
    isLoading: loginMutation.isPending || logoutMutation.isPending,
    handleLogin,
    handleLogout,
  };
}
